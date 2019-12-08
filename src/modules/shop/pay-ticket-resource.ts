import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';
import { InvalidRequestError, ServerError } from '../../global/errors';

import ZarinpalCheckout from 'zarinpal-checkout';
const Zarinpal = ZarinpalCheckout.create('c40c2e72-f604-11e7-95af-000c295eb8fc', false);

export interface IPayTicket extends IResource {
  factor: string;
  gateway: string;
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
    key: 'meta',
    type: 'object',
    default: {}
  }
]);

// TODO: this next!

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  {
    template: ResourceActionTemplate.CREATE,
    payloadPreprocessor: async ({ payload }) => {

      if (payload.gateway === 'zarinpal') {

      }
      else {
        throw new InvalidRequestError('invalid gateway');
      }

    }
  },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: PayTicketModel, controller: PayTicketController, router: PayTicketRouter } = maker.getMCR();

async function zarinpalCreateInvoice(payTicket: IPayTicket) {

  const amount = 0;
  const callBackUrl = '';
  const description = '';
  const email = '';
  const mobile = '';

  const response = await Zarinpal.PaymentRequest({
    Amount: amount,
    CallbackURL: callBackUrl,
    Description: description,
    Email: email,
    Mobile: mobile
  });

  if (response.status === 100) {
    // TODO: save data to payTicket meta for verification
  }
  else {
    throw new ServerError('gateway error');
  }

}
