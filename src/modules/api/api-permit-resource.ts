import { IApiPermit, IApiPermitBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiPermitBase, IApiPermit>('ApiPermit');


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
    title: 'واحد Api',
    titleable: true
  },
  {
    key: 'enabled',
    type: 'boolean',
    title: 'فعال'
  },
  {
    key: 'blocked',
    type: 'boolean',
    title: 'بلاک شده'
  },
  {
    key: 'blockedAt',
    type: 'number',
    title: 'زمان بلاک شدن',
    labelFormat: 'jYYYY/jMM/jDD',
    dir: 'ltr'
  },
  {
    key: 'blockageReason',
    type: 'string',
    title: 'دلیل بلاک شدن',
    longText: true
  },
  {
    key: 'apiKey',
    type: 'string',
    required: true,
    title: 'کلید Api'
  },
  {
    key: 'identifier',
    type: 'string',
    required: true,
    title: 'شناساگر'
  },
  {
    key: 'policy',
    type: 'string',
    ref: 'ApiPolicy',
    required: true,
    title: 'سیاست‌ها'
  },
  {
    key: 'filterType',
    type: 'string',
    enum: ['whitelist', 'blacklist'],
    title: 'نوع فیلتر خروجی‌ها',
    items: [
      { value: 'whitelist', text: 'لیست سفید' },
      { value: 'blacklist', text: 'لیست سیاه' }
    ]
  },
  {
    key: 'filterProperties',
    type: 'string',
    isArray: true,
    title: 'پراپرتی‌های فیلتر شده'
  },
  {
    key: 'transforms',
    type: 'series',
    title: 'تبدیل‌ها',
    serieBase: { code: '(input) => {\n\n};' },
    serieSchema: [
      {
        key: 'property',
        type: 'string',
        required: true,
        title: 'پراپرتی'
      },
      {
        key: 'code',
        type: 'string',
        required: true,
        title: 'کد تبدیل کننده',
        longText: true
      }
    ]
  }
]);


export const ApiPermitModel      = maker.getModel();
export const ApiPermitController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-permit.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-permit.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-permit.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-permit.create'] },
  { template: 'UPDATE', permissions: ['admin.api-permit.update'] },
  { template: 'DELETE', permissions: ['admin.api-permit.delete'] }
]);


export const ApiPermitRouter = maker.getRouter();
