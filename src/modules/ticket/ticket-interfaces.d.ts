import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface ITicketCategoryBase extends IResource {
  title: string;
  fields: string[];
} export interface ITicketCategory extends ITicketCategoryBase, Document {}

export interface ITicketCategoryUserBase extends IResource {
  ticketcategory: string;
  user: string;
} export interface ITicketCategoryUser extends ITicketCategoryUserBase, Document {}

export interface IApiTicketCategoryBase extends IResource {
  title: string;
  fields: string[];
} export interface IApiTicketCategory extends IApiTicketCategoryBase, Document {}

export interface ITicketBase extends IResource {
  user: string;
  category: string;
  title: string;
  status: 'pending' | 'answered' | 'closed' | 'archived' | 'deleted';
  informations?: {
    type: 'nationalCode' | 'postalCode';
    value: string;
  }[];
} export interface ITicket extends ITicketBase, Document {}

export interface ITicketMessageBase extends IResource {
  user: string;
  ticket: string;
  body: string;
  files?: string[];
} export interface ITicketMessage extends ITicketMessageBase, Document {}

export interface IApiTicketBase extends IResource {
  user: string;
  category: string;
  apiPermit: string;
  title: string;
  status: 'pending' | 'answered' | 'closed' | 'archived' | 'deleted';
} export interface IApiTicket extends IApiTicketBase, Document {}
