import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IApiHomeSettingBase extends IResource {
  bottomGuides?: string[];
  loginGuide?: string[];
  apiRequestGuide?: string[];
} export interface IApiHomeSetting extends IApiHomeSettingBase, Document {}
