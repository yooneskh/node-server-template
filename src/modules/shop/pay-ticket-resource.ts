import { Config } from '../../global/config';
import { IPayTicket, IPayTicketBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-router-enums';
import { InvalidRequestError, InvalidStateError, ServerError } from '../../global/errors';
import { FactorController, calculateFactorAmount } from './factor-resource';
import ZarinpalCheckout from 'zarinpal-checkout';
import { YEventManager } from '../../plugins/event-manager/event-manager';

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
    key: 'payed',
    type: 'boolean',
    default: false,
    title: 'پرداخت شده'
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
    method: ResourceActionMethod.POST,
    path: '/verify/:ticketId',
    payloadValidator: async ({ request }) => {

      const payTicket = await PayTicketController.retrieve({ resourceId: request.params.ticketId });
      if (payTicket.resolved) throw new InvalidStateError('paytcket is resolved');

      const factor = await FactorController.retrieve({ resourceId: payTicket.factor });
      if (!factor.closed) throw new InvalidStateError('factor is not closed');
      if (factor.payed) throw new InvalidStateError('factor is already payed');

    },
    dataProvider: async ({ request }) => {

      const payTicket = await PayTicketController.retrieve({ resourceId: request.params.ticketId });

      const handler = gatewayHandlers.find(h => h.gateway === payTicket.gateway);
      if (!handler) throw new InvalidRequestError('invalid gateway');

      const result = await handler.verifyTicket(payTicket);

      YEventManager.emit(['Resource', 'PayTicket', 'Resolved'], payTicket._id, payTicket);
      if (!result) throw new InvalidRequestError('pay ticket not verified');

      const factor = await FactorController.retrieve({ resourceId: payTicket.factor });
      factor.payed = true;
      factor.payticket = payTicket._id;
      await factor.save();

      YEventManager.emit(['Resource', 'PayTicket', 'Payed'], payTicket._id, payTicket);
      YEventManager.emit(['Resource', 'Factor', 'Payed'], factor._id, factor);

      return {
        factorTitle: factor.title,
        amount: payTicket.amount
      };

    }
  }
]);

export const PayTicketRouter = maker.getRouter();


export async function createPayTicket(factorId: string, gateway: string) {

  const factor = await FactorController.retrieve({ resourceId: factorId });

  if (!factor.closed) throw new InvalidStateError('factor must be closed');
  if (factor.payed) throw new InvalidStateError('factor is payed already');

  const handler = gatewayHandlers.find(h => h.gateway === gateway);
  if (!handler) throw new InvalidRequestError('invalid gateway');

  const payTicket = await PayTicketController.create({
    payload: {
      factor: factorId,
      gateway
    }
  });

  await handler.initTicket(payTicket);

  YEventManager.emit(['Resource', 'PayTicket', 'Created'], payTicket._id, payTicket);

  return payTicket;

}

// GATEWAY HANDLERS

gatewayHandlers.push({
  gateway: 'zarinpal',
  async initTicket(payTicket) {

    const amount = await calculateFactorAmount(payTicket.factor);
    const callBackUrl = `${Config.payment.callbackBase}?ticket=${payTicket._id}`;
    const description = (await FactorController.retrieve({ resourceId: payTicket.factor })).title || 'پرداخت فاکتور';
    const email = Config.payment.email;
    const mobile = Config.payment.phone;

    const { status, url, authority } = await Zarinpal.PaymentRequest({
      Amount: amount.toString(10),
      CallbackURL: callBackUrl,
      Description: description,
      Email: email,
      Mobile: mobile
    });

    if (status !== 100) throw new ServerError('zarinpal gateway error');

    payTicket.payUrl = url;
    payTicket.amount = amount;

    payTicket.meta = {
      authority,
      status,
      callBackUrl
    };

    await payTicket.save();

  },
  async verifyTicket(payTicket) {

    const amount = payTicket.amount;
    const authority = payTicket.meta.authority;

    if (!amount || !authority) throw new InvalidRequestError('invalid pay ticket state');

    const { status, RefID } = await Zarinpal.PaymentVerification({
      Amount: amount.toString(10),
      Authority: authority
    });

    if (status === -21) {
      payTicket.resolved = true;
      payTicket.payed = false;
      await payTicket.save();
      return false;
    }

    payTicket.meta.refId = RefID;
    payTicket.resolved = true;
    payTicket.payed = true;
    await payTicket.save();

    return true;

  }
});
