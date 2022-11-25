import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IGuideBase extends IResource {
  name: string;
  description: string;
  body: string;
} export interface IGuide extends IGuideBase, Document {}
