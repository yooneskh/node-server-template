import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUserBase extends IResource {
  name: string;
  phoneNumber: string;
  ssoId: string;
  email?: string;
  profile?: string;
  permissions: string[];
  documents: {
    title: string;
    media: string;
    verified?: boolean;
    verifiedAt?: boolean;
    rejected?: boolean;
    rejectedAt?: number;
    rejectedFor?: string;
  }[];
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
