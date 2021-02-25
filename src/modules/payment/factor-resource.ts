import { IFactorBase } from './payment-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidStateError } from '../../global/errors';


const maker = new ResourceMaker<IFactorBase>('Factor');

maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    index: true,
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
    index: true,
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
  { template: 'LIST', permissions: ['admin.factor.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.factor.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.factor.retrieve'] },
  { template: 'CREATE', permissions: ['admin.factor.create'] },
  {
    template: 'UPDATE',
    permissions: ['admin.factor.update'],
    stateValidator: async ({ resourceId }) => {
      const factor = await FactorController.retrieve({ resourceId });
      if (factor.payed) throw new InvalidStateError('factor is payed');
    }
  },
  {
    template: 'DELETE',
    permissions: ['admin.factor.delete'],
    stateValidator: async ({ resourceId }) => {
      const factor = await FactorController.retrieve({ resourceId });
      if (factor.payed) throw new InvalidStateError('factor is payed');
    }
  }
]);

export const FactorRouter = maker.getRouter();
