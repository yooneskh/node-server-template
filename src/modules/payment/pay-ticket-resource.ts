import { Config } from '../../global/config';
import { IFactor, IPayTicket, IPayTicketBase } from './payment-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError, InvalidStateError, ServerError } from '../../global/errors';
import { FactorController } from './factor-resource';
import ZarinpalCheckout from 'zarinpal-checkout';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { createErrorResultPage } from './payment-result-error';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import { createSuccessResultPage } from './payment-result-success';
import { depositIntoUserAccount } from '../accounting/transfer-resource';
import { UserController } from '../user/user-resource';

const Zarinpal = ZarinpalCheckout.create(Config.zarinpal.merchantId, Config.zarinpal.isSandboxed);

interface IGatewayHandler {
  gateway: string;
  initTicket(payTicket: IPayTicket): Promise<void>;
  verifyTicket(payTicket: IPayTicket): Promise<Boolean>;
}

export type IPayticketStateValidator = (payticket: IPayTicket, factor: IFactor) => Promise<boolean | string>;

const gatewayHandlers: IGatewayHandler[] = [];
const payticketStateValidators: IPayticketStateValidator[] = [];

export function registerPayticketStateValidator(validator: IPayticketStateValidator) {
  payticketStateValidators.push(validator);
}

const maker = new ResourceMaker<IPayTicketBase>('PayTicket');

maker.addProperties([
  {
    key: 'factor',
    type: 'string',
    ref: 'Factor',
    required: true,
    index: true,
    title: 'فاکتور',
    titleable: true
  },
  {
    key: 'gateway',
    type: 'string',
    required: true,
    title: 'درگاه',
    titleable: true
  },
  {
    key: 'returnUrl',
    type: 'string',
    title: 'لینک بازگشت'
  },
  {
    key: 'payUrl',
    type: 'string',
    title: 'لینک پرداخت'
  },
  {
    key: 'amount',
    type: 'number',
    required: true,
    title: 'میزان',
    titleable: true
  },
  {
    key: 'resolved',
    type: 'boolean',
    index: true,
    default: false,
    title: 'پایان یافته'
  },
  {
    key: 'resolvedAt',
    type: 'number',
    default: 0,
    title: 'زمان پایان یافتن'
  },
  {
    key: 'payed',
    type: 'boolean',
    index: true,
    default: false,
    title: 'پرداخت شده'
  },
  {
    key: 'payedAt',
    type: 'number',
    default: 0,
    title: 'تاریخ پرداخت'
  },
  {
    key: 'rejected',
    type: 'boolean',
    index: true,
    default: false,
    title: 'رد شده'
  },
  {
    key: 'rejectedAt',
    type: 'number',
    default: 0,
    title: 'تاریخ رد'
  },
  {
    key: 'rejectedFor',
    type: 'string',
    title: 'علت رد'
  },
  {
    key: 'meta',
    type: 'object',
    default: {},
    hidden: true
  }
]);

export const PayTicketModel      = maker.getModel();
export const PayTicketController = maker.getController();


maker.addActions([
  { template: 'LIST', permissions: ['admin.payticket.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.payticket.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.payticket.retrieve'] },
  { // create
    template: 'CREATE',
    permissions: ['admin.payticket.create'],
    dataProvider: async ({ payload }) => createPayTicket(payload.factor, payload.gateway),
    responsePreprocessor: async ({ data }) => {
      delete data.meta;
    }
  },
  { template: 'UPDATE', permissions: ['admin.payticket.update'] },
  { template: 'DELETE', permissions: ['admin.payticket.delete'] },
  { // verify
    signal: ['Route', 'PayTicket', 'Verify'],
    method: 'GET',
    path: '/:resourceId/verify',
    stateValidator: async ({ resourceId, bag }) => {

      const payTicket = await PayTicketController.retrieve({ resourceId });
      if (payTicket.resolved) throw new InvalidStateError('payticket is resolved');

      const factor = await FactorController.retrieve({ resourceId: payTicket.factor });
      if (factor.payed) throw new InvalidStateError('factor is already payed');

      for (const validator of payticketStateValidators) {
        try {
          await validator(payTicket, factor);
        }
        catch (error) {

          const newPayTicket = await PayTicketController.edit({
            resourceId,
            payload: {
              resolved: true,
              resolvedAt: Date.now(),
              rejected: true,
              rejectedAt: Date.now(),
              rejectedFor: error.message
            }
          });

          YEventManager.emit(['Resource', 'PayTicket', 'Rejected'], resourceId, newPayTicket, error);
          throw error;

        }
      }

      bag.payTicket = payTicket;

    },
    dataProvider: async ({ response, bag }) => {
      try {

        const payTicket = bag.payTicket as IPayTicket;

        const handler = gatewayHandlers.find(h => h.gateway === payTicket.gateway);
        if (!handler) throw new InvalidRequestError('invalid gateway');

        const result = await handler.verifyTicket(payTicket);

        YEventManager.emit(['Resource', 'PayTicket', 'Resolved'], payTicket._id, payTicket);
        if (!result) throw new InvalidRequestError('pay ticket not verified');

        const factor = await FactorController.edit({
          resourceId: payTicket.factor,
          payload: {
            payed: true,
            payedAt: Date.now(),
            paymentPayticket: payTicket._id
          }
        });

        if (factor.user) {
          await depositIntoUserAccount(factor.user, factor.amount);
        }

        YEventManager.emit(['Resource', 'PayTicket', 'Payed'], payTicket._id, payTicket);
        YEventManager.emit(['Resource', 'Factor', 'Payed'], factor._id, factor);

        response.send(createSuccessResultPage({
          title: Config.payment.response.title,
          heading: `${payTicket.amount.toLocaleString()} تومان`,
          reason: factor.name,
          callback: payTicket.returnUrl || Config.payment.response.callback
        }));

        return DISMISS_DATA_PROVIDER;

      }
      catch (error) {

        response.send(createErrorResultPage({
          title: Config.payment.response.title,
          reason: error.message,
          callback: Config.payment.response.callback,
          callbackSupport: Config.payment.response.callbackSupport
        }));

        return DISMISS_DATA_PROVIDER;

      }
    }
  }
]);

export const PayTicketRouter = maker.getRouter();


export async function createPayTicket(factorId: string, gateway: string, returnUrl?: string) {

  const factor = await FactorController.retrieve({ resourceId: factorId });
  if (factor.payed) throw new InvalidStateError('factor is already payed');

  const handler = gatewayHandlers.find(h => h.gateway === gateway);
  if (!handler) throw new InvalidRequestError('invalid gateway');

  const payTicket = await PayTicketController.create({
    payload: {
      factor: factorId,
      gateway,
      amount: factor.amount,
      returnUrl
    }
  });

  await handler.initTicket(payTicket);

  const filledPayticket = await PayTicketController.retrieve({ resourceId: payTicket._id });

  YEventManager.emit(['Resource', 'PayTicket', 'Inited'], filledPayticket._id, filledPayticket);
  return filledPayticket;

}

// GATEWAY HANDLERS

gatewayHandlers.push({
  gateway: 'zarinpal',
  async initTicket(payTicket) {

    const amount = payTicket.amount;
    const callBackUrl = `${Config.payment.callbackUrlBase}/${payTicket._id}/verify`;
    const factor = await FactorController.retrieve({ resourceId: payTicket.factor });
    const description = factor.name;

    let userMobile = undefined;
    let userEmail = undefined;

    if (factor.user) {
      const user = await UserController.retrieve({ resourceId: factor.user });
      userMobile = user.phoneNumber;
      userEmail = user.email;
    }

    const { status, url, authority } = await Zarinpal.PaymentRequest({
      Amount: String(amount),
      CallbackURL: callBackUrl,
      Description: description,
      Email: userEmail,
      Mobile: userMobile
    });

    if (status !== 100) throw new ServerError('zarinpal gateway error');

    await PayTicketController.edit({
      resourceId: payTicket._id,
      payload: {
        payUrl: url,
        meta: {
          authority,
          status,
          callBackUrl
        }
      }
    });

  },
  async verifyTicket(payTicket) {

    const amount = payTicket.amount;
    const authority = payTicket.meta.authority;
    if (!amount || !authority) throw new InvalidStateError('invalid pay ticket state');

    const { status, RefID } = await Zarinpal.PaymentVerification({
      Amount: amount.toString(10),
      Authority: authority
    });

    if (status === -21) {
      await PayTicketController.edit({
        resourceId: payTicket._id,
        payload: {
          resolved: true,
          payed: false,
          resolvedAt: Date.now()
        }
      }); return false;
    }

    await PayTicketController.edit({
      resourceId: payTicket._id,
      payload: {
        meta: {
          ...payTicket.meta,
          refId: RefID
        },
        resolved: true,
        resolvedAt: Date.now(),
        payed: true,
        payedAt: Date.now()
      }
    });

    return true;

  }
});
