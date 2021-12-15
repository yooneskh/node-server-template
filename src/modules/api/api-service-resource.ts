import { IApiService, IApiServiceBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { isSlug } from '../../util/validators';


const maker = new ResourceMaker<IApiServiceBase, IApiService>('ApiService');


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
    title: 'شناسه',
    dir: 'ltr'
  },
  {
    key: 'parent',
    type: 'string',
    ref: 'ApiService',
    title: 'دسته‌بندی بالایی'
  },
  {
    key: 'picture',
    type: 'string',
    ref: 'Media',
    title: 'تصویر'
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    longText: true,
    hideInTable: true
  }
]);


export const ApiServiceModel      = maker.getModel();
export const ApiServiceController = maker.getController();


maker.setValidations({
  'slug': [
    async ({ slug }, e) => isSlug(slug) || e('شناسه صحیح وارد نشده است.'),
    async ({ _id, slug }, e) => (await ApiServiceController.count({ filters: { _id: { $ne: _id }, slug } })) === 0 || e('این شناسه قبلا وارد شده است.')
  ]
});


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-service.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-service.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-service.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-service.create'] },
  { template: 'UPDATE', permissions: ['admin.api-service.update'] },
  { template: 'DELETE', permissions: ['admin.api-service.delete'] }
]);


export const ApiServiceRouter = maker.getRouter();
