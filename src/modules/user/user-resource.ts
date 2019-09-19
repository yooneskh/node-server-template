import { ResourceMaker } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceActionTemplate } from '../../resource-maker/resource-router';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  permissions: string[];
  verificationCode: string | undefined;
  token: string | undefined;
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
    key: 'phoneNumber',
    type: 'string',
    unique: true,
    required: true
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true
  },
  {
    key: 'verificationCode',
    type: 'string'
  },
  {
    key: 'token',
    type: 'string'
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
    key: 'phoneNumber',
    title: 'شماره تلفن',
    order: 3
  },
  {
    key: 'permissions',
    hidden: true
  },
  {
    key: 'verificationCode',
    hidden: true
  },
  {
    key: 'token',
    hidden: true
  }
]);

maker.setActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: UserModel, controller: UserController, router: UserRouter } = maker.getMCR();

