import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IDataCategoryBase extends IResource {
  title: string;
  slug: string;
  parent?: string;
  picture: string;
  thumbnail: string;
} export interface IDataCategory extends IDataCategoryBase, Document {}

export interface IDataBase extends IResource {
  title: string;
  category: string;
  timeTags: string[];
  description: string;
  type: string;
  file: string;
} export interface IData extends IDataBase, Document {}

export interface ITimeTagBase extends IResource {
  title: string;
} export interface ITimeTag extends ITimeTagBase, Document {}

export interface IDataTypeBase extends IResource {
  title: string;
  viewType: string;
  emptyIcon: string;
} export interface IDataType extends IDataTypeBase, Document {}
