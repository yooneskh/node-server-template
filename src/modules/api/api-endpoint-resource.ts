import { IApiEndpoint, IApiEndpointBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { isSlug } from '../../util/validators';
import { DataCategoryController } from '../data/data-category-resource';


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
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    longText: true,
    hideInTable: true
  },
  {
    key: 'specialties',
    type: 'string',
    isArray: true,
    title: 'ویژگی‌ها',
    hideInTable: true
  },
  {
    key: 'body',
    type: 'string',
    required: true,
    title: 'متن توصیف',
    richText: true,
    hideInTable: true
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
      }
    ]
  },
  {
    key: 'conditions',
    type: 'string',
    ref: 'Condition',
    isArray: true,
    title: 'شرایط دسترسی',
    hideInTable: true
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
  {
    method: 'GET',
    path: '/categories/filled',
    signal: ['Route', 'ApiEndpoint', 'categoriesFilled'],
    dataProvider: async () => {

      const endpoints = await ApiEndpointController.list({});

      const categoryIds = [... new Set( endpoints.map(it => it.category) )];

      return DataCategoryController.list({
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

    }
  }
]);


export const ApiEndpointRouter = maker.getRouter();
