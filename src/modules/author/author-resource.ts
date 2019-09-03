import { ResourceMaker } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceRelationActionTemplate, ResourceActionTemplate } from '../../resource-maker/resource-router';

export interface IAuthor extends Document {
  familyName: string;
}

const maker = new ResourceMaker<IAuthor>('Author');

maker.setProperties([
  {
    key: 'familyName',
    type: 'string'
  }
]);

maker.addRelation({
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

maker.setActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: AuthorModel, controller: AuthorController, router: AuthorRouter } = maker.getMCR();
