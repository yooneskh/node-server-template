import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceActionMethod } from '../../plugins/resource-maker/resource-maker-enums';
import { InvalidRequestError, ServerError } from '../../global/errors';

import ZarinpalCheckout from 'zarinpal-checkout';
import { FactorController } from './factor-resource';
const Zarinpal = ZarinpalCheckout.create('c40c2e72-f604-11e7-95af-000c295eb8fc', false);

interface IGatewayHandler {
  gateway: string;
  initTicket(payTicket: IPayTicket): Promise<void>;
  verifyTicket(payTicket: IPayTicket): Promise<void>;
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

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  {
    template: ResourceActionTemplate.CREATE,
    responsePreprocessor: async ({ data }) => {

      const handler = gatewayHandlers.find(h => h.gateway === data.gateway);
      if (!handler) throw new InvalidRequestError('invalid gateway');

      await handler.initTicket(data);

      delete data.meta;

    }
  },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE },
  {
    method: ResourceActionMethod.POST,
    path: '/verify/:ticketId',
    dataProvider: async ({ request, payload }) => verifyPayTicket(request.params.ticketId, payload)
  }
]);

export const { model: PayTicketModel, controller: PayTicketController, router: PayTicketRouter } = maker.getMCR();

// tslint:disable-next-line: no-any
async function verifyPayTicket(payTicketId: string, payload: any) {

  const payTicket = await PayTicketController.singleRetrieve(payTicketId);

  const handler = gatewayHandlers.find(h => h.gateway === payTicket.gateway);
  if (!handler) throw new InvalidRequestError('invalid gateway');

  handler.verifyTicket(payTicket);

}

gatewayHandlers.push({
  gateway: 'zarinpal',
  async initTicket(payTicket) {

    const amount = 0; // TODO: do these!
    const callBackUrl = '';
    const description = '';
    const email = '';
    const mobile = '';

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

    if (status === -21) throw new InvalidRequestError('pay ticket not berified');

    payTicket.meta.refId = RefID;
    payTicket.resolved = true;
    await payTicket.save();

    const factor = await FactorController.singleRetrieve(payTicket.factor);
    factor.payed = true;
    await factor.save();

  }
});
