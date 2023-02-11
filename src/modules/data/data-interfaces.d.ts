import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IDataCategoryBase extends IResource {
  title: string;
  slug: string;
  parent?: string;
  picture: string;
  thumbnail: string;
  order?: number;
  hidden?: boolean;
} export interface IDataCategory extends IDataCategoryBase, Document {}

export interface IDataBase extends IResource {
  title: string;
  category: string;
  timeTags: string[];
  description: string;
  type: string;
  file?: string;
  visualization?: string;
  versions?: {
    versionName: string;
    file?: string;
    visualization?: string;
  }[];
  publisher?: string;
  region?: number;
  tags?: string[];
  hidden: boolean;
  hideMetas: boolean;
  isPremium?: boolean;
  offers?: {
    _id?: any;
    title: string;
    price: number;
    userTypes: string[];
    description: string;
    conditions?: string[];
  }[];
} export interface IData extends IDataBase, Document {}

export interface ITimeTagBase extends IResource {
  title: string;
} export interface ITimeTag extends ITimeTagBase, Document {}

export interface IDataTypeBase extends IResource {
  title: string;
  viewType: string;
  emptyIcon: string;
} export interface IDataType extends IDataTypeBase, Document {}

export interface IPublisherBase extends IResource {
  title: string;
} export interface IPublisher extends IPublisherBase, Document {}


export interface IGeoDataBase extends IResource {
  title: string;
  category: string;
  timeTags: string[];
  description: string;
  file: string;
  publisher?: string;
  region?: number;
  tags?: string[];
  hidden: boolean;
  hideMetas: boolean;
} export interface IGeoData extends IGeoDataBase, Document {}

export interface IDataRequestBase extends IResource {
  user: string;
  data: string;
  selectedOffer?: string;
  isCompleted?: boolean;
  completedAt?: number;
  isAccepted?: boolean;
  acceptedAt?: number;
  isCanceled?: boolean;
  canceledAt?: number;
  canceledFor?: string;
  step?: number;
  permit?: string;
} export interface IDataRequest extends IDataRequestBase, Document {}

export interface IDataPermitBase extends IResource {
  user: string;
  data: string;
} export interface IDataPermit extends IDataPermitBase, Document {}
