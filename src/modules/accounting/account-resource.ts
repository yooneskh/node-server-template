import { IAccountBase } from './accounting-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-router-enums';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { ForbiddenAccessError, InvalidRequestError, InvalidStateError } from '../../global/errors';
import { ProductController } from '../shop/product-resource';
import { FactorController, ProductOrderController } from '../shop/factor-resource';
import { createPayTicket } from '../shop/pay-ticket-resource';
import { UserController } from '../user/user-resource';


const maker = new ResourceMaker<IAccountBase>('Account');

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
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  // { template: ResourceActionTemplate.CREATE },
  // { template: ResourceActionTemplate.UPDATE },
  {
    template: ResourceActionTemplate.DELETE,
    stateValidator: async ({ resourceId }) => {

      const account = await AccountController.retrieve({ resourceId });

      const usersCount = await UserController.count({
        filters: {
          _id: account.user
        }
      });

      if (usersCount !== 0) throw new InvalidStateError('there is a user for this account');

    }
  },
  {
    method: ResourceActionMethod.POST,
    path: '/charge',
    signal: ['Route', 'Account', 'Charge'],
    payloadValidator: async ({ payload }) => {
      if (!(payload.balance > 0)) throw new InvalidRequestError('wrong charge balance');
    },
    permissionFunction: async ({ user }) => !!user,
    dataProvider: async ({ user, payload }) => {
      if (!user) throw new ForbiddenAccessError();

      const account = await AccountController.findOne({
        filters: { user: user._id }
      });

      const product = await ProductController.create({
        payload: {
          title: `شارژ اکانت برای ${user.name}`,
          price: payload.amount
        }
      });

      const factor = await FactorController.create({
        payload: {
          user: user._id,
          title: `شارژ اکانت برای ${user.name}`,
          meta: {
            bankChargeAccountId: account._id,
            chargeAmount: payload.amount
          }
        }
      });

      await ProductOrderController.addRelation({
        sourceId: factor._id,
        targetId: product._id,
        payload: {
          orderPrice: product.price,
          count: 1
        }
      });

      factor.closed = true;
      factor.closedAt = Date.now();
      await factor.save();

      const payticket = await createPayTicket(factor._id, 'zarinpal');
      return payticket.payUrl;

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
