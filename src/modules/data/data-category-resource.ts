import { IDataCategory, IDataCategoryBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { isSlug } from '../../util/validators';


const maker = new ResourceMaker<IDataCategoryBase, IDataCategory>('DataCategory');

maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'slug',
    type: 'string',
    required: true,
    unique: true,
    title: 'کد'
  },
  {
    key: 'parent',
    type: 'string',
    ref: 'DataCategory',
    title: 'دسته‌بندی والد'
  },
  {
    key: 'picture',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'تصویر'
  },
  {
    key: 'viewType',
    type: 'string',
    enum: ['card', 'list'],
    default: 'card',
    title: 'نحوه نمایش',
    items: [
      { value: 'card', text: 'کارتی' },
      { value: 'list', text: 'لیستی' }
    ]
  },
  {
    key: 'thumbnail',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'تصویر کوچک'
  }
]);

export const DataCategoryModel      = maker.getModel();
export const DataCategoryController = maker.getController();

maker.setValidations({
  'slug': [
    async (it, e) => isSlug(it.slug) || e('کد صحیح نیست')
  ]
});

maker.addActions([
  { template: 'LIST' },//, permissions: ['admin.data-category.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.data-category.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.data-category.retrieve'] },
  { template: 'CREATE', permissions: ['admin.data-category.create'] },
  { template: 'UPDATE', permissions: ['admin.data-category.update'] },
  { template: 'DELETE', permissions: ['admin.data-category.delete'] },
  { // get parents
    method: 'GET',
    path: '/parents/:resourceId',
    signal: ['Resource', 'DataCategory', 'GetParents'],
    dataProvider: async ({ resourceId }) => {

      const result: IDataCategory[] = [];
      let category = await DataCategoryController.retrieve({ resourceId });

      while (category.parent && !result.find(it => it._id === category.parent) && result.length < 30) {

        category = await DataCategoryController.retrieve({
          resourceId: category.parent,
          includes: {
            'picture': 'path',
            'thumbnail': 'path'
          }
        });

        result.unshift(category);

      }

      return result;

    }
  },
  { // search
    method: 'GET',
    path: '/search/:query',
    signal: ['Resource', 'DataCategory', 'Search'],
    dataProvider: async ({ request: { params: { query } } }) => {
      return DataCategoryController.list({
        filters: {
          title: { $regex: new RegExp(query, 'i') }
        },
        includes: {
          'picture': 'path'
        }
      });
    }
  }
]);

export const DataCategoryRouter = maker.getRouter();