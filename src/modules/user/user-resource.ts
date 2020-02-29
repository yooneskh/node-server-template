import { IResource } from '../../plugins/resource-maker-next/resource-model-types';
import { ResourceMaker } from '../../plugins/resource-maker-next/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker-next/resource-maker-router-enums';

export interface IUser extends IResource {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profile: string;
  permissions: string[];
}

const maker = new ResourceMaker<IUser>('User');

maker.addProperties([
  {
    key: 'firstName',
    type: 'string',
    title: 'نام',
    titleable: true
  },
  {
    key: 'lastName',
    type: 'string',
    title: 'نام خانوادگی',
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
    key: 'profilePicture',
    type: 'string',
    ref: 'Media',
    // default: '' // put mediaId of default profilePicture here
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
