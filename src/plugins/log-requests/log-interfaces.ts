import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';


export interface ILogBase extends IResource {
  user: string;
  document: string;
  data?: string;
  action: string;
} export interface ILog extends ILogBase, Document {}
