import { IResource } from '../../plugins/resource-maker-next/resource-model-types';
import { ResourceMaker } from '../../plugins/resource-maker-next/resource-maker';
import { ResourceRelationActionTemplate, ResourceActionTemplate } from '../../plugins/resource-maker-next/resource-maker-router-enums';
import { InvalidStateError, InvalidRequestError } from '../../global/errors';
import { ProductController } from './product-resource';
import { YEventManager } from '../../plugins/event-manager/event-manager';

export interface IFactor extends IResource {
  user: string;
  title: string;
  closed: boolean;
  payed: boolean;
  payticket: string;
  // tslint:disable-next-line: no-any
  meta: any;
}

const maker = new ResourceMaker<IFactor>('Factor');

maker.addProperties([
  {
    key: 'user',
    type: 'string',
    required: true,
    ref: 'User',
    title: 'کاربر'
  },
  {
    key: 'title',
    type: 'string',
    default: '',
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'closed',
    type: 'boolean',
    default: false,
    title: 'بسته شده'
  },
  {
    key: 'payed',
    type: 'boolean',
    default: false,
    title: 'پرداخت شده'
  },
  {
    key: 'payticket',
    type: 'string',
    ref: 'PayTicket',
    hideInTable: true
  }
]);

export const FactorModel      = maker.getModel();
export const FactorController = maker.getController();


export interface IProductOrder extends IResource {
  factor: string;
  product: string;
  orderPrice: number;
  count: number;
}

export const { model: ProductOrderModel, controller: ProductOrderController } = maker.addRelation<IProductOrder>({
  targetModelName: 'Product',
  relationModelName: 'ProductOrder',
  singular: true,
  title: 'محصولات فاکتور',
  targetPropertyTitle: 'محصول',
  properties: [
    {
      key: 'orderPrice',
      type: 'number',
      required: true,
      title: 'قیمت سفارش'
    },
    {
      key: 'count',
      type: 'number',
      required: true,
      title: 'تعداد'
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.RETRIEVE_BY_ID },
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    {
      template: ResourceRelationActionTemplate.CREATE,
      payloadValidator: async ({ request, payload }) => {

        const factorId = request.params.sourceId;
        const factor = await FactorController.retrieve({ resourceId: factorId });
        if (factor.closed) throw new InvalidStateError('factor is closed');
        if (factor.payed) throw new InvalidStateError('factor is payed');

        const productId = request.params.targetId;
        const product = await ProductController.retrieve({ resourceId: productId });
        if (product.price !== payload.orderPrice) throw new InvalidRequestError('order price is not equal to product price');

        if (payload.count <= 0) throw new InvalidRequestError('count must be positive integer');

      }
    },
    {
      template: ResourceRelationActionTemplate.DELETE,
      payloadValidator: async ({ request }) => {

        const factorId = request.params.sourceId;
        const factor = await FactorController.retrieve({ resourceId: factorId });
        if (factor.closed) throw new InvalidStateError('factor is closed');
        if (factor.payed) throw new InvalidStateError('factor is payed');

      }
    }
  ]
});

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  {
    template: ResourceActionTemplate.UPDATE,
    payloadValidator: async ({ request }) => {

      const factorId = request.params.resourceId;
      const factor = await FactorController.retrieve({ resourceId: factorId });
      if (factor.payed) throw new InvalidStateError('factor is payed');

    },
    postprocessor: async ({ request, payload }) => {
      if (payload.closed === false) {
        YEventManager.emit(
          ['Resource', 'Factor', 'Closed'],
          request.params.resourceId,
          await FactorController.retrieve({ resourceId: request.params.resourceId })
        );
      }
    }
  },
  {
    template: ResourceActionTemplate.DELETE,
    payloadValidator: async ({ request }) => {

      const factorId = request.params.resourceId;
      const factor = await FactorController.retrieve({ resourceId: factorId });
      if (factor.payed) throw new InvalidStateError('factor is payed');

    }
  }
]);

export const FactorRouter = maker.getRouter();


export async function calculateFactorAmount(factorId: string) {

  const factorProductOrders = await ProductOrderController.listForSource({ sourceId: factorId });

  let sum = 0;

  for (const order of factorProductOrders) {
    sum += order.orderPrice * order.count;
  }

  return sum;

}
