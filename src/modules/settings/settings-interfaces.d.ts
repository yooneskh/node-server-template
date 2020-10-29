import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IApplicationSetting extends IResource {
  manager: string;
} export interface IFactor extends IApplicationSetting, Document {}
