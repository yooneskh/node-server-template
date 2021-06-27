import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUserBase extends IResource {
  name: string;
  phoneNumber: string;
  email?: string;
  profile?: string;
  permissions: string[];
  blocked?: boolean;
} export interface IUser extends IUserBase, Document {}
