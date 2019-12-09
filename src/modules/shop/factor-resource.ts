import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceRelationActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';
import { InvalidStateError, InvalidRequestError } from '../../global/errors';
import { ProductController } from './product-resource';

export interface IFactor extends IResource {
  user: string;
  name: string;
  closed: boolean;
  payed: boolean;
}

const maker = new ResourceMaker<IFactor>('Factor');

maker.setProperties([
  {
    key: 'user',
    type: 'string',
    required: true,
    ref: 'User'
  },
  {
    key: 'name',
    type: 'string',
    default: ''
  },
  {
    key: 'closed',
    type: 'boolean',
    default: false
  },
  {
    key: 'payed',
    type: 'boolean',
    default: false
  }
]);

export const { model: FactorModel, controller: FactorController } = maker.getMC();


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
  properties: [
    {
      key: 'orderPrice',
      type: 'number',
      required: true
    },
    {
      key: 'count',
      type: 'number',
      required: true
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    {
      template: ResourceRelationActionTemplate.CREATE,
      payloadValidator: async ({ request, payload }) => {

        const factorId = request.params.sourceId;
        const factor = await FactorController.singleRetrieve(factorId);
        if (factor.closed) throw new InvalidStateError('factor is closed');
        if (factor.payed) throw new InvalidStateError('factor is payed');

        const productId = request.params.targetId;
        const product = await ProductController.singleRetrieve(productId);
        if (product.price !== payload.price) throw new InvalidRequestError('order price is not equal to product price');

        if (payload.count <= 0) throw new InvalidRequestError('count must be positive integer');

        return true;

      }
    },
    {
      template: ResourceRelationActionTemplate.DELETE,
      payloadValidator: async ({ request }) => {

        const factorId = request.params.sourceId;
        const factor = await FactorController.singleRetrieve(factorId);
        if (factor.closed) throw new InvalidStateError('factor is closed');
        if (factor.payed) throw new InvalidStateError('factor is payed');

        return true;

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
      const factor = await FactorController.singleRetrieve(factorId);
      if (factor.payed) throw new InvalidStateError('factor is payed');

      return true;

    }
  },
  {
    template: ResourceActionTemplate.DELETE,
    payloadValidator: async ({ request }) => {

      const factorId = request.params.resourceId;
      const factor = await FactorController.singleRetrieve(factorId);
      if (factor.payed) throw new InvalidStateError('factor is payed');

      return true;

    }
  }
]);

export const FactorRouter = maker.getRouter();


export async function calculateFactorAmount(factorId: string) {

  const factorProductOrders = await ProductOrderController.listForSource(factorId);

  let sum = 0;

  for (const order of factorProductOrders) {
    sum += order.orderPrice * order.count;
  }

  return sum;

}
