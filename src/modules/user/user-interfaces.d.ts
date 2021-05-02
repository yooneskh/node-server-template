import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUserBase extends IResource {
  name: string;
  phoneNumber: string;
  ssoId: string;
  email?: string;
  profile?: string;
  permissions: string[];
  sarvInfo: Record<string, any>;
} export interface IUser extends IUserBase, Document {}
