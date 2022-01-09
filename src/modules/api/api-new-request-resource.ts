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
    key: 'company',
    type: 'string',
    required: true,
    title: 'نام سازمان'
  },
  {
    key: 'reason',
    type: 'string',
    required: true,
    title: 'دلیل استفاده',
    hideInTable: true,
    longText: true
  },
  {
    key: 'ip',
    type: 'string',
    required: true,
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true
  },
  {
    key: 'usageDuration',
    type: 'string',
    required: true,
    title: 'مدت استفاده',
    hideInTable: true
  },
  {
    key: 'address',
    type: 'string',
    required: true,
    title: 'آدرس',
    hideInTable: true
  }
]);


export const ApiNewRequestModel      = maker.getModel();
export const ApiNewRequestController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-new-request.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-new-request.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-new-request.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-new-request.create'] },
  { template: 'UPDATE', permissions: ['admin.api-new-request.update'] },
  { template: 'DELETE', permissions: ['admin.api-new-request.delete'] }
]);


export const ApiNewRequestRouter = maker.getRouter();
