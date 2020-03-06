import { IResource } from '../plugins/resource-maker/resource-model-types';
import { Document } from 'mongoose';

export interface IAuthBase extends IResource {
  user: string;
  type: string;
  propertyIdentifier?: string;
  verificationCode?: string;
  token: string;
  valid: boolean;
  lastAccessAt: number;
  meta: any;
} export interface IAuth extends IAuthBase, Document {}

export interface IAuthorBase extends IResource {
  familyName: string;
} export interface IAuthor extends IAuthorBase, Document {}

export interface IBookBase extends IResource {
  name: string;
  page: string;
} export interface IBook extends IBookBase, Document {}

export interface IPageBase extends IResource {
  content: string;
} export interface IPage extends IPageBase, Document {}

export interface IMediaBase extends IResource {
  name: string;
  extension: string;
  type: string;
  size: number;
  owner?: string;
  relativePath: string;
  path: string;
} export interface IMedia extends IMediaBase, Document {}

export interface IFactorBase extends IResource {
  user: string;
  title: string;
  closed: boolean;
  payed: boolean;
  payticket: string;
  meta: any;
} export interface IFactor extends IFactorBase, Document {}

export interface IProductOrderBase extends IResource {
  factor: string;
  product: string;
  orderPrice: number;
  count: number;
} export interface IProductOrder extends IProductOrderBase, Document {}

export interface IPayTicketBase extends IResource {
  factor: string;
  gateway: string;
  payUrl: string;
  resolved: boolean;
  amount: number;
  meta: any;
} export interface IPayTicket extends IPayTicketBase, Document {}

export interface IProductBase extends IResource {
  title: string;
  price: number;
  picture: string;
  album: string[];
  description: string;
  meta: any;
} export interface IProduct extends IProductBase, Document {}

export interface IUserBase extends IResource {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profile: string;
  permissions: string[];
} export interface IUser extends IUserBase, Document {}
