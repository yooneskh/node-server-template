import { IApiService, IApiServiceBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


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
    key: 'picture',
    type: 'string',
    ref: 'Media',
    required: true,
    title: 'تصویر'
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    longText: true
  },
]);


export const ApiServiceModel      = maker.getModel();
export const ApiServiceController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-service.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-service.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-service.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-service.create'] },
  { template: 'UPDATE', permissions: ['admin.api-service.update'] },
  { template: 'DELETE', permissions: ['admin.api-service.delete'] }
]);


export const ApiServiceRouter = maker.getRouter();
