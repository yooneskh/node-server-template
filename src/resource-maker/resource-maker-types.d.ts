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

export interface ResourceAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  permission?: string;
  permissionFunction?({ user }: { user?: IUser | null }): Promise<boolean>;
  permissionFunctionStrict?({ user }: { user: IUser }): Promise<boolean>;
  payloadValidator?({ payload }: { payload: any }): Promise<boolean>;
  payloadPreprocessor?({ payload, user }: IResourceActionProcessor): Promise<boolean> | void;
  payloadPostprocessor?({ payload, user }: IResourceActionProcessor): Promise<void>;
  action?({ request, response, user }: IResourceActionProvider): Promise<void>
  dataProvider?({ request, response, user }: IResourceActionProvider): Promise<any>
}
