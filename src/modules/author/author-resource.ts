import { IAuthor } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate, ResourceRelationActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';
import { Config } from '../../global/config';


const maker = new ResourceMaker<IAuthor>('Author');

maker.addProperties([
  {
    key: 'familyName',
    type: 'string',
    title: 'نام خانوادگی',
    titleable: true
  }
]);

export const AuthorModel      = maker.getModel();
export const AuthorController = maker.getController();

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: AuthorBookRelationModel, controller: AuthorBookRelationController } = maker.addRelation({
  targetModelName: 'Book',
  singular: true,
  title: 'کتاب‌ها',
  targetPropertyTitle: 'کتاب',
  properties: [
    {
      key: 'timeTook',
      type: 'number',
      title: 'زمان طول کشیده',
    },
    {
      key: 'blast',
      type: 'string',
      languages: Config.languages,
      title: 'انفجار',
    },
    {
      key: 'pages',
      type: 'string',
      ref: 'Page',
      isArray: true,
      title: 'صفحات ایجاد شده',
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.LIST_ALL },
    { template: ResourceRelationActionTemplate.RETRIEVE_BY_ID },
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    { template: ResourceRelationActionTemplate.CREATE },
    { template: ResourceRelationActionTemplate.UPDATE },
    { template: ResourceRelationActionTemplate.DELETE }
  ]
});

export const { model: PageMakerModel, controller: PageMakerController } = maker.addRelation({
  targetModelName: 'Page',
  relationModelName: 'PageMaker',
  maxCount: 5,
  title: 'صفحات ایجاد شده',
  targetPropertyTitle: 'صفحه',
  properties: [
    {
      key: 'isPremium',
      type: 'boolean',
      title: 'صفحه ویژه',
    },
    {
      key: 'contributor',
      type: 'string',
      ref: 'User',
      title: 'دستیار',
    }
  ],
  actions: [
    { template: ResourceRelationActionTemplate.LIST_ALL },
    { template: ResourceRelationActionTemplate.RETRIEVE_BY_ID },
    { template: ResourceRelationActionTemplate.LIST },
    { template: ResourceRelationActionTemplate.LIST_COUNT },
    { template: ResourceRelationActionTemplate.RETRIEVE },
    { template: ResourceRelationActionTemplate.RETRIEVE_COUNT },
    { template: ResourceRelationActionTemplate.CREATE },
    { template: ResourceRelationActionTemplate.UPDATE },
    { template: ResourceRelationActionTemplate.DELETE }
  ]
});

export const AuthorRouter = maker.getRouter();
