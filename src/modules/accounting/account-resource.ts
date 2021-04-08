import { IAccount, IAccountBase } from './accounting-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { InvalidStateError } from '../../global/errors';
import { UserController } from '../user/user-resource';
import { hasPermissions } from '../auth/auth-resource';


const maker = new ResourceMaker<IAccountBase, IAccount>('Account');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    index: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'balance',
    type: 'number',
    title: 'موجودی',
    required: true
  },
  {
    key: 'acceptsInput',
    type: 'boolean',
    title: 'ورودی',
    default: false
  },
  {
    key: 'acceptsOutput',
    type: 'boolean',
    title: 'خروجی',
    default: false
  },
  {
    key: 'allowNegativeBalance',
    type: 'boolean',
    title: 'قابل منفی شدن',
    default: false
  },
  {
    key: 'meta',
    type: 'object',
    title: 'اطلاعات',
    default: {},
    hidden: true
  },
]);

export const AccountModel      = maker.getModel();
export const AccountController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.account.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.account.list-count'] },
  { // retrieve
    template: 'RETRIEVE',
    permissionFunction: async ({ user, resourceId }) => {
      if (hasPermissions(user?.permissions ?? [], ['admin.account.retrieve'])) return true;
      const account = await AccountController.retrieve({ resourceId });
      return account.user === String(user?._id);
    }
  },
  // { template: 'CREATE' },
  // { template: 'UPDATE' },
  {
    template: 'DELETE',
    permissions: ['admin.account.delete'],
    stateValidator: async ({ resourceId }) => {

      const account = await AccountController.retrieve({ resourceId });

      const usersCount = await UserController.count({ filters: { _id: account.user } });
      if (usersCount !== 0) throw new InvalidStateError('there is a user for this account');

    }
  }
]);

export const AccountRouter = maker.getRouter();


// create account for each user
YEventManager.on(['Resource', 'User', 'Created'], async (userId: string) => {
  await AccountController.create({
    payload: {
      title: '',
      user: userId,
      balance: 0,
      acceptsInput: true,
      acceptsOutput: true
    }
  });
});

export async function getGlobalSourceAccount() {
  return AccountController.findOne({
    filters: { 'meta.globalSource': true }
  });
}

export async function getGlobalDrainAccount() {
  return AccountController.findOne({
    filters: { 'meta.globalDrain': true }
  });
}

export async function getAccountForUser(userId: string) {
  return AccountController.findOne({
    filters: { user: userId }
  });
}

// setup global accounts
(async () => {

  try {
    await getGlobalSourceAccount();
  }
  catch {
    await AccountController.create({
      payload: {
        title: 'Global Source',
        user: undefined,
        balance: 0,
        acceptsInput: false,
        acceptsOutput: true,
        allowNegativeBalance: true,
        meta: {
          globalSource: true,
        }
      }
    });
  }

  try {
    await getGlobalDrainAccount();
  }
  catch {
    await AccountController.create({
      payload: {
        title: 'Global Drain',
        user: undefined,
        balance: 0,
        acceptsInput: true,
        acceptsOutput: false,
        meta: {
          globalDrain: true
        }
      }
    });
  }

})();
