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
    labelFormat: 'jYYYY/jMM/jDD HH:mm:ss',
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
    required: true,
    title: 'سیاست‌ها'
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
