import { IApiNewRequest, IApiNewRequestBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiNewRequestBase, IApiNewRequest>('ApiNewRequest');


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
    key: 'productTitle',
    type: 'string',
    required: true,
    title: 'عنوان محصول'
  },
  {
    key: 'productType',
    type: 'string',
    required: true,
    title: 'نوع محصول',
    hideInTable: true
  },
  {
    key: 'ip',
    type: 'string',
    required: true,
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true
  },
  {
    key: 'callType',
    type: 'string',
    required: true,
    title: 'نوع فراخوانی',
    hideInTable: true
  },
  {
    key: 'callAmount',
    type: 'string',
    required: true,
    title: 'تعداد فراخوانی',
    hideInTable: true
  },
  {
    key: 'validityDuration',
    type: 'string',
    required: true,
    title: 'مدت زمان اعتبار',
    hideInTable: true
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    hideInTable: true,
    longText: true
  }
]);


export const ApiNewRequestModel      = maker.getModel();
export const ApiNewRequestController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-new-request.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.api-new-request.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.api-new-request.retrieve']  */},
  { template: 'CREATE', /* permissions: ['admin.api-new-request.create']  */},
  { template: 'UPDATE', permissions: ['admin.api-new-request.update'] },
  { template: 'DELETE', permissions: ['admin.api-new-request.delete'] }
]);


export const ApiNewRequestRouter = maker.getRouter();
