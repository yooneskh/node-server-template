import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { Merge } from 'type-fest';
import { ResourceRelationActionTemplate, ResourceActionMethod, ResourceActionTemplate } from './resource-maker-enums';

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
  languages?: Record<string, Partial<ResourceProperty>>
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
  actions?: ResourceAction[];
}

export interface ResourceActionBag {
  action: ResourceAction;
  request: Request;
  response: Response;
}

interface ResourceRouterMiddleware {
  (bag: ResourceActionBag): Promise<void>;
}

interface ResourceRouterResponsedMiddleware {
  (bag: Merge<ResourceActionBag, { data: any }>): Promise<void>;
}

export interface ResourceAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  dataProvider?(bag: ResourceActionBag): Promise<any>;
}
