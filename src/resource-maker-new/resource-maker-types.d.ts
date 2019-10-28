import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { IUser } from '../modules/user/user-resource';
import { ResourceRelationController } from './resource-relation-controller';

export interface IResource extends Document {
  createdAt: number;
  updatedAt: number;
}

export interface ResourceProperty {
  key: string;
  type: string;
  default?: any;
  ref?: string;
  required?: boolean;
  unique?: boolean;
  select?: boolean;
  isArray?: boolean;
}

export interface ResourcePropertyMeta {
  key: string;
  title?: string;
  order?: number;
  titleAble?: boolean
  hidden?: boolean;
  hideInTable?: boolean;
}

export interface ResourceRelation {
  targetModelName: string;
  relationModelName?: string;
  singular?: boolean;
  maxCount?: number;
  properties?: ResourceProperty[];
  actions?: ResourceAction[]
}

export interface IRouterRelation {
  targetModelName: string,
  relationModelName?: string;
  controller: ResourceRelationController<IResource>,
  actions?: ResourceAction[]
}

export interface IResourceActionProcessor {
  payload: any;
  user?: IUser;
}

export interface IResourceActionProvider {
  request: Request,
  response: Response,
  user?: IUser
}

export enum ResourceActionMethod {
  POST,
  GET,
  PUT,
  PATCH,
  DELETE
}

export enum ResourceActionTemplate {
  LIST,
  LIST_COUNT,
  RETRIEVE,
  CREATE,
  UPDATE,
  DELETE
}

export enum ResourceRelationActionTemplate {
  LIST,
  LIST_COUNT,
  RETRIEVE,
  RETRIEVE_COUNT,
  CREATE,
  DELETE
}

export interface ResourceActionBag {
  request: Request,
  response: Response
}

interface ResourceRouterMiddleware {
  (bag: ResourceActionBag): Promise<void>
}

export interface ResourceAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  action?(bag: ResourceActionBag): Promise<any>;
}
