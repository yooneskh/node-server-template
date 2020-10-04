import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUserBase extends IResource {
  name: string;
  phoneNumber: string;
  profile?: string;
  permissions: string[];
} export interface IUser extends IUserBase, Document {}
