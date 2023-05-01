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
    key: 'email',
    type: 'string',
    title: 'ایمیل',
    dir: 'ltr'
  },
  {
    key: 'blocked',
    type: 'boolean',
    title: 'مسدود شده',
  },
  {
    key: 'ssoId',
    type: 'string',
    hidden: true,
  },
  {
    key: 'userActor',
    type: 'string',
    default: 'user',
    hidden: true,
  },
  {
    vIf: { userActor: 'admin' },
    key: 'adminUsername',
    type: 'string',
    title: 'نام کاربری مدیریتی',
    hideInTable: true,
  },
  {
    vIf: { userActor: 'admin' },
    key: 'adminPassword',
    type: 'string',
    title: 'رمز عبور مدیریتی',
    hideInTable: true,
  },
  {
    vIf: { userActor: 'admin' },
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*'],
    title: 'مجوزها',
    hideInTable: true,
    handlerElement: 'permissions'
  },
  {
    vIf: { userActor: 'admin' },
    key: 'roles',
    type: 'string',
    ref: 'Role',
    isArray: true,
    title: 'نقش‌ها',
    hideInTable: true,
  },
  {
    key: 'sarvInfo',
    type: 'object',
    hidden: true
  },
  {
    vIf: { userActor: { $ne: 'admin' } },
    key: 'type',
    type: 'string',
    title: 'نوع',
    disabled: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'firstName',
    type: 'string',
    title: 'نام',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'lastName',
    type: 'string',
    title: 'نام خانوادگی',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'fatherName',
    type: 'string',
    title: 'نام پدر',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'dateOfBirth',
    type: 'string',
    title: 'تاریخ تولد',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'address',
    type: 'string',
    title: 'آدرس',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'person' },
    key: 'nationalCode',
    type: 'string',
    title: 'کد ملی',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'legal' },
    key: 'companyName',
    type: 'string',
    title: 'نام شرکت',
    disabled: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'legal' },
    key: 'companyRegistrationDate',
    type: 'string',
    title: 'تاریخ ثبت شرکت',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'legal' },
    key: 'companyType',
    type: 'string',
    title: 'نوع شرکت',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'legal' },
    key: 'economicalCode',
    type: 'string',
    title: 'کد اقتصادی',
    disabled: true,
    hideInTable: true
  },
  {
    vIf: { userActor: { $ne: 'admin' }, type: 'legal' },
    key: 'registrationCode',
    type: 'string',
    title: 'کد ثبت',
    disabled: true,
    hideInTable: true
  },
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
