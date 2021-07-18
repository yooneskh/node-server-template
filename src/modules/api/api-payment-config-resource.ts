import { IApiPaymentConfig, IApiPaymentConfigBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiPaymentConfigBase, IApiPaymentConfig>('ApiPaymentConfig');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'freeSessionType',
    type: 'string',
    enum: ['none', 'oneTime', 'interval'],
    required: true,
    title: 'نوع دوره رایگان',
    items: [
      { value: 'none', text: 'ندارد' },
      { value: 'oneTime', text: 'یک بار' },
      { value: 'interval', text: 'دوره‌ای' }
    ]
  },
  {
    vIf: { freeSessionType: ['oneTime', 'interval'] },
    key: 'freeSessionInterval',
    type: 'string',
    enum: ['day', 'week', 'month', 'year'],
    title: 'نوع زمان‌بندی دوره رایگان',
    items: [
      { value: 'day', text: 'روز' },
      { value: 'week', text: 'هفته' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ]
  },
  {
    vIf: { freeSessionType: ['oneTime', 'interval'] },
    key: 'freeSessionIntervalCount',
    type: 'number',
    title: 'عدد زمان‌بندی دوره رایگان'
  },
  {
    vIf: { freeSessionType: ['oneTime', 'interval'] },
    key: 'freeSessionRequests',
    type: 'number',
    title: 'تعداد درخواست دوره رایگان'
  },
  {
    key: 'requestCost',
    type: 'number',
    required: true,
    title: 'هزینه یک درخواست غیر رایگان (تومان)'
  }
]);


export const ApiPaymentConfigModel      = maker.getModel();
export const ApiPaymentConfigController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-payment-config.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-payment-config.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-payment-config.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-payment-config.create'] },
  { template: 'UPDATE', permissions: ['admin.api-payment-config.update'] },
  { template: 'DELETE', permissions: ['admin.api-payment-config.delete'] }
]);


export const ApiPaymentConfigRouter = maker.getRouter();
