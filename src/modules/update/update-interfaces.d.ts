import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IUpdateBase extends IResource {
  title: string;
  description: string;
  changes: string[];
  version: number;
  platform: string;
  packageName: string;
  mandatory: boolean;
  links: string[];
} export interface IUpdate extends IUpdateBase, Document {}
