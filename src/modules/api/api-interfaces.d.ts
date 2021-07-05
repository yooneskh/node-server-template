import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';


export interface IApiServiceBase extends IResource {
  title: string;
  publisher: string;
  slug: string;
  picture: string;
  description: string;
} export interface IApiService extends IApiServiceBase, Document {}


export interface IApiEndpointBase extends IResource {
  service: string;
  title: string;
  slug: string;
  description: string;
  specialties?: string[];
} export interface IApiEndpoint extends IApiEndpointBase, Document {}


interface IApiHttpParam {
  key: string;
  type: 'string' | 'number';
}

interface IApiHttpBodySchema {
  key: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  subtype?: 'object' | 'array' | 'string' | 'number' | 'boolean';
  children?: IApiHttpBodySchema[];
}

interface IApiHttpKeyDescription {
  key: string;
  description: string;
}

interface IApiHttpResponse {
  title: string;
  status: number;
  description?: string;
  responseSchema?: IApiHttpBodySchema;
  responseKeyDescriptions?: IApiHttpKeyDescription[];
}

export interface IApiVersionBase extends IResource {
  endpoint: string;
  version: number;
  type: 'http' /* | 'soap' */;
  url?: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  queryParams?: IApiHttpParam[];
  pathParams?: IApiHttpParam[];
  headers?: IApiHttpParam[];
  bodySchema?: IApiHttpBodySchema;
  bodyKeyDescriptions?: IApiHttpKeyDescription[];
  responses?: IApiHttpResponse[];
} export interface IApiVersion extends IApiVersionBase, Document {}

export interface IApiLogBase extends IResource {
  api: string;
  apiType: 'http' /* | 'soap' */;
  success: boolean;
  startAt: number;
  endAt: number;
  totalTime: number;
  callerIP: string;
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders?: Record<string, string>;
  requestQueryParams?: Record<string, string>;
  requestPathParams?: Record<string, string>;
  requestBody?: any;
  requestBodySize?: number;
  responseHeaders?: Record<string, string>;
  responseStatus?: number;
  responseData?: any;
  responseSize?: number;
  responseLatency?: number;
  errorMessage?: string;
} export interface IApiLog extends IApiLogBase, Document {}
