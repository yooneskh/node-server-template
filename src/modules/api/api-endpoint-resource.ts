import { IApiEndpoint, IApiEndpointBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { isSlug } from '../../util/validators';
import { DataCategoryController, getSuccessorIds } from '../data/data-category-resource';
import { uniqBy } from 'lodash';
import { TimeTagController } from '../data/time-tag-resource';
import { PublisherController } from '../data/publisher-resource';


const maker = new ResourceMaker<IApiEndpointBase, IApiEndpoint>('ApiEndpoint');


maker.addProperties([
  {
    key: 'category',
    type: 'string',
    ref: 'DataCategory',
    required: true,
    title: 'دسته‌بندی'
  },
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
    title: 'شناسه',
    dir: 'ltr'
  },
  {
    key: 'publisher',
    type: 'string',
    ref: 'Publisher',
    required: true,
    title: 'انتشار دهنده'
  },
  {
    key: 'platform',
    type: 'string',
    enum: ['GSB', 'PGSB'],
    title: 'بستر'
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    longText: true,
    hideInTable: true
  },
  {
    key: 'region',
    type: 'number',
    title: 'منطقه شهرداری'
  },
  {
    key: 'specialties',
    type: 'string',
    isArray: true,
    title: 'ویژگی‌ها',
    hideInTable: true
  },
  {
    key: 'disabled',
    type: 'boolean',
    title: 'غیرفعال شده',
    hideInTable: true
  },
  {
    key: 'timeTags',
    type: 'string',
    ref: 'TimeTag',
    isArray: true,
    required: true,
    title: 'تاریخ انتشار',
    hideInTable: true
  },
  {
    key: 'body',
    type: 'string',
    required: true,
    title: 'متن توصیف',
    richText: true,
    hideInTable: true,
    defaultMapLocation: {
      defaultCenter: {
        latitude: 29.6114188,
        longitude: 52.5235707,
      },
    },
  },
  {
    key: 'offers',
    type: 'series',
    title: 'سیاست‌های درخواست',
    serieBase: {},
    serieSchema: [
      {
        key: 'title',
        type: 'string',
        required: true,
        title: 'عنوان',
        width: 4
      },
      {
        key: 'policy',
        type: 'string',
        ref: 'ApiPolicy',
        required: true,
        title: 'سیاست',
        width: 4
      },
      {
        key: 'userTypes',
        type: 'string',
        enum: ['person', 'legal'],
        isArray: true,
        required: true,
        title: 'انواع کاربر متناسب',
        width: 4,
        items: [
          { value: 'person', text: 'حقیقی' },
          { value: 'legal', text: 'حقوقی' }
        ]
      },
      {
        key: 'description',
        type: 'string',
        required: true,
        title: 'توضیح',
        longText: true
      },
      {
        key: 'conditions',
        type: 'string',
        ref: 'Condition',
        isArray: true,
        title: 'شرایط دسترسی',
        hideInTable: true
      }
    ]
  },
  {
    key: 'testVersionPolicy',
    type: 'string',
    ref: 'ApiPolicy',
    title: 'سیاست دسترسی تستی',
    hideInTable: true
  }
]);


export const ApiEndpointModel      = maker.getModel();
export const ApiEndpointController = maker.getController();


maker.setValidations({
  'slug': [
    async ({ slug }, e) => isSlug(slug) || e('شناسه صحیح وارد نشده است.'),
    async ({ _id, slug }, e) => (await ApiEndpointController.count({ filters: { _id: { $ne: _id }, slug } })) === 0 || e('این شناسه قبلا وارد شده است.')
  ]
});


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-endpoint.list'] */ },
  { template: 'LIST_COUNT', /* permissions: ['admin.api-endpoint.list-count'] */ },
  { template: 'RETRIEVE', /* permissions: ['admin.api-endpoint.retrieve'] */ },
  { template: 'CREATE', permissions: ['admin.api-endpoint.create'] },
  { template: 'UPDATE', permissions: ['admin.api-endpoint.update'] },
  { template: 'DELETE', permissions: ['admin.api-endpoint.delete'] },
  { // get filled categories
    method: 'GET',
    path: '/categories/filled',
    signal: ['Route', 'ApiEndpoint', 'CategoriesFilled'],
    dataProvider: async () => {

      const endpoints = await ApiEndpointController.list({});

      const categoryIds = [... new Set( endpoints.map(it => it.category) )];

      const categories = await DataCategoryController.list({
        filters: {
          _id: { $in: categoryIds }
        },
        includes: {
          'thumbnail': 'path'
        },
        sorts: {
          'order': 1
        },
        limit: 30,
      });

      for (let i = 0; i < categories.length; i++) {
        if (!categories[i].parent) continue;

        categories[i] = await DataCategoryController.retrieve({
          resourceId: categories[i].parent,
          includes: {
            'thumbnail': 'path'
          },
        });

        i--;

      }

      return uniqBy(categories, it => String(it._id));

    }
  },
  { // get filled categories
    method: 'GET',
    path: '/categories/filled/tree',
    signal: ['Route', 'ApiEndpoint', 'CategoriesFilledTree'],
    dataProvider: async () => {

      const endpoints = await ApiEndpointController.list({});

      const categoryIds = [... new Set( endpoints.map(it => it.category) )];

      const categories = await DataCategoryController.list({
        filters: {
          _id: { $in: categoryIds }
        },
        includes: {
          'thumbnail': 'path'
        },
        sorts: {
          'order': 1
        },
        limit: 30,
      });

      for (let i = 0; i < categories.length; i++) {

        if (!categories[i].parent) {
          continue;
        }

        if (categories.some(it => categories[i].parent === String(it._id))) {
          continue;
        }

        categories.push(
          await DataCategoryController.retrieve({
            resourceId: categories[i].parent,
            includes: {
              'thumbnail': 'path'
            },
          })
        );

      }

      return uniqBy(categories, it => String(it._id));

    }
  },
  { // get categories tree
    method: 'GET',
    path: '/categories/tree/2',
    signal: ['Route', 'ApiEndpoint', 'CategoriesTree22'],
    dataProvider: async () => {

      const endpoints = await ApiEndpointController.list({});

      const categoryIds = [... new Set( endpoints.map(it => it.category) )];

      const categories = await DataCategoryController.list({
        filters: {
          _id: { $in: categoryIds }
        },
        includes: {
          'thumbnail': 'path'
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
            'thumbnail': 'path'
          },
        }));

      }

      return uniqBy(categories, it => String(it._id));

    }
  },
  { // search
    method: 'POST',
    path: '/search',
    signal: ['Route', 'ApiEndpoint', 'Search'],
    dataProvider: async ({ payload }) => {

      const { parentCategory, query } = payload;
      const filters: any = {};


      if (parentCategory) {
        filters['category'] = { $in: await getSuccessorIds(parentCategory) };
      }

      if (query) {

        const validTimeTags = await TimeTagController.list({
          filters: {
            title: { $regex: new RegExp(query, 'i') }
          },
        });

        const validPublishers = await PublisherController.list({
          filters: {
            title: { $regex: new RegExp(query, 'i') }
          },
        });

        filters['$or'] = [
          {
            title: { $regex: new RegExp(query, 'i') },
          },
          {
            description: { $regex: new RegExp(query, 'i') },
          },
          {
            region: Number(query) || 0,
          },
          {
            specialties: { $regex: new RegExp(query, 'i') } as any,
          },
          {
            timeTags: { $in: validTimeTags.map(it => it._id) },
          },
          {
            publisher: { $in: validPublishers.map(it => it._id) },
          },
        ];

      }


      return ApiEndpointController.list({
        filters,
        includes: {
          'category': '',
          'category.thumbnail': 'path',
          'publisher': '',
        },
        skipKeyCheck: true,
      });

    }
  },
  { // search custom
    method: 'GET',
    path: '/custom/search',
    signal: ['Route', 'ApiEndpoint', 'SearchCustom'],
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

        const allTimeTags = await TimeTagController.list({
          lean: true
        });

        const targetTimeTags = allTimeTags.filter(timeTag => {

          const [tagStart, _tagEnd] = (
            timeTag.title.split('-')
              .map(Number)
              .map(it => it > 1300 ? it : 1300 + it)
          );

          const tagEnd = _tagEnd || tagStart;


          const [filterStart, filterEnd] = (
            [timeFrom, timeTo]
              .map(Number)
              .map(it => it > 1300 ? it : 1300 + it)
          );


          if (filterStart & filterEnd) {
            return (filterStart <= tagStart && filterEnd >= tagEnd) || (filterStart >= tagStart && filterStart <= tagEnd) || (filterEnd >= tagStart && filterEnd <= tagEnd);
          }
          else if (filterStart) {
            return filterStart <= tagStart || filterStart <= tagEnd;
          }
          else {
            return tagStart <= filterEnd || tagEnd <= filterEnd;
          }

        });


        filters['timeTags'] = { $in: targetTimeTags.map(it => it._id) };

      }

      if (tags) {
        filters['specialties'] = { $regex: new RegExp(tags, 'i') };
      }

      return ApiEndpointController.list({
        filters,
        includes: {
          'category': '',
          'category.thumbnail': 'path',
          'publisher': ''
        },
        limit: 30,
        skipKeyCheck: true
      });

    }
  },
  { // search
    method: 'GET',
    path: '/list/all',
    signal: ['Route', 'ApiEndpoint', 'ListAll'],
    dataProvider: async ({ }) => {
      return ApiEndpointController.list({});
    },
  },
]);


export const ApiEndpointRouter = maker.getRouter();
