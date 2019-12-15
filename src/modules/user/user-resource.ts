import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';
import { Config } from '../../global/config';

export interface IUser extends IResource {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: {
    en: string;
    fa: string;
  }
  profile: string;
  permissions: string[];
  verificationCode?: string;
  token?: string;
}

const maker = new ResourceMaker<IUser>('User');

maker.setProperties([
  {
    key: 'firstName',
    type: 'string'
  },
  {
    key: 'lastName',
    type: 'string'
  },
  {
    key: 'bio',
    type: 'string',
    languages: Config.languages
  },
  {
    key: 'phoneNumber',
    type: 'string',
    unique: true,
    required: true
  },
  {
    key: 'profilePicture',
    type: 'string',
    ref: 'Media',
    // default: '' // put mediaId of default profilePicture here
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*']
  }
]);

maker.setMetas([
  {
    key: 'firstName',
    title: 'نام',
    order: 1,
    titleAble: true
  },
  {
    key: 'lastName',
    title: 'نام خانوادگی',
    order: 2,
    titleAble: true
  },
  {
    key: 'bio',
    title: 'زندگینامه',
    order: 5
  },
  {
    key: 'phoneNumber',
    title: 'شماره تلفن',
    order: 3,
    dir: 'ltr'
  },
  {
    key: 'profilePicture',
    title: 'تصویر پروفایل',
    order: 4
  },
  {
    key: 'permissions',
    title: 'مجوزها',
    hideInTable: true
  }
]);

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: UserModel, controller: UserController, router: UserRouter } = maker.getMCR();
