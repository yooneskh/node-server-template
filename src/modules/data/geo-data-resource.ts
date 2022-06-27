import { IGeoData, IGeoDataBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { PublisherController } from './publisher-resource';
import { DataCategoryController, getSuccessorIds } from './data-category-resource';
import uniqBy from 'lodash/uniqBy';


const maker = new ResourceMaker<IGeoDataBase, IGeoData>('GeoData');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'category',
    type: 'string',
    ref: 'DataCategory',
    required: true,
    index: true,
    title: 'دسته‌بندی'
  },
  {
    key: 'timeTags',
    type: 'string',
    ref: 'TimeTag',
    isArray: true,
    required: true,
    title: 'تگ‌های زمانی',
    hideInTable: true
  },
  {
    key: 'description',
    type: 'string',
    title: 'توضیحات',
    longText: true,
    hideInTable: true
  },
  {
    key: 'file',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'فایل'
  },
  {
    key: 'publisher',
    type: 'string',
    ref: 'Publisher',
    title: 'انتشار دهنده'
  },
  {
    key: 'region',
    type: 'number',
    title: 'منطقه شهرداری'
  },
  {
    key: 'tags',
    type: 'string',
    isArray: true,
    title: 'کلمات کلیدی',
    hideInTable: true
  },
  {
    key: 'hidden',
    type: 'boolean',
    title: 'مخفی کردن داده',
    hideInTable: true
  },
  {
    key: 'hideMetas',
    type: 'boolean',
    title: 'مخفی کردن اطلاعات',
    hideInTable: true
  }
]);


export const GeoDataModel      = maker.getModel();
export const GeoDataController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
  { template: 'RETRIEVE', permissions: ['admin.geo-data.retrieve'] },
  { template: 'CREATE', permissions: ['admin.geo-data.create'] },
  { template: 'UPDATE', permissions: ['admin.geo-data.update'] },
  { template: 'DELETE', permissions: ['admin.geo-data.delete'] },
  { // search
    method: 'GET',
    path: '/search/:query',
    signal: ['Route', 'GeoData', 'Search'],
    dataProvider: async ({ request: { params: { query } } }) => {
      return GeoDataController.list({
        filters: {
          $or: [
            {
              title: { $regex: new RegExp(query, 'i') }
            },
            {
              description: { $regex: new RegExp(query, 'i') }
            },
            {
              tags: { $regex: new RegExp(query, 'i') } as any
            }
          ]
        },
        includes: {
          'timeTags': '',
          'file': '',
          'publisher': ''
        },
        skipKeyCheck: true
      });
    }
  },
  {
    method: 'GET',
    path: '/custom/search/meta',
    signal: ['Route', 'GeoData', 'SearchMeta'],
    dataProvider: async () => {

      const [categories, publishers] = await Promise.all([
        DataCategoryController.list({}),
        PublisherController.list({}),
      ]);

      return {
        categories,
        publishers,
      };

    }
  },
  { // search
    method: 'GET',
    path: '/custom/search',
    signal: ['Route', 'GeoData', 'SearchCustom'],
    dataProvider: async ({ query }) => {

      const { category, title, description, region, timeFrom, timeTo, publisher, tags } = query;

      // tslint:disable-next-line: no-any
      const filters: any = {};

      if (title) {
        filters['title'] = { $regex: new RegExp(title, 'i') };
      }

      if (description) {
        filters['description'] = { $regex: new RegExp(description, 'i') };
      }

      if (region && Number(region)) {
        filters['region'] = Number(region);
      }

      if (publisher) {
        filters['publisher'] = publisher;
      }

      if (category) {

        const categoryIds = await getSuccessorIds(category);

        filters['category'] = { $in: categoryIds };

      }

      if (timeFrom || timeTo) {

        const criteria = {} as any;

        if (timeFrom) {
          criteria['$gte'] = Number(timeFrom); // todo: use time tags for this
        }

        if (timeTo) {
          criteria['$lte'] = Number(timeTo); // todo: use time tags for this
        }

        filters['createdAt'] = criteria;

      }

      if (tags) {
        filters['tags'] = { $regex: new RegExp(tags, 'i') };
      }

      return GeoDataController.list({
        filters,
        includes: {
          'timeTags': '',
          'file': '',
          'publisher': ''
        },
        limit: 30,
        skipKeyCheck: true
      });

    }
  },
  { // get categories tree
    method: 'GET',
    path: '/categories/tree',
    signal: ['Route', 'ApiEndpoint', 'CategoriesTree'],
    dataProvider: async () => {

      const endpoints = await GeoDataController.list({});

      const categoryIds = [... new Set( endpoints.map(it => it.category) )];

      const categories = await DataCategoryController.list({
        filters: {
          _id: { $in: categoryIds }
        },
        includes: {
          'file': 'path'
        },
        sorts: {
          'order': 1
        },
        limit: 30,
      });

      for (let i = 0; i < categories.length; i++) {
        if (!categories[i].parent) continue;

        categories.push(await DataCategoryController.retrieve({
          resourceId: categories[i].parent,
          includes: {
            'file': 'path'
          },
        }));

      }

      return uniqBy(categories, it => String(it._id));

    }
  }
]);


export const GeoDataRouter = maker.getRouter();
