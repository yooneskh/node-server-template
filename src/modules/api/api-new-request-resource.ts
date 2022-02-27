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
    key: 'callType',
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
    vIf: { callType: 'specific-period-transfer' },
    key: 'callTypeFromDate',
    type: 'number',
    title: 'از تاریخ',
    hideInTable: true,
    labelFormat: 'jYYYY/jMM/jDD',
    width: 6
  },
  {
    vIf: { callType: 'specific-period-transfer' },
    key: 'callTypeUntilDate',
    type: 'number',
    title: 'تا تاریخ',
    hideInTable: true,
    labelFormat: 'jYYYY/jMM/jDD',
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
    key: 'callDuration',
    type: 'string',
    enum: ['day', 'month', 'year'],
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
