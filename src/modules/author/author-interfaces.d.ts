import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IAuthorBase extends IResource {
  familyName: string;
} export interface IAuthor extends IAuthorBase, Document {}

export interface IAuthorBookBase extends IResource {
  author: string;
  book: string;
  timeTook?: number;
  blast?: string;
  pages?: string[];
} export interface IAuthorBook extends IAuthorBookBase, Document {}

export interface IAuthorPageMakerBase extends IResource {
  author: string;
  page: string;
  isPremium?: number;
  contributor?: string;
} export interface IAuthorPageMaker extends IAuthorPageMakerBase, Document {}
