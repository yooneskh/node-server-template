import { Config } from '../../global/config';
import { IPayTicket, IPayTicketBase } from './shop-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-router-enums';
import { InvalidRequestError, InvalidStateError, ServerError } from '../../global/errors';
import { FactorController, calculateFactorAmount } from './factor-resource';
import ZarinpalCheckout from 'zarinpal-checkout';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { createErrorResultPage } from './payment-result-error';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import { createSuccessResultPage } from './payment-result-success';

const Zarinpal = ZarinpalCheckout.create(Config.zarinpal.merchantId, Config.zarinpal.isSandboxed);

interface IGatewayHandler {
  gateway: string;
  initTicket(payTicket: IPayTicket): Promise<void>;
  verifyTicket(payTicket: IPayTicket): Promise<Boolean>;
}

const gatewayHandlers: IGatewayHandler[] = [];


const maker = new ResourceMaker<IPayTicketBase>('PayTicket');

maker.addProperties([
  {
    key: 'factor',
    type: 'string',
    required: true,
    ref: 'Factor',
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
    key: 'meta',
    type: 'object',
    default: {},
    hidden: true
  }
]);

export const PayTicketModel      = maker.getModel();
export const PayTicketController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  {
    template: ResourceActionTemplate.CREATE,
    dataProvider: async ({ payload }) => createPayTicket(payload.factor, payload.gateway),
    responsePreprocessor: async ({ data }) => {
      delete data.meta;
    }
  },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE },
  {
    signal: ['Route', 'PayTicket', 'Verify'],
    method: ResourceActionMethod.GET,
    path: '/:resourceId/verify',
    stateValidator: async ({ resourceId, bag }) => {

      const payTicket = await PayTicketController.retrieve({ resourceId });
      if (payTicket.resolved) throw new InvalidStateError('paytcket is resolved');

      const factor = await FactorController.retrieve({ resourceId: payTicket.factor });
      if (!factor.closed) throw new InvalidStateError('factor is not closed');
      if (factor.payed) throw new InvalidStateError('factor is already payed');

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
            payticket: payTicket._id
          }
        });

        YEventManager.emit(['Resource', 'PayTicket', 'Payed'], payTicket._id, payTicket);
        YEventManager.emit(['Resource', 'Factor', 'Payed'], factor._id, factor);

        response.send(createSuccessResultPage(
          Config.payment.response.title,
          `${payTicket.amount.toLocaleString()} تومان`,
          factor.title,
          Config.payment.response.callback
        ));

        return DISMISS_DATA_PROVIDER;

      }
      catch (error) {

        response.send(createErrorResultPage(
          Config.payment.response.title,
          error.message,
          Config.payment.response.callbackSupport,
          Config.payment.response.callback
        ));

        return DISMISS_DATA_PROVIDER;

      }
    }
  }
]);

export const PayTicketRouter = maker.getRouter();


export async function createPayTicket(factorId: string, gateway: string) {

  const factor = await FactorController.retrieve({ resourceId: factorId });
  if (!factor.closed) throw new InvalidStateError('factor must be closed');
  if (factor.payed) throw new InvalidStateError('factor is already payed');

  const handler = gatewayHandlers.find(h => h.gateway === gateway);
  if (!handler) throw new InvalidRequestError('invalid gateway');

  const payTicket = await PayTicketController.create({
    payload: {
      factor: factorId,
      gateway,
      amount: await calculateFactorAmount(factorId)
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
    const description = (await FactorController.retrieve({ resourceId: payTicket.factor })).title;
    const email = Config.payment.zarinpal.email;
    const mobile = Config.payment.zarinpal.phone;

    const { status, url, authority } = await Zarinpal.PaymentRequest({
      Amount: String(amount),
      CallbackURL: callBackUrl,
      Description: description,
      Email: email,
      Mobile: mobile
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
