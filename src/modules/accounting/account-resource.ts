import { IAccount, IAccountBase } from './accounting-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { InvalidStateError, NotFoundError } from '../../global/errors';
import { UserController } from '../user/user-resource';
import { FactorController } from '../payment/factor-resource';
import { createPayTicket } from '../payment/pay-ticket-resource';


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


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.account.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.account.list-count'] },
  { // retrieve
    template: 'RETRIEVE',
    permissionFunction: async ({ user, resourceId, hasPermission }) => {
      if (hasPermission('admin.account.retrieve')) return true;
      const account = await AccountController.retrieve({ resourceId });
      return account.user === String(user?._id);
    }
  },
  { template: 'CREATE', permissions: ['admin.account.create'] },
  { template: 'UPDATE', permissions: ['admin.account.update'] },
  { // delete
    template: 'DELETE',
    permissions: ['admin.account.delete'],
    stateValidator: async ({ resourceId }) => {

      const account = await AccountController.retrieve({ resourceId });

      const usersCount = await UserController.count({ filters: { _id: account.user } });
      if (usersCount !== 0) throw new InvalidStateError('there is a user for this account', 'این اکانت کاربر دارد.');

    }
  },
  { // retrieve mine
    method: 'GET',
    path: '/retrieve/mine',
    signal: ['Route', 'Account', 'Mine'],
    permission: 'user.account.retrieve',
    dataProvider: async ({ user }) => {

      const account = await AccountController.findOne({
        filters: {
          user: user!._id
        }
      });

      if (!account) {
        throw new NotFoundError();
      }

      return account;

    }
  },
  { // charge balance
    method: 'POST',
    path: '/balance/charge',
    signal: ['Route', 'Account', 'ChargeBalance'],
    permission: 'user.account.charge-balance',
    dataProvider: async ({ user, payload }) => {

      const { amount, returnUrl } = payload;

      const account = await AccountController.findOne({
        filters: {
          user: user!._id
        }
      });

      const factor = await FactorController.create({
        payload: {
          user: user!._id,
          name: `شارژ حساب ${user!.name} به میزان ${amount} زیال`,
          amount,
          meta: {
            reason: 'account-charge',
            account: String(account._id),
            amount
          }
        }
      });

      const payticket = await createPayTicket(String(factor._id), 'parsian', returnUrl);
      return payticket.payUrl;

    }
  },
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

export async function getApiConsumeAccount() {
  return AccountController.findOne({
    filters: { 'meta.apiConsume': true }
  });
}

export async function getApiRequestAccount() {
  return AccountController.findOne({
    filters: { 'meta.apiRequest': true }
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
        title: 'ورودی اصلی',
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
        title: 'خروجی اصلی',
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

  try {
    await getApiConsumeAccount();
  }
  catch {
    await AccountController.create({
      payload: {
        title: 'مصرف Api',
        user: undefined,
        balance: 0,
        acceptsInput: true,
        acceptsOutput: true,
        meta: {
          apiConsume: true
        }
      }
    });
  }

  try {
    await getApiRequestAccount();
  }
  catch {
    await AccountController.create({
      payload: {
        title: 'درخواست Api',
        user: undefined,
        balance: 0,
        acceptsInput: true,
        acceptsOutput: true,
        meta: {
          apiRequest: true
        }
      }
    });
  }

})();
