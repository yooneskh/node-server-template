import { IDataRequest, IDataRequestBase } from './data-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError } from '../../global/errors';


const maker = new ResourceMaker<IDataRequestBase, IDataRequest>('DataRequest');

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
    key: 'status',
    type: 'string',
    required: true,
    enum: ['validating', 'rejected', 'accepted', 'implementing', 'ready'],
    title: 'وضعیت',
    items: [
      { value: 'validating', text: 'در حال بررسی' },
      { value: 'rejected', text: 'رد شده' },
      { value: 'accepted', text: 'تایید شده' },
      { value: 'implementing', text: 'در حال پیاده‌سازی' },
      { value: 'ready', text: 'آماده' },
    ]
  },
  {
    key: 'organization',
    type: 'string',
    required: true,
    title: 'سازمان'
  },
  {
    key: 'organizationalTitle',
    type: 'string',
    required: true,
    title: 'عنوان سازمانی'
  },
  {
    key: 'usage',
    type: 'string',
    required: true,
    title: 'استفاده',
    longText: true,
    hideInTable: true
  },
  {
    key: 'accepted',
    type: 'boolean',
    default: false,
    title: 'تایید شده',
    nonCreating: true
  },
  {
    key: 'acceptedAt',
    type: 'number',
    title: 'زمان تایید',
    labelFormat: 'jYYYY/jMM/jDD',
    nonCreating: true
  },
  {
    key: 'rejected',
    type: 'boolean',
    default: false,
    title: 'رد شده',
    nonCreating: true
  },
  {
    key: 'rejectedAt',
    type: 'number',
    title: 'زمان رد',
    labelFormat: 'jYYYY/jMM/jDD',
    nonCreating: true
  },
  {
    key: 'rejectionReason',
    type: 'string',
    title: 'علت رد',
    longText: true,
    nonCreating: true
  },
  {
    key: 'data',
    type: 'string',
    ref: 'Data',
    title: 'داده مربوطه',
    nonCreating: true
  }
]);

export const DataRequestModel      = maker.getModel();
export const DataRequestController = maker.getController();

maker.addActions([
  { template: 'LIST', permissions: ['admin.data-request.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.data-request.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.data-request.retrieve'] },
  { // create
    template: 'CREATE',
    permissions: ['admin.data-request.create'],
    payloadValidator: async ({ payload }) => {
      if ('status' in payload) throw new InvalidRequestError('وضعیت نباید تعریف شود');
    },
    payloadPreprocessor: async ({ payload }) => {
      payload.status = 'validating';
    }
  },
  { template: 'UPDATE', permissions: ['admin.data-request.update'] },
  { template: 'DELETE', permissions: ['admin.data-request.delete'] },
  { // my requests
    method: 'GET',
    path: '/requests/mine',
    signal: ['Route', 'DataRequest', 'Mine'],
    permissions: ['user.data-request.mine'],
    dataProvider: async ({ user }) => {
      return DataRequestController.list({
        filters: {
          user: user!._id
        },
        sorts: {
          _id: -1
        },
        includes: {
          'data': ''
        }
      });
    }
  }
]);

export const DataRequestRouter = maker.getRouter();
