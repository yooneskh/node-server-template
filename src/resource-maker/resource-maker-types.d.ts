import { IUser } from '../modules/user/user-model';
import { Request, Response } from 'express';
import { ResourceActionTemplate, ResourceActionMethod, ResourceRelationActionTemplate } from './resource-router';

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
}

export interface ResourceRelation {
  targetModelName: string;
  relationModelName?: string;
  properties?: ResourceProperty[];
  actions?: ResourceAction[]
}

export interface ResourceAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  permission?: string;
  permissionFunction?({ user }: { user?: IUser | null }): Promise<boolean>;
  permissionFunctionStrict?({ user }: { user: IUser }): Promise<boolean>;
  payloadValidator?({ payload }: { payload: any }): Promise<boolean>;
  payloadPreprocessor?({ payload, user }: { payload: any, user?: IUser }): Promise<boolean> | void;
  payloadPostprocessor?({ payload, user }: { payload: any, user?: IUser }): Promise<void>;
  action?({ request, response, user }: { request: Request, response: Response, user?: IUser }): Promise<void>
  dataProvider?({ request, response, user }: { request: Request, response: Response, user?: IUser }): Promise<any>
}
