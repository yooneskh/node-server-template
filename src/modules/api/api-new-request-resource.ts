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
    key: 'apiTitle',
    type: 'string',
    required: true,
    title: 'عنوان API'
  },
  {
    key: 'apiUse',
    type: 'string',
    required: true,
    title: 'کاربرد API و توضیحات تکمیلی',
    longText: true
  },
  {
    key: 'apiProposedInput',
    type: 'string',
    title: 'ورودی پیشنهادی API'
  },
  {
    key: 'apiProposedOutput',
    type: 'string',
    title: 'خروجی پیشنهادی API'
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
    enum: [
      'وب اپلیکیشن',
      'موبایل اپلیکیشن',
      'سایر',
    ],
    required: true,
    title: 'نوع محصول',
    hideInTable: true,
    width: 6
  },
  {
    key: 'ip',
    type: 'string',
    required: true,
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true,
    width: 6
  },
  {
    key: 'validityDurationCount',
    type: 'number',
    title: 'تعداد دوره مدت زمان اعتبار',
    hideInTable: true,
    width: 6
  },
  {
    key: 'validityDuration',
    type: 'string',
    enum: ['day', 'month' , 'year'],
    items: [
      { value: 'day', text: 'روز' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ],
    title: 'دوره مدت زمان اعتبار',
    hideInTable: true,
    width: 6
  },
  {
    key: 'callCount',
    type: 'number',
    title: 'تعداد فراخوانی در دوره',
    hideInTable: true,
    width: 6
  },
  {
    key: 'callCountDuration',
    type: 'string',
    enum: ['day', 'month', 'year'],
    items: [
      { value: 'day', text: 'روز' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ],
    title: 'مدت زمان دوره',
    hideInTable: true,
    width: 6
  },
  {
    key: 'description',
    type: 'string',
    required: true,
    title: 'توضیحات',
    hideInTable: true,
    longText: true
  },
  {
    key: 'accepted',
    type: 'boolean',
    title: 'تایید شده',
  },
  {
    vIf: { accepted: true },
    key: 'acceptedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD',
  },
  {
    vIf: { accepted: true },
    key: 'resultingApiEndpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    title: 'واحد Api منتج شده',
  },
  {
    key: 'rejected',
    type: 'boolean',
    title: 'رد شده',
  },
  {
    vIf: { rejected: true },
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD',
  },
  {
    vIf: { rejected: true },
    key: 'rejectedFor',
    type: 'string',
    title: 'دلیل رد',
    longText: true,
  },
  {
    key: 'extraState',
    type: 'string',
    enum: [
      'در حال جمع آوری داده',
      'در حال ایجاد وب سرویس',
      'تکمیل شده و آماده درخواست',
      'ارائه Api',
    ],
    title: 'وضعیت توضیحی',
    hideInTable: true,
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
