import { IApiVersion, IApiVersionBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { makeHttpParamProperty, makeHttpParamValueProperty } from './api-util';
import { runHttpApi , runSoapApi } from './runner/api-http-runner';
import { ServerError } from '../../global/errors';
import { ApiEndpointController } from './api-endpoint-resource';
import { ApiPermitController } from './api-permit-resource';


const maker = new ResourceMaker<IApiVersionBase, IApiVersion>('ApiVersion');


maker.addProperties([
  {
    key: 'endpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'واحد Api',
    titleable: true,
    width: 4
  },
  {
    key: 'version',
    type: 'number',
    required: true,
    title: 'شماره نسخه',
    titleable: true,
    width: 4
  },
  {
    key: 'type',
    type: 'string',
    enum: ['http' , 'soap' ],
    required: true,
    title: 'نوع',
    items: [
      { value: 'http', text: 'HTTP' },
      { value: 'soap', text: 'SOAP' }
    ],
    width: 4
  },
  {
    key: 'url',
    type: 'string',
    title: 'مسیر',
    dir: 'ltr',
    width: 8
  },
  {
    vIf: { 'type': 'http' },
    key: 'method',
    type: 'string',
    enum: ['get', 'post', 'put', 'patch', 'delete'],
    title: 'متود',
    items: [
      { value: 'get', text: 'Get' },
      { value: 'post', text: 'Post' },
      { value: 'put', text: 'Put' },
      { value: 'patch', text: 'Patch' },
      { value: 'delete', text: 'Delete' }
    ],
    hideInTable: true,
    width: 4
  },
  {
    vIf: { 'type': 'http' },
    ...makeHttpParamProperty('queryParams', 'پارامتر کوئری'),
    width: 4,
    hideInTable: true
  },
  {
    vIf: { 'type': 'http' },
    ...makeHttpParamProperty('pathParams', 'پارامتر مسیر'),
    width: 4,
    hideInTable: true
  },
  {
    vIf: { 'type': 'http' },
    ...makeHttpParamProperty('headers', 'Headerها'),
    width: 4,
    hideInTable: true
  },
  {
    ...makeHttpParamValueProperty('staticHeaders', 'Headerهای ثابت'),
    hideInTable: true
  },
  {
    key: 'disabled',
    type: 'boolean',
    title: 'غیر فعال شده',
    hideInTable: true
  },
  {
    vIf: { disabled: true },
    key: 'disabledMessage',
    type: 'string',
    title: 'پیام غیر فعال بودن',
    hideInTable: true,
    longText: true
  },
  {
    key: 'hasBody',
    type: 'boolean',
    title: 'داده Body دارد؟',
    hideInTable: true
  },
  {
    vIf: { 'hasBody': true },
    key: 'bodySchema',
    type: 'any',
    title: 'اسکیمای Body',
    handlerElement: 'json-schema',
    hideInTable: true
  },
  {
    vIf: { 'hasBody': true },
    key: 'bodyKeyDescriptions',
    type: 'series',
    serieBase: {},
    serieSchema: [
      {
        key: 'key',
        type: 'string',
        required: true,
        title: 'کلید',
        dir: 'ltr'
      },
      {
        key: 'description',
        type: 'string',
        required: true,
        title: 'توضیحات',
        longText: true
      }
    ],
    title: 'توضیحات کلید‌های Body',
    itemWidth: 4,
    hideInTable: true
  },
  {
    vIf: { 'type': 'soap' },
    key: 'soapBody',
    type: 'string',
    title: 'قالب xml',
    hideInTable: true,
    dir: 'ltr',
    longText: true
  },
  {
    key: 'responses',
    type: 'series',
    serieBase: {},
    serieSchema: [
      {
        key: 'title',
        type: 'string',
        required: true,
        title: 'عنوان',
        width: 6
      },
      {
        key: 'status',
        type: 'number',
        required: true,
        title: 'مقدار Http Status',
        width: 6
      },
      {
        key: 'description',
        type: 'string',
        title: 'توضیحات',
        longText: true
      },
      {
        key: 'responseSchema',
        type: 'any',
        title: 'اسکیمای جواب',
        handlerElement: 'json-schema'
      },
      {
        key: 'responseKeyDescriptions',
        type: 'series',
        serieBase: {},
        serieSchema: [
          {
            key: 'key',
            type: 'string',
            required: true,
            title: 'کلید',
            dir: 'ltr'
          },
          {
            key: 'description',
            type: 'string',
            required: true,
            title: 'توضیحات',
            longText: true
          }
        ],
        title: 'توضیحات کلیدهای جواب'
      }
    ],
    title: 'جواب‌ها',
    itemWidth: 6,
    hideInTable: true
  }
]);


export const ApiVersionModel      = maker.getModel();
export const ApiVersionController = maker.getController();


maker.setValidations({
  'version': [
    async ({ _id, endpoint, version }, e) => (await ApiVersionController.count({ filters: { _id: { $ne: _id }, endpoint, version } })) === 0 || e('این نسخه قبلا وارد شده است.')
  ]
});


maker.addActions([
  { template: 'LIST', /* permissions: ['admin.api-version.list'] */ },
  { template: 'LIST_COUNT', /* permissions: ['admin.api-version.list-count'] */ },
  { template: 'RETRIEVE', /* permissions: ['admin.api-version.retrieve'] */ },
  { template: 'CREATE', permissions: ['admin.api-version.create'] },
  { template: 'UPDATE', permissions: ['admin.api-version.update'] },
  { template: 'DELETE', permissions: ['admin.api-version.delete'] },
  { // run api
    method: 'POST',
    path: '/:resourceId/run',
    signal: ['Route', 'ApiVersion', 'Run'],
    permissions: ['admin.api-version.run'],
    dataProvider: async ({ resourceId, payload }) => {

      const apiVersion = await ApiVersionController.retrieve({ resourceId });

      if (apiVersion.type === 'http') {

        const runResult = await runHttpApi(apiVersion, payload);
        if (runResult.type === 'error') throw runResult.error;

        const { status, data, headers, latency } = runResult;

        return {
          status,
          result: data,
          headers,
          latency
        };

      }
      else if(apiVersion.type === 'soap'){

        const runResult = await runSoapApi(apiVersion, payload);
        if (runResult.type === 'error') throw runResult.error;

        const { status, data, headers, latency } = runResult;

        return {
          status,
          result: data,
          headers,
          latency
        };

      }

      throw new ServerError('only http and soap types are implemented.', 'فقط نوع http و soap پیاده سازی شده است.');

    }
  },
  { // run api
    method: 'GET',
    path: '/:resourceId/users',
    signal: ['Route', 'ApiVersion', 'ListUsers'],
    permissions: ['admin.api-version.list-users'],
    dataProvider: async ({ resourceId }) => {

      const apiVersion = await ApiVersionController.retrieve({ resourceId });
      const apiEndpoint = await ApiEndpointController.retrieve({ resourceId: apiVersion.endpoint });

      return ApiPermitController.list({
        filters: {
          apiEndpoint: apiEndpoint._id
        },
        selects: 'user enabled blocked',
        includes: {
          'user': 'name firstName lastName phoneNumber'
        }
      });

    }
  }
]);


export const ApiVersionRouter = maker.getRouter();
