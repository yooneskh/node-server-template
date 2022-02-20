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
    hideInTable: true
  },
  {
    key: 'formIp',
    type: 'string',
    title: 'آی‌پی سرور استفاده کننده',
    hideInTable: true
  },
  {
    key: 'formCallType',
    type: 'string',
    enum: ['automatic-transfer', 'repetitive-tranfer', 'daily-transfer' , 'weekly-transfer' , 'monthly-transfer' , 'specifiic-period-transfer'],
    title: 'نوع فراخوانی',
    hideInTable: true
  },
  {
    vIf: {formCallType: 'specifiic-period-transfer'},
    key: 'callTypeFromDate',
    type: 'number',
    title: 'از تاریخ',
    hideInTable: true,
    labelFormat: "jYYYY/jMM/jDD"
  },
  {
    vIf: {formCallType: 'specifiic-period-transfer'},
    key: 'callTypeUntilDate',
    type: 'number',
    title: 'تا تاریخ',
    hideInTable: true,
    labelFormat: "jYYYY/jMM/jDD"
  },
  {
    key: 'formValidityDurationCount',
    type: 'number',
    title: 'تعداد دوره مدت زمان اعتبار',
    hideInTable: true
  },
   {
    key: 'formValidityDuration',
    type: 'string',
    enum:['day', 'month' , 'year'],
    title: 'دوره مدت زمان اعتبار ',
    hideInTable: true
  },
    {
    key: 'formCallCount',
    type: 'number',
    title: 'تعداد فراخوانی در دوره',
    hideInTable: true
  },
    {
    key: 'formCallDuration',
    type: 'string',
    enum:['day', 'month' , 'year'],   
    title: ' مدت زمان دوره',
    hideInTable: true
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
    title: 'تکمیل شده'
  },
  {
    key: 'completedAt',
    type: 'number',
    title: 'زمان تکمیل',
    labelFormat: 'jYYYY/jMM/jDD'
  },
  {
    key: 'isAccepted',
    type: 'boolean',
    title: 'تایید شده'
  },
  {
    key: 'acceptedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD'
  },
  {
    key: 'isRejected',
    type: 'boolean',
    title: 'رد شده'
  },
  {
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD'
  },
  {
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
