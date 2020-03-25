import { IUserBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';


const maker = new ResourceMaker<IUserBase>('User');

maker.addProperties([
  {
    key: 'name',
    type: 'string',
    title: 'نام',
    titleable: true
  },
  {
    key: 'phoneNumber',
    type: 'string',
    unique: true,
    required: true,
    title: 'شماره تلفن',
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
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const UserRouter = maker.getRouter();
