import { IApiVersion, IApiVersionBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceModelProperty } from '../../plugins/resource-maker/resource-model-types';
import { runApi } from './tools/api-runner';

const maker = new ResourceMaker<IApiVersionBase, IApiVersion>('ApiVersion');


const makeHttpParamProperty = (key: string, title: string): ResourceModelProperty => ({
  key,
  type: 'series',
  serieBase: {},
  serieSchema: [
    {
      key: 'key',
      type: 'string',
      required: true,
      title: 'کلید',
      width: 6
    },
    {
      key: 'type',
      type: 'string',
      enum: ['string', 'number'],
      required: true,
      title: 'نوع',
      items: [
        { value: 'string', text: 'String' },
        { value: 'number', text: 'Number' }
      ],
      width: 6
    }
  ],
  title
});

maker.addProperties([
  {
    key: 'endpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'واحد Api',
    width: 4
  },
  {
    key: 'version',
    type: 'number',
    required: true,
    title: 'شماره نسخه',
    width: 4
  },
  {
    key: 'type',
    type: 'string',
    enum: ['http'/* , 'soap' */],
    required: true,
    title: 'نوع',
    titleable: true,
    items: [
      { value: 'http', text: 'HTTP' },
      // { value: 'soap', text: 'SOAP' }
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
    ...makeHttpParamProperty('queryParams', 'پارامتر کوئری'),
    width: 4,
    hideInTable: true
  },
  {
    ...makeHttpParamProperty('pathParams', 'پارامتر مسیر'),
    width: 4,
    hideInTable: true
  },
  {
    ...makeHttpParamProperty('headers', 'Headerها'),
    width: 4,
    hideInTable: true
  },
  {
    key: 'bodySchema',
    type: 'any',
    title: 'اسکیمای Body',
    handlerElement: 'json-schema',
    hideInTable: true
  },
  {
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
  },
]);


export const ApiVersionModel      = maker.getModel();
export const ApiVersionController = maker.getController();


maker.setValidations({
  'version': [
    async ({ _id, version }, e) => (await ApiVersionController.count({ filters: { _id: { $ne: _id }, version } })) === 0 || e('این نسخه قبلا وارد شده است.')
  ]
});


maker.addActions([
  { template: 'LIST', permissions: ['admin.api-version.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.api-version.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-version.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-version.create'] },
  { template: 'UPDATE', permissions: ['admin.api-version.update'] },
  { template: 'DELETE', permissions: ['admin.api-version.delete'] },
  {
    method: 'POST',
    path: '/:resourceId/run',
    signal: ['Route', 'ApiVersion', 'Run'],
    permissions: ['admin.api-version.run'],
    dataProvider: async ({ resourceId }) => {

      const apiVersion = await ApiVersionController.retrieve({ resourceId });
      const { status, data, headers } = await runApi(apiVersion);

      return { status, result: data, headers };

    }
  }
]);


export const ApiVersionRouter = maker.getRouter();
