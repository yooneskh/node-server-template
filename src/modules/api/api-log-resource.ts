import { IApiLog, IApiLogBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiLogBase, IApiLog>('ApiLog');


maker.addProperties([
  {
    key: 'permit',
    type: 'string',
    ref: 'ApiPermit',
    required: true,
    title: 'مجوز Api',
    titleable: true
  },
  {
    key: 'api',
    type: 'string',
    ref: 'ApiVersion',
    required: true,
    title: 'نسخه Api'
  },
  {
    key: 'apiType',
    type: 'string',
    enum: ['http' , 'soap' ],
    required: true,
    title: 'نوع Api‍',
    items: [
      { value: 'http', text: 'HTTP' }
    ]
  },
  {
    key: 'success',
    type: 'boolean',
    title: 'موفق'
  },
  {
    key: 'startAt',
    type: 'number',
    required: true,
    title: 'زمان شروع',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss',
    hideInTable: true,
    dir: 'ltr'
  },
  {
    key: 'endAt',
    type: 'number',
    required: true,
    title: 'زمان پایان',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss',
    hideInTable: true,
    dir: 'ltr'
  },
  {
    key: 'totalTime',
    type: 'number',
    required: true,
    title: 'مجموع زمان'
  },
  {
    key: 'callerIP',
    type: 'string',
    title: 'IP درخواست کننده'
  },
  {
    key: 'requestMethod',
    type: 'string',
    title: 'متود درخواست',
    hideInTable: true
  },
  {
    key: 'requestUrl',
    type: 'string',
    title: 'Url درخواست',
    hideInTable: true
  },
  {
    key: 'requestHeaders',
    type: 'object',
    title: 'Headerهای درخواست',
    hideInTable: true
  },
  {
    key: 'requestQueryParams',
    type: 'object',
    title: 'Query Param های درخواست',
    hideInTable: true
  },
  {
    key: 'requestPathParams',
    type: 'object',
    title: 'Path Param های درحواست',
    hideInTable: true
  },
  {
    key: 'requestBody',
    type: 'any',
    title: 'داده درخواست',
    hideInTable: true
  },
  {
    key: 'requestBodySize',
    type: 'number',
    title: 'حجم داده درخواست'
  },
  {
    key: 'responseHeaders',
    type: 'object',
    title: 'Headerهای جواب',
    hideInTable: true
  },
  {
    key: 'responseStatus',
    type: 'number',
    title: 'Status جواب'
  },
  {
    key: 'responseSize',
    type: 'number',
    title: 'حجم جواب'
  },
  {
    key: 'responseLatency',
    type: 'number',
    title: 'تاخیر اجرای سرویس'
  },
  {
    key: 'errorMessage',
    type: 'string',
    title: 'پیام خطا',
    hideInTable: true
  },
  {
    key: 'rateLimitRemainingPoints',
    type: 'number',
    title: 'تعداد فراخوانی باقی‌مانده',
    hideInTable: true
  },
  {
    key: 'cost',
    type: 'number',
    title: 'هزینه',
    hideInTable: true
  },
  {
    key: 'costTransfer',
    type: 'string',
    ref: 'Transfer',
    title: 'انتقال هزینه',
    hideInTable: true
  }
]);


export const ApiLogModel      = maker.getModel();
export const ApiLogController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-log.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-log.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-log.retrieve'] },
  {
    method: 'GET',
    path: '/list/api-permit/:apiPermitId',
    signal: ['Route', 'ApiLog', 'ListForApiPermit'],
    permissionFunction: async ({ user }) => !!user,
    dataProvider: async ({ params }) => {

      return ApiLogController.list({
        filters: {
          permit: params.apiPermitId,
        },
      });

    },
  },
]);


export const ApiLogRouter = maker.getRouter();
