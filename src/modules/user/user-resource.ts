import { makeResource } from '../../resource-maker/resource-maker';
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

export const { model: UserModel, controller: UserController, router: UserRouter } = makeResource<IUser>({
  name: 'User',
  properties: [
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
  ],
  actions: [
    { template: ResourceActionTemplate.LIST },
    { template: ResourceActionTemplate.LIST_COUNT },
    { template: ResourceActionTemplate.RETRIEVE },
    { template: ResourceActionTemplate.CREATE },
    { template: ResourceActionTemplate.UPDATE },
    { template: ResourceActionTemplate.DELETE }
  ]
});
