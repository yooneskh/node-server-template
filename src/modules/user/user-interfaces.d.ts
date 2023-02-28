import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUserBase extends IResource {
  name: string;
  phoneNumber: string;
  ssoId: string;
  email?: string;
  adminUsername?: string;
  adminPassword?: string;
  blocked?: boolean;
  permissions: string[];
  roles?: string[];
  sarvInfo: Record<string, any>;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  dateOfBirth?: string;
  address?: string;
  type?: string;
  nationalCode?: string;
  companyName?: string;
  companyRegistrationDate?: string;
  companyType?: string;
  economicalCode?: string;
  registrationCode?: string;
} export interface IUser extends IUserBase, Document {}

export interface IRoleBase extends IResource {
  name: string;
  permissions: string[];
} export interface IRole extends IRoleBase, Document {}
