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
    title: 'عنوان محصول'
  },
  {
    key: 'formProductType',
    type: 'string',
    title: 'نوع محصول',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formIp',
    type: 'string',
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formCallType',
    type: 'string',
    enum: ['automatic-transfer', 'repetitive-tranfer', 'daily-transfer' , 'weekly-transfer' , 'monthly-transfer' , 'specific-period-transfer'],
    items: [
      { value: 'automatic-transfer', text: 'انتقال اتوماتیک' },
      { value: 'repetitive-tranfer', text: 'انتقال تکرار شونده' },
      { value: 'daily-transfer', text: ' انتقال اطلاعات به صورت روزانه' },
      { value: 'weekly-transfer', text: ' انتقال اطلاعات به صورت هفتگی' },
      { value: 'monthly-transfer', text: ' انتقال اطلاعات به صورت ماهانه' },
      { value: 'specific-period-transfer', text: 'انتقال اطلاعات از تاریخ تا تاریخ ' }
    ],
    title: 'نوع فراخوانی',
    hideInTable: true
  },
  {
    vIf: { formCallType: 'specific-period-transfer' },
    key: 'formCallTypeFromDate',
    type: 'number',
    title: 'از تاریخ',
    labelFormat: 'jYYYY/jMM/jDD',
    hideInTable: true,
    width: 6
  },
  {
    vIf: { formCallType: 'specific-period-transfer' },
    key: 'formCallTypeUntilDate',
    type: 'number',
    title: 'تا تاریخ',
    labelFormat: 'jYYYY/jMM/jDD',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formValidityDurationCount',
    type: 'number',
    title: 'تعداد دوره مدت زمان اعتبار',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formValidityDuration',
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
    key: 'formCallCount',
    type: 'number',
    title: 'تعداد فراخوانی در دوره',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formCallCountDuration',
    type: 'string',
    enum: ['day', 'month' , 'year'],
    items: [
      { value: 'day', text: 'روز' },
      { value: 'month', text: 'ماه' },
      { value: 'year', text: 'سال' }
    ],
    title: ' مدت زمان دوره',
    hideInTable: true,
    width: 6
  },
  {
    key: 'formDescription',
    type: 'string',
    title: 'توضیحات',
    hideInTable: true,
    longText: true
  },
  {
    key: 'selectedOffer',
    type: 'string',
    hidden: true
  },
  {
    key: 'isCompleted',
    type: 'boolean',
    title: 'تکمیل شده',
    width: 6
  },
  {
    vIf: { isCompleted: true },
    key: 'completedAt',
    type: 'number',
    title: 'زمان تکمیل',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    key: 'isAccepted',
    type: 'boolean',
    title: 'تایید شده',
    width: 6
  },
  {
    vIf: { isAccepted: true },
    key: 'acceptedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    key: 'isRejected',
    type: 'boolean',
    title: 'رد شده',
    width: 6
  },
  {
    vIf: { isRejected: true },
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    vIf: { isRejected: true },
    key: 'rejectedFor',
    type: 'string',
    title: 'دلیل رد'
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
