import { IAuthor, IAuthorBase, IAuthorBook, IAuthorBookBase, IAuthorPageMaker, IAuthorPageMakerBase } from './author-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { Config } from '../../global/config';


const maker = new ResourceMaker<IAuthorBase, IAuthor>('Author');

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
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
  { template: 'RETRIEVE' },
  { template: 'CREATE' },
  { template: 'UPDATE' },
  { template: 'DELETE' }
]);

export const { model: AuthorBookRelationModel, controller: AuthorBookRelationController } = maker.addRelation<IAuthorBookBase, IAuthorBook>({
  targetModelName: 'Book',
  singular: true,
  title: 'کتاب‌ها',
  sourcePropertyTitle: 'نویسنده',
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
    { template: 'LIST_ALL' },
    { template: 'LIST_ALL_COUNT' },
    { template: 'RETRIEVE_BY_ID' },
    { template: 'LIST' },
    { template: 'LIST_COUNT' },
    { template: 'RETRIEVE' },
    { template: 'RETRIEVE_COUNT' },
    { template: 'CREATE' },
    { template: 'UPDATE' },
    { template: 'DELETE' }
  ]
});

export const { model: PageMakerModel, controller: PageMakerController } = maker.addRelation<IAuthorPageMakerBase, IAuthorPageMaker>({
  targetModelName: 'Page',
  relationModelName: 'PageMaker',
  maxCount: 5,
  title: 'صفحات ایجاد شده',
  sourcePropertyTitle: 'نویسنده',
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
    { template: 'LIST_ALL' },
    { template: 'LIST_ALL_COUNT' },
    { template: 'RETRIEVE_BY_ID' },
    { template: 'LIST' },
    { template: 'LIST_COUNT' },
    { template: 'RETRIEVE' },
    { template: 'RETRIEVE_COUNT' },
    { template: 'CREATE' },
    { template: 'UPDATE' },
    { template: 'DELETE' }
  ]
});

export const AuthorRouter = maker.getRouter();
