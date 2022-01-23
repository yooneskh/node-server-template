import { IApiRequest, IApiRequestBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiRequestBase, IApiRequest>('ApiRequest');


maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'apiEndpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'وب سرویس',
    titleable: true
  },
  {
    key: 'formProductTitle',
    type: 'string',
    required: true,
    title: 'عنوان محصول'
  },
  {
    key: 'formProductType',
    type: 'string',
    required: true,
    title: 'نوع محصول',
    hideInTable: true
  },
  {
    key: 'formIp',
    type: 'string',
    required: true,
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true
  },
  {
    key: 'formCallType',
    type: 'string',
    required: true,
    title: 'نوع فراخوانی',
    hideInTable: true
  },
  {
    key: 'formCallAmount',
    type: 'string',
    required: true,
    title: 'تعداد فراخوانی',
    hideInTable: true
  },
  {
    key: 'formValidityDuration',
    type: 'string',
    required: true,
    title: 'مدت زمان اعتبار',
    hideInTable: true
  },
  {
    key: 'formDescription',
    type: 'string',
    required: true,
    title: 'توضیحات',
    hideInTable: true,
    longText: true
  },
  {
    key: 'completed',
    type: 'boolean',
    title: 'تکمیل شده'
  }
]);


export const ApiRequestModel      = maker.getModel();
export const ApiRequestController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-request.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.api-request.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.api-request.retrieve']  */},
  { template: 'CREATE', /* permissions: ['admin.api-request.create']  */},
  { template: 'UPDATE', /* permissions: ['admin.api-request.update']  */},
  { template: 'DELETE', /* permissions: ['admin.api-request.delete']  */}
]);


export const ApiRequestRouter = maker.getRouter();
