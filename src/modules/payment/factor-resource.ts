import { IFactorBase } from './payment-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';
import { InvalidStateError } from '../../global/errors';


const maker = new ResourceMaker<IFactorBase>('Factor');

maker.addProperties([
  {
    key: 'user',
    type: 'string',
    required: true,
    ref: 'User',
    title: 'کاربر'
  },
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
    titleable: true
  },
  {
    key: 'amount',
    type: 'number',
    required: true,
    title: 'قیمت'
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
    key: 'paymentPayticket',
    type: 'string',
    ref: 'PayTicket',
    title: 'بلیط پرداخت',
    hideInTable: true
  },
  {
    key: 'meta',
    type: 'object',
    default: {},
    hidden: true
  }
]);

export const FactorModel      = maker.getModel();
export const FactorController = maker.getController();

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  {
    template: ResourceActionTemplate.UPDATE,
    stateValidator: async ({ resourceId }) => {
      const factor = await FactorController.retrieve({ resourceId });
      if (factor.payed) throw new InvalidStateError('factor is payed');
    }
  },
  {
    template: ResourceActionTemplate.DELETE,
    stateValidator: async ({ resourceId }) => {
      const factor = await FactorController.retrieve({ resourceId });
      if (factor.payed) throw new InvalidStateError('factor is payed');
    }
  }
]);

export const FactorRouter = maker.getRouter();
