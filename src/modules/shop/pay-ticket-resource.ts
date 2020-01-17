import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-enums';
import { InvalidRequestError, ServerError, InvalidStateError } from '../../global/errors';
import { FactorController, calculateFactorAmount } from './factor-resource';

import ZarinpalCheckout from 'zarinpal-checkout';
import { Config } from '../../global/config';
const Zarinpal = ZarinpalCheckout.create('c40c2e72-f604-11e7-95af-000c295eb8fc', false);

interface IGatewayHandler {
  gateway: string;
  initTicket(payTicket: IPayTicket): Promise<void>;
  verifyTicket(payTicket: IPayTicket): Promise<Boolean>;
}

const gatewayHandlers: IGatewayHandler[] = [];

export interface IPayTicket extends IResource {
  factor: string;
  gateway: string;
  payUrl: string;
  resolved: boolean;
  amount: number;
  // tslint:disable-next-line: no-any
  meta: any;
}

const maker = new ResourceMaker<IPayTicket>('PayTicket');

maker.setProperties([
  {
    key: 'factor',
    type: 'string',
    required: true,
    ref: 'Factor'
  },
  {
    key: 'gateway',
    type: 'string',
    required: true
  },
  {
    key: 'payUrl',
    type: 'string'
  },
  {
    key: 'amount',
    type: 'number'
  },
  {
    key: 'resolved',
    type: 'boolean',
    default: false
  },
  {
    key: 'meta',
    type: 'object',
    default: {}
  }
]);

export const { model: PayTicketModel, controller: PayTicketController } = maker.getMC();

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
    method: ResourceActionMethod.POST,
    path: '/verify/:ticketId',
    dataProvider: async ({ request }) => {

      const payTicket = await PayTicketController.singleRetrieve(request.params.ticketId);

      const handler = gatewayHandlers.find(h => h.gateway === payTicket.gateway);
      if (!handler) throw new InvalidRequestError('invalid gateway');

      const result = await handler.verifyTicket(payTicket);
      if (!result) throw new InvalidRequestError('failed verification');

      const factor = await FactorController.singleRetrieve(payTicket.factor);
      factor.payed = true;
      await factor.save();

      return {
        factorTitle: factor.name,
        amount: payTicket.amount
      };

    }
  }
]);

export const PayTicketRouter = maker.getRouter();

export async function createPayTicket(factorId: string, gateway: string) {

  const factor = await FactorController.singleRetrieve(factorId);

  if (!factor.closed) throw new InvalidStateError('factor must be closed');
  if (factor.payed) throw new InvalidStateError('factor is payed already');

  const handler = gatewayHandlers.find(h => h.gateway === gateway);
  if (!handler) throw new InvalidRequestError('invalid gateway');

  const payTicket = await PayTicketController.createNew({
    factor: factorId,
    gateway
  });

  await handler.initTicket(payTicket);

  return payTicket;

}

// GATEWAY HANDLERS

gatewayHandlers.push({
  gateway: 'zarinpal',
  async initTicket(payTicket) {

    const amount = await calculateFactorAmount(payTicket.factor);
    const callBackUrl = `${Config.payment.callbackBase}?ticket=${payTicket._id}`;
    const description = (await FactorController.singleRetrieve(payTicket.factor)).name || 'پرداخت فاکتور';
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

    if (status === -21) throw new InvalidRequestError('pay ticket not verified');

    payTicket.meta.refId = RefID;
    payTicket.resolved = true;
    await payTicket.save();

    return true;

  }
});
