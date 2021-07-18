import { IApiPolicy, IApiPolicyBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiPolicyBase, IApiPolicy>('ApiPolicy');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    longText: true
  },
  {
    key: 'rateLimitConfig',
    type: 'string',
    ref: 'ApiRateLimitConfig',
    title: 'تنظیمات میزان فراخوانی'
  },
  {
    key: 'paymentConfig',
    type: 'string',
    ref: 'ApiPaymentConfig',
    title: 'تنظیمات پرداخت'
  }
]);


export const ApiPolicyModel      = maker.getModel();
export const ApiPolicyController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-policy.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-policy.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-policy.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-policy.create'] },
  { template: 'UPDATE', permissions: ['admin.api-policy.update'] },
  { template: 'DELETE', permissions: ['admin.api-policy.delete'] }
]);


export const ApiPolicyRouter = maker.getRouter();
