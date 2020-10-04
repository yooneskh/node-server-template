import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IFactorBase extends IResource {
  user: string;
  title: string;
  closed: boolean;
  payed: boolean;
  payticket?: string;
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
  payUrl?: string;
  amount: number;
  resolved: boolean;
  resolvedAt: number;
  payed: boolean;
  meta: any;
} export interface IPayTicket extends IPayTicketBase, Document {}

export interface IProductBase extends IResource {
  title: string;
  description?: string;
  price: number;
  picture?: string;
  album?: string[];
  meta: any;
} export interface IProduct extends IProductBase, Document {}
