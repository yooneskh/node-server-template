import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';


export interface IApiServiceBase extends IResource {
  title: string;
  slug: string;
  parent?: string;
  picture: string;
  description: string;
} export interface IApiService extends IApiServiceBase, Document {}


export interface IApiEndpointBase extends IResource {
  category: string;
  title: string;
  slug: string;
  publisher: string;
  description: string;
  region?: number;
  disabled?: boolean;
  specialties?: string[];
  body: string;
  offers?: {
    _id?: any;
    title: string;
    policy: string;
    description: string;
  }[];
  conditions?: string[];
  testVersionPolicy?: string;
} export interface IApiEndpoint extends IApiEndpointBase, Document {}


interface IApiHttpParam {
  key: string;
  type: 'string' | 'number';
}

interface IApiHttpParamValue {
  key: string;
  value: string;
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
  version: string;
  type: 'http'  | 'soap';
  url?: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  queryParams?: IApiHttpParam[];
  pathParams?: IApiHttpParam[];
  headers?: IApiHttpParam[];
  staticHeaders?: IApiHttpParamValue[];
  disabled?: boolean;
  disabledMessage?: string;
  hasBody?: boolean;
  bodySchema?: IApiHttpBodySchema;
  bodyKeyDescriptions?: IApiHttpKeyDescription[];
  responses?: IApiHttpResponse[];
  soapBody?: string;
} export interface IApiVersion extends IApiVersionBase, Document {}


export interface IApiLogBase extends IResource {
  permit: string;
  api: string;
  apiType: 'http'  | 'soap' ;
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


export interface IApiResultPropertyTransform {
  property: string;
  code: string;
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
  filterType?: 'none' | 'whitelist' | 'blacklist';
  filterProperties?: string[];
  transforms?: IApiResultPropertyTransform[];
  validFromEnabled?: boolean;
  validFromDay?: string;
  validFromTime?: string;
  validToEnabled?: boolean;
  validToDay?: string;
  validToTime?: string;
  isTestPermit?: boolean;
} export interface IApiPermit extends IApiPermitBase, Document {}


export type IApiDurations = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface IApiPolicyBase extends IResource {
  title: string;
  description?: string;
  hasPaymentConfig?: boolean;
  paymentStaticCost?: number;
  paymentFreeSessionType: 'none' | 'oneTime' | 'interval';
  paymentFreeSessionInterval?: IApiDurations;
  paymentFreeSessionIntervalCount?: number;
  paymentFreeSessionRequests?: number;
  paymentRequestCost: number;
  hasRateLimit?: boolean;
  rateLimitDuration: IApiDurations;
  rateLimitDurationMultiplier: number;
  rateLimitPoints: number;
} export interface IApiPolicy extends IApiPolicyBase, Document {}


export interface IApiReceiverBase extends IResource {
  title: string;
  parent?: string;
} export interface IApiReceiver extends IApiReceiverBase, Document {}


export interface IApiNewRequestBase extends IResource {
  user: string;
  company: string;
  reason: string;
  ip: string;
  usageDuration: string;
  address: string;
} export interface IApiNewRequest extends IApiNewRequestBase, Document {}

export interface IApiRequestBase extends IResource {
  user: string;
  apiEndpoint: string;
  formProductTitle?: string;
  formProductType?: string;
  formIp?: string;
  formCallType?: string;
  formCallTypeFromDate?: string;
  formCallTypeUntilDate?: string;
  formValidityDurationCount?: string;
  formValidityDuration?: string;
  formCallCount?: string;
  formCallCountDuration?: string;
  formDescription?: string;
  selectedOffer?: string;
  isCompleted?: boolean;
  completedAt?: number;
  isAccepted?: boolean;
  acceptedAt?: number;
  isTesting?: boolean;
  testingAt?: number;
  isRejected?: boolean;
  rejectedAt?: number;
  rejectedFor?: string;
} export interface IApiRequest extends IApiRequestBase, Document {}
