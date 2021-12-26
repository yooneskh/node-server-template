import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

interface IApiLog {
//   key: string;
//   description: string;
}

export interface ILogServiceBase extends IResource {
  user: string;
  time: string;
  document?: IApiLog;
  data?: string;
  action: 'create' | 'delete' | 'update';
} export interface ILogService extends ILogServiceBase, Document {}
