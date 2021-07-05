import { IApiLog, IApiLogBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiLogBase, IApiLog>('ApiLog');


maker.addProperties([
  {
    key: 'api',
    type: 'string',
    ref: 'ApiVersion',
    required: true,
    title: 'نسخه Api',
    titleable: true
  },
  {
    key: 'apiType',
    type: 'string',
    enum: ['http'/* , 'soap' */],
    required: true,
    title: 'نوع Api‍',
    items: [
      { value: 'http', text: 'HTTP' }
    ]
  },
  {
    key: 'success',
    type: 'boolean',
    required: true,
    title: 'موفق'
  },
  {
    key: 'startAt',
    type: 'number',
    required: true,
    title: 'زمان شروع',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
  },
  {
    key: 'endAt',
    type: 'number',
    required: true,
    title: 'زمان پایان',
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss'
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
    title: 'متود درخواست'
  },
  {
    key: 'requestUrl',
    type: 'string',
    title: 'Url درخواست'
  },
  {
    key: 'requestHeaders',
    type: 'object',
    title: 'Headerهای درخواست',
  },
  {
    key: 'requestQueryParams',
    type: 'object',
    title: 'Query Param های درخواست',
  },
  {
    key: 'requestPathParams',
    type: 'object',
    title: 'Path Param های درحواست',
  },
  {
    key: 'requestBody',
    type: 'any',
    title: 'داده درخواست'
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
  },
  {
    key: 'responseStatus',
    type: 'number',
    title: 'Status جواب'
  },
  {
    key: 'responseData',
    type: 'any',
    title: 'داده جواب'
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
    title: 'پیام خطا'
  }
]);


export const ApiLogModel      = maker.getModel();
export const ApiLogController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-log.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-log.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-log.retrieve'] }
]);


export const ApiLogRouter = maker.getRouter();
