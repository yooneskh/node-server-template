import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IApplicationSettingBase extends IResource {
  manager: string;
} export interface IApplicationSetting extends IApplicationSettingBase, Document {}
