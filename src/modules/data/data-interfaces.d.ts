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
  file: string;
  publisher?: string;
  region?: number;
  tags?: string[];
  hidden: boolean;
  hideMetas: boolean;
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
