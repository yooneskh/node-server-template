import { IResource } from '../plugins/resource-maker-next/resource-model-types';

export interface IAuth extends IResource {
  user: string;
  type: string;
  propertyIdentifier?: string;
  verificationCode?: string;
  token: string;
  valid: boolean;
  lastAccessAt: number;
  meta: any;
}

export interface IAuthor extends IResource {
  familyName: string;
}

export interface IBook extends IResource {
  name: string;
  page: string;
}
