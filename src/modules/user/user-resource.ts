import { IUser, IUserBase } from './user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IUserBase, IUser>('User');

maker.addProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
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
    key: 'profile',
    type: 'string',
    ref: 'Media',
    // default: '' // put mediaId of default profile here
    title: 'تصویر پروفایل'
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*'],
    title: 'مجوزها',
    hideInTable: true
  }
]);

export const UserModel      = maker.getModel();
export const UserController = maker.getController();

maker.addActions([
  { template: 'LIST', permissions: ['admin.user.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.user.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.user.retrieve'] },
  { template: 'CREATE', permissions: ['admin.user.create'] },
  { template: 'UPDATE', permissions: ['admin.user.update'] },
  { template: 'DELETE', permissions: ['admin.user.delete'] }
]);

export const UserRouter = maker.getRouter();
