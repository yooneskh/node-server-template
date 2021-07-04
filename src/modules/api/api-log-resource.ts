import { IApiLog, IApiLogBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { makeHttpParamProperty } from './api-util';


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
    key: 'latency',
    type: 'number',
    required: true,
    title: 'تاخیر اجرا'
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
    ...makeHttpParamProperty('requestHeaders', 'Headerهای درخواست')
  },
  {
    ...makeHttpParamProperty('requestQueryParams', 'Query Param های درخواست')
  },
  {
    ...makeHttpParamProperty('requestPathParams', 'Path Param های درحواست')
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
    ...makeHttpParamProperty('responseHeaders', 'Headerهای جواب')
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
