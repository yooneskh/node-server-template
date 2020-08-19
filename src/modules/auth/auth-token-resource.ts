import { IAuthTokenBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IAuthTokenBase>('AuthToken');

maker.addProperties([
  {
    key: 'registerToken',
    type: 'string',
    ref: 'RegisterToken',
    title: 'توکن ثبت نام'
  },
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'type',
    type: 'string',
    required: true,
    title: 'نوع',
    titleable: true
  },
  {
    key: 'propertyType',
    type: 'string',
    title: 'مقدار شناساگر',
    titleable: true
  },
  {
    key: 'propertyValue',
    type: 'string',
    title: 'مقدار شناساگر',
    titleable: true
  },
  {
    key: 'verificationCode',
    type: 'string',
    title: 'کد تایید',
    hideInTable: true
  },
  {
    key: 'valid',
    type: 'boolean',
    default: false,
    title: 'مورد تایید'
  },
  {
    key: 'validatedAt',
    type: 'number',
    default: 0,
    title: 'زمان تایید'
  },
  {
    key: 'lastAccessAt',
    type: 'number',
    default: 0,
    title: 'آخرین دسترسی'
  },
  {
    key: 'closed',
    type: 'boolean',
    default: false,
    title: 'بسته شده'
  },
  {
    key: 'closedAt',
    type: 'number',
    default: 0,
    title: 'زمان بسته شدن'
  },
  {
    key: 'meta',
    type: 'object',
    title: 'اطلاعات',
    hideInTable: true
  },
  {
    key: 'token',
    type: 'string',
    hidden: true
  }
]);

export const AuthTokenModel      = maker.getModel();
export const AuthTokenController = maker.getController();
