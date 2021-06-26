import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IApiServiceBase extends IResource {
  title: string;
  picture: string;
  description: string;
} export interface IApiService extends IApiServiceBase, Document {}

export interface IApiEndpointBase extends IResource {
  title: string;
  description: string;
} export interface IApiEndpoint extends IApiEndpointBase, Document {}

export interface IApiVersionBase extends IResource {
  type: 'http' | 'soap';
  url?: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  queryParams?: string[];
  pathParams?: string[];
  headers?: string[];
  bodySchema?: any;
} export interface IApiVersion extends IApiVersionBase, Document {}
