import { IUser } from '../modules/user/user-model';
import { Request, Response } from 'express';
import { ResourceActionTemplate, ResourceActionMethod, ResourceRelationActionTemplate } from './resource-router';
import { Document } from 'mongoose';

export interface IResource extends Document {
  createdAt: number;
  updatedAt: number;
}

export interface ResourceOptions {
  name: string;
  properties: ResourceProperty[];
  relations?: ResourceRelation[];
  actions?: ResourceAction[];
}

export interface ResourceProperty {
  key: string;
  type: string;
  default?: any;
  ref?: string;
  required?: boolean;
  select?: boolean;
}

export interface ResourceRelation {
  targetModelName: string;
  relationModelName?: string;
  properties?: ResourceProperty[];
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

interface IResActionFunction {
  (request: Request, response: Response, user?: IUser): Promise<void>
}

export interface ResourceAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  permission?: string;
  permissionFunction?(user?: IUser | null ): Promise<boolean>;
  permissionFunctionStrict?(user: IUser ): Promise<boolean>;
  payloadValidator?(payload: any): Promise<boolean>;
  payloadPreprocessor?(payload: any, user?: IUser): Promise<boolean> | void;
  payloadPostprocessor?(payload: any, user?: IUser): Promise<void>;
  action?: IResActionFunction;
  dataProvider?(request: Request, response: Response, user?: IUser): Promise<any>
}
