import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IFactorBase extends IResource {
  user?: string;
  name: string;
  amount: number;
  payed: boolean;
  payedAt: number;
  paymentPayticket?: string;
  meta: any;
} export interface IFactor extends IFactorBase, Document {}

export interface IPayTicketBase extends IResource {
  factor: string;
  gateway: string;
  returnUrl?: string;
  payUrl?: string;
  amount: number;
  resolved: boolean;
  resolvedAt: number;
  payed: boolean;
  payedAt: number;
  rejected: boolean;
  rejectedAt: number;
  rejectedFor?: string;
  meta: any;
} export interface IPayTicket extends IPayTicketBase, Document {}
