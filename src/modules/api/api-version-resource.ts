import { IApiVersion, IApiVersionBase } from './api-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceModelProperty } from '../../plugins/resource-maker/resource-model-types';


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
      title: 'کلید'
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
      ]
    },
  ],
  title
});

maker.addProperties([
  {
    key: 'endpoint',
    type: 'string',
    ref: 'ApiEndpoint',
    required: true,
    title: 'واحد Api'
  },
  {
    key: 'version',
    type: 'number',
    required: true,
    title: 'شماره نسخه'
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
    ]
  },
  {
    key: 'url',
    type: 'string',
    title: 'مسیر',
    dir: 'ltr'
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
    hideInTable: true
  },
  {
    ...makeHttpParamProperty('queryParams', 'پارامتر کوئری'),
    hideInTable: true
  },
  {
    ...makeHttpParamProperty('pathParams', 'پارامتر مسیر'),
    hideInTable: true
  },
  {
    ...makeHttpParamProperty('headers', 'Headerها'),
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
        title: 'عنوان'
      },
      {
        key: 'status',
        type: 'number',
        required: true,
        title: 'مقدار Http Status'
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
    title: 'اسکیمای Body',
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
  { template: 'DELETE', permissions: ['admin.api-version.delete'] }
]);


export const ApiVersionRouter = maker.getRouter();
