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
  type: 'file' | 'image';
  file?: string;
  showAllImage?: boolean;
} export interface IData extends IDataBase, Document {}