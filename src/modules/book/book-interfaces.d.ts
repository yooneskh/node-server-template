import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IBookBase extends IResource {
  name: string;
} export interface IBook extends IBookBase, Document {}

export interface IPageBase extends IResource {
  content: string;
  book: string;
} export interface IPage extends IPageBase, Document {}
