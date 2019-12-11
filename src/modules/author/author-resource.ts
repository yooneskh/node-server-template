import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceRelationActionTemplate, ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';

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
}, {
  title: 'کتاب‌ها',
  order: 1,
  propertiesMeta: [
    {
      key: 'timeTook',
      title: 'زمان طول کشیده',
      order: 1
    }
  ]
});

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: AuthorModel, controller: AuthorController, router: AuthorRouter } = maker.getMCR();
