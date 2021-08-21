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
  disabled?: boolean;
  disabledMessage?: string;
  hasBody?: boolean;
  bodySchema?: IApiHttpBodySchema;
  bodyKeyDescriptions?: IApiHttpKeyDescription[];
  responses?: IApiHttpResponse[];
} export interface IApiVersion extends IApiVersionBase, Document {}


export interface IApiLogBase extends IResource {
  permit: string;
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
  responseSize?: number;
  responseLatency?: number;
  errorMessage?: string;
  rateLimitRemainingPoints?: number;
  cost?: number;
  costTransfer?: string;
} export interface IApiLog extends IApiLogBase, Document {}


export interface IApiRunAdditionalInfo {
  ip?: string;
}


export interface IApiPermitBase extends IResource {
  user: string;
  apiEndpoint: string;
  enabled?: boolean;
  blocked?: boolean;
  blockedAt?: number;
  blockageReason?: string;
  apiKey: string;
  identifier: string;
  policy: string;
} export interface IApiPermit extends IApiPermitBase, Document {}


export interface IApiPolicyBase extends IResource {
  title: string;
  description?: string;
  rateLimitConfig?: string;
  paymentConfig?: string;
} export interface IApiPolicy extends IApiPolicyBase, Document {}


export type IApiDurations = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface IApiRateLimitConfigBase extends IResource {
  title: string;
  duration: IApiDurations;
  durationMultiplier: number;
  points: number;
} export interface IApiRateLimitConfig extends IApiRateLimitConfigBase, Document {}

export interface IApiPaymentConfigBase extends IResource {
  title: string;
  freeSessionType: 'none' | 'oneTime' | 'interval';
  freeSessionInterval?: IApiDurations;
  freeSessionIntervalCount?: number;
  freeSessionRequests?: number;
  requestCost: number;
} export interface IApiPaymentConfig extends IApiPaymentConfigBase, Document {}
