import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

// interface IApiLog {
// //   key: string;
// //   description: string;
// }

export interface ILogServiceBase extends IResource {
  user: string;
  document: string;
  data?: string;
  action: string;
} export interface ILogService extends ILogServiceBase, Document {}
