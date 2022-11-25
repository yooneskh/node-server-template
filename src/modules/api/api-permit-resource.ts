import { IApiPermit, IApiPermitBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiPermitBase, IApiPermit>('ApiPermit');


maker.addProperties([
  { // user
    key: 'user',
    type: 'string',
    ref: 'User',
    title: 'کاربر',
    titleable: true
  },
  { // receiver
    key: 'receiver',
    type: 'string',
    ref: 'ApiReceiver',
    title: 'تحویل‌گیرنده',
    titleable: true
  },
  { // apiEndpoint
    key: 'apiEndpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'واحد Api',
    titleable: true
  },
  { // enabled
    key: 'enabled',
    type: 'boolean',
    title: 'فعال'
  },
  { // blocked
    key: 'blocked',
    type: 'boolean',
    title: 'بلاک شده'
  },
  { // blockedAt
    vIf: { blocked: true },
    key: 'blockedAt',
    type: 'number',
    title: 'زمان بلاک شدن',
    labelFormat: 'jYYYY/jMM/jDD',
    dir: 'ltr'
  },
  { // blockageReason
    vIf: { blocked: true },
    key: 'blockageReason',
    type: 'string',
    title: 'دلیل بلاک شدن',
    longText: true
  },
  { // apiKey
    key: 'apiKey',
    type: 'string',
    required: true,
    title: 'کلید Api'
  },
  { // identifier
    key: 'identifier',
    type: 'string',
    required: true,
    title: 'شناساگر'
  },
  { // policy
    key: 'policy',
    type: 'string',
    ref: 'ApiPolicy',
    required: true,
    title: 'سیاست‌ها'
  },
  { // filterType
    key: 'filterType',
    type: 'string',
    enum: ['none', 'whitelist', 'blacklist'],
    title: 'نوع فیلتر خروجی‌ها',
    items: [
      { value: 'none', text: 'هیچ کدام' },
      { value: 'whitelist', text: 'لیست سفید' },
      { value: 'blacklist', text: 'لیست سیاه' }
    ]
  },
  { // filterProperties
    vIf: { filterType: { $in: ['whitelist', 'blacklist'] } },
    key: 'filterProperties',
    type: 'string',
    isArray: true,
    title: 'پراپرتی‌های فیلتر شده',
    dir: 'ltr'
  },
  { // transforms
    key: 'transforms',
    type: 'series',
    title: 'تبدیل‌ها',
    serieBase: { code: '(input) => {\n\n};' },
    serieSchema: [
      { // property
        key: 'property',
        type: 'string',
        required: true,
        title: 'پراپرتی',
        dir: 'ltr'
      },
      { // code
        key: 'code',
        type: 'string',
        required: true,
        title: 'کد تبدیل کننده',
        longText: true,
        dir: 'ltr'
      }
    ]
  },
  { // validFromEnable
    key: 'validFromEnabled',
    type: 'boolean',
    title: 'اعتبار ابتدا دارد؟',
  },
  { // validFromDay
    vIf : { validFromEnabled: true },
    key: 'validFromDay',
    type: 'string',
    title: 'معتبر از روز',
    labelFormat: 'jYYYY/jMM/jDD',
    valueFormat : 'YYYY/MM/DD'
  },
  { // validFromTime
    vIf : { validFromEnabled: true },
    key: 'validFromTime',
    type: 'string',
    title: 'معتبر از زمان',
    dir: 'ltr'
  },
  { // validToEnable
    key: 'validToEnabled',
    type: 'boolean',
    title: 'اعتبار انتها دارد؟',
  },
  { // validToDay
    vIf : { validToEnabled: true },
    key: 'validToDay',
    type: 'string',
    title: 'معتبر تا روز',
    labelFormat: 'jYYYY/jMM/jDD',
    valueFormat : 'YYYY/MM/DD'
  },
  { // validToTime
    vIf : { validToEnabled: true },
    key: 'validToTime',
    type: 'string',
    title: 'معتبر تا زمان',
    dir: 'ltr'
  },
  { // isTestPermit
    key: 'isTestPermit',
    type: 'boolean',
    title: 'مجوز آزمایشی',
  },
]);


export const ApiPermitModel      = maker.getModel();
export const ApiPermitController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-permit.list']  */},
  { template: 'LIST_COUNT', /* permissions: ['admin.api-permit.list-count']  */},
  { template: 'RETRIEVE', /* permissions: ['admin.api-permit.retrieve']  */},
  { template: 'CREATE', permissions: ['admin.api-permit.create'] },
  { template: 'UPDATE', permissions: ['admin.api-permit.update'] },
  { template: 'DELETE', permissions: ['admin.api-permit.delete'] }
]);


export const ApiPermitRouter = maker.getRouter();
