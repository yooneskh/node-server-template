import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceRelationActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';
import { validatePayload } from '../../global/util';

export interface IFactor extends IResource {
  user: string;
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

export const { model: ProductOrderModel, controller: ProductOrderController } = maker.addRelation({
  targetModelName: 'Product',
  relationModelName: 'ProductOrder',
  properties: [
    {
      key: 'orderPrice',
      type: 'number'
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    {
      template: ResourceRelationActionTemplate.CREATE,
      // async validatePayload(payload, properties) { // TODO: here!

      // }
    },
    { template: ResourceRelationActionTemplate.DELETE }
  ]
});

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: FactorModel, controller: FactorController, router: FactorRouter } = maker.getMCR();
