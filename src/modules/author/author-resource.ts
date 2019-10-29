import { IResource, ResourceRelationActionTemplate, ResourceActionTemplate } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';

export interface IAuthor extends IResource {
  familyName: string;
}

const maker = new ResourceMaker<IAuthor>('Author');

maker.setProperties([
  {
    key: 'familyName',
    type: 'string'
  }
]);

export const { model: AuthorBookRelationModel, controller: AuthorBookRelationController } = maker.addRelation({
  targetModelName: 'Book',
  singular: true,
  properties: [
    {
      key: 'timeTook',
      type: 'number'
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    { template: ResourceRelationActionTemplate.CREATE },
    { template: ResourceRelationActionTemplate.DELETE }
  ]
});

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: AuthorModel, controller: AuthorController, router: AuthorRouter } = maker.getMCR();
