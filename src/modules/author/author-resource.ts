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

maker.setMetas([
  {
    key: 'familyName',
    title: 'نام خانوادگی',
    titleAble: true,
    order: 1
  }
]);

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: AuthorBookRelationModel, controller: AuthorBookRelationController } = maker.addRelation({
  targetModelName: 'Book',
  singular: true,
  properties: [
    {
      key: 'timeTook',
      type: 'number'
    },
    {
      key: 'pages',
      type: 'string',
      ref: 'Page',
      isArray: true
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
  targetPropertyTitle: 'کتاب',
  propertiesMeta: [
    {
      key: 'timeTook',
      title: 'زمان طول کشیده',
      order: 2
    },
    {
      key: 'pages',
      title: 'صفحات ایجاد شده',
      order: 3
    }
  ]
});

export const { model: PageMakerModel, controller: PageMakerController } = maker.addRelation({
  targetModelName: 'Page',
  relationModelName: 'PageMaker',
  maxCount: 5,
  properties: [
    {
      key: 'isPremium',
      type: 'boolean'
    },
    {
      key: 'contributor',
      type: 'string',
      ref: 'User'
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
  title: 'صفحات ایجاد شده',
  targetPropertyTitle: 'صفحه',
  order: 2,
  propertiesMeta: [
    {
      key: 'isPremium',
      title: 'صفحه ویژه',
      order: 1
    },
    {
      key: 'contributor',
      title: 'دستیار',
      order: 2
    }
  ]
});

export const { model: AuthorModel, controller: AuthorController, router: AuthorRouter } = maker.getMCR();
