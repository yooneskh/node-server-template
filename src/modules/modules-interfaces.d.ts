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

export interface IPage extends IResource {
  content: string;
}

export interface IMedia extends IResource {
  name: string;
  extension: string;
  type: string;
  size: number;
  owner?: string;
  relativePath: string;
  path: string;
}

export interface IFactor extends IResource {
  user: string;
  title: string;
  closed: boolean;
  payed: boolean;
  payticket: string;
  meta: any;
}

export interface IProductOrder extends IResource {
  factor: string;
  product: string;
  orderPrice: number;
  count: number;
}

export interface IPayTicket extends IResource {
  factor: string;
  gateway: string;
  payUrl: string;
  resolved: boolean;
  amount: number;
  meta: any;
}

export interface IProduct extends IResource {
  title: string;
  price: number;
  picture: string;
  album: string[];
  description: string;
  meta: any;
}

export interface IUser extends IResource {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profile: string;
  permissions: string[];
}
