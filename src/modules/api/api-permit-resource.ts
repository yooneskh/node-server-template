import { IApiPermit, IApiPermitBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { NotFoundError } from '../../global/errors';
import { ApiLogController } from './api-log-resource';


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
    dir: 'ltr',
    hideInTable: true,
  },
  { // blockageReason
    vIf: { blocked: true },
    key: 'blockageReason',
    type: 'string',
    title: 'دلیل بلاک شدن',
    longText: true,
    hideInTable: true,
  },
  { // apiKey
    key: 'apiKey',
    type: 'string',
    required: true,
    title: 'کلید Api',
    hideInTable: true,
  },
  { // identifier
    key: 'identifier',
    type: 'string',
    required: true,
    title: 'شناساگر',
    hideInTable: true,
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
    ],
    hideInTable: true,
  },
  { // filterProperties
    vIf: { filterType: { $in: ['whitelist', 'blacklist'] } },
    key: 'filterProperties',
    type: 'string',
    isArray: true,
    title: 'پراپرتی‌های فیلتر شده',
    dir: 'ltr',
    hideInTable: true,
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
    ],
    hideInTable: true,
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
    valueFormat : 'YYYY/MM/DD',
    hideInTable: true,
  },
  { // validFromTime
    vIf : { validFromEnabled: true },
    key: 'validFromTime',
    type: 'string',
    title: 'معتبر از زمان',
    dir: 'ltr',
    hideInTable: true,
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
    valueFormat : 'YYYY/MM/DD',
    hideInTable: true,
  },
  { // validToTime
    vIf : { validToEnabled: true },
    key: 'validToTime',
    type: 'string',
    title: 'معتبر تا زمان',
    dir: 'ltr',
    hideInTable: true,
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
  { template: 'DELETE', permissions: ['admin.api-permit.delete'] },
  {
    method: 'GET',
    path: '/:resourceId/usage',
    signal: ['Route', 'ApiPermit', 'GetUsage'],
    permissionFunction: async ({ user }) => !!user,
    dataProvider: async ({ resourceId, user }) => {

      const permit = await ApiPermitController.retrieve({
        resourceId,
        includes: {
          'apiEndpoint': '',
          'policy': '',
        }
      });

      if (permit.user !== String(user!._id)) {
        throw new NotFoundError('مورد خواسته شده یافت نشد.');
      }


      return {
        permit,
        logs: await ApiLogController.list({
          filters: {
            permit: permit._id,
          }
        }),
      };

    }
  }
]);


export const ApiPermitRouter = maker.getRouter();
