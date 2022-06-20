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
    key: 'thumbnail',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'تصویر کوچک'
  },
  {
    key: 'order',
    type: 'number',
    title: 'ترتیب'
  },
  {
    key: 'hidden',
    type: 'boolean',
    title: 'مخفی شده'
  }
]);


export const DataCategoryModel      = maker.getModel();
export const DataCategoryController = maker.getController();


maker.setValidations({
  'slug': [
    async (it, e) => isSlug(it.slug) || e('کد صحیح نیست')
  ]
});


export async function getSuccessorIds(parentId: string): Promise<string[]> {

  const successors = await DataCategoryController.list({
    filters: {
      parent: parentId,
    }
  });

  const successorsIds = await Promise.all(
    successors.map(it =>
      getSuccessorIds(String(it._id))
    )
  );

  return [
    parentId,
    ...successorsIds.flat()
  ];

}


maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
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
  },
  { // retrieve sitemap
    method: 'GET',
    path: '/retrieve/sitemap',
    signal: ['Resource', 'DataCategory', 'RetrieveSitemap'],
    dataProvider: async () => {
      return DataCategoryController.list({
        selects: 'title slug parent hidden'
      });
    }
  }
]);


export const DataCategoryRouter = maker.getRouter();
