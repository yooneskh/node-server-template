import { IUser, IUserBase } from './user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IUserBase, IUser>('User');


maker.addProperties([
  {
    key: 'name',
    type: 'string',
    title: 'نام کامل',
    disabled: true,
    titleable: true
  },
  {
    key: 'phoneNumber',
    type: 'string',
    required: true,
    index: true,
    unique: true,
    title: 'شماره تلفن',
    dir: 'ltr'
  },
  {
    key: 'ssoId',
    type: 'string',
    required: true,
    index: true,
    unique: true,
    hidden: true
  },
  {
    key: 'email',
    type: 'string',
    title: 'ایمیل',
    dir: 'ltr'
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*'],
    title: 'مجوزها',
    hideInTable: true,
    handlerElement: 'permissions'
  },
  {
    key: 'sarvInfo',
    type: 'object',
    hidden: true
  },
  {
    key: 'firstName',
    type: 'string',
    title: 'نام',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'lastName',
    type: 'string',
    title: 'نام خانوادگی',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'fatherName',
    type: 'string',
    title: 'نام پدر',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'dateOfBirth',
    type: 'string',
    title: 'تاریخ تولد',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'address',
    type: 'string',
    title: 'آدرس',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'type',
    type: 'string',
    title: 'نوع',
    disabled: true
  },
  {
    key: 'nationalCode',
    type: 'string',
    title: 'کد ملی',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'companyName',
    type: 'string',
    title: 'نام شرکت',
    disabled: true
  },
  {
    key: 'companyRegistrationDate',
    type: 'string',
    title: 'تاریخ ثبت شرکت',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'companyType',
    type: 'string',
    title: 'نوع شرکت',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'economicalCode',
    type: 'string',
    title: 'کد اقتصادی',
    disabled: true,
    hideInTable: true
  },
  {
    key: 'registrationCode',
    type: 'string',
    title: 'کد ثبت',
    disabled: true,
    hideInTable: true
  }
]);


export const UserModel      = maker.getModel();
export const UserController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.user.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.user.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.user.retrieve'] },
  { template: 'CREATE', permissions: ['admin.user.create'] },
  { template: 'UPDATE', permissions: ['admin.user.update'] },
  { template: 'DELETE', permissions: ['admin.user.delete'] }
]);


export const UserRouter = maker.getRouter();
