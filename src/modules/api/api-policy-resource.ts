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
    longText: true,
    hideInTable: true,
  },
  {
    key: 'hasPaymentConfig',
    type: 'boolean',
    title: 'تنطیمات پرداخت دارد؟'
  },
  {
    vIf: { hasPaymentConfig: true },
    key: 'paymentStaticCost',
    type: 'number',
    title: 'هزینه ثابت اولیه (ریال)',
    hideInTable: true,
  },
  {
    vIf: { hasPaymentConfig: true },
    key: 'paymentFreeSessionType',
    type: 'string',
    enum: ['none', 'oneTime', 'interval'],
    title: 'نوع دوره رایگان',
    items: [
      { value: 'none', text: 'ندارد' },
      { value: 'oneTime', text: 'یک بار' },
      { value: 'interval', text: 'دوره‌ای' }
    ],
    hideInTable: true,
  },
  {
    vIf: { hasPaymentConfig: true, paymentFreeSessionType: { $in: ['oneTime', 'interval'] } },
    key: 'paymentFreeSessionInterval',
    type: 'string',
    enum: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    title: 'نوع زمان‌بندی دوره رایگان',
    items: [
      { value: 'second', text: 'ثانیه' },
      { value: 'minute', text: 'دقیقه' },
      { value: 'hour', text: 'ساعت' },
      { value: 'day', text: 'روز' },
      { value: 'week', text: 'هفته' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ],
    hideInTable: true,
  },
  {
    vIf: { hasPaymentConfig: true, paymentFreeSessionType: { $in: ['oneTime', 'interval'] } },
    key: 'paymentFreeSessionIntervalCount',
    type: 'number',
    title: 'عدد زمان‌بندی دوره رایگان',
    hideInTable: true,
  },
  {
    vIf: { hasPaymentConfig: true, paymentFreeSessionType: { $in: ['oneTime', 'interval'] } },
    key: 'paymentFreeSessionRequests',
    type: 'number',
    title: 'تعداد درخواست دوره رایگان',
    hideInTable: true,
  },
  {
    vIf: { hasPaymentConfig: true },
    key: 'paymentRequestCost',
    type: 'number',
    title: 'هزینه یک درخواست غیر رایگان (ریال)',
    hideInTable: true,
  },
  {
    key: 'hasRateLimit',
    type: 'boolean',
    title: 'محدودیت درخواست دارد؟'
  },
  {
    vIf: { hasRateLimit: true },
    key: 'rateLimitDuration',
    type: 'string',
    enum: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    title: 'دوره',
    items: [
      { value: 'second', text: 'ثانیه' },
      { value: 'minute', text: 'دقیقه' },
      { value: 'hour', text: 'ساعت' },
      { value: 'day', text: 'روز' },
      { value: 'week', text: 'هفته' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ],
    hideInTable: true,
  },
  {
    vIf: { hasRateLimit: true },
    key: 'rateLimitDurationMultiplier',
    type: 'number',
    title: 'تعداد دوره',
    hideInTable: true,
  },
  {
    vIf: { hasRateLimit: true },
    key: 'rateLimitPoints',
    type: 'number',
    title: 'تعداد',
    hideInTable: true,
  }
]);


export const ApiPolicyModel      = maker.getModel();
export const ApiPolicyController = maker.getController();


maker.setValidations({
  'rateLimitDurationMultiplier': [
    async (it, e) => it.rateLimitDurationMultiplier > 0 || e('تعداد دوره باید بیشتر از 0 باشد.')
  ]
});


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-policy.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-policy.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-policy.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-policy.create'] },
  { template: 'UPDATE', permissions: ['admin.api-policy.update'] },
  { template: 'DELETE', permissions: ['admin.api-policy.delete'] }
]);


export const ApiPolicyRouter = maker.getRouter();
