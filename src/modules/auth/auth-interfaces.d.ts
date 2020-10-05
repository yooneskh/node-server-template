import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IRegisterTokenBase extends IResource {
  phoneNumber: string;
  name: string;
  closed: boolean;
  closedAt: number;
} export interface IRegisterToken extends IRegisterTokenBase, Document {}

export interface IAuthTokenBase extends IResource {
  registerToken?: string;
  user?: string;
  type: string;
  propertyType?: string;
  propertyValue?: string;
  verificationCode?: string;
  token: string;
  valid: boolean;
  validatedAt: number;
  lastAccessAt: number;
  closed: boolean;
  closedAt: number;
  meta: any;
} export interface IAuthToken extends IAuthTokenBase, Document {}
