import { Document } from 'mongoose';
import { IResource } from '../../plugins/resource-maker/resource-model-types';

export interface IMediaBase extends IResource {
  name: string;
  extension: string;
  type: string;
  size: number;
  owner?: string;
  relativePath: string;
  path: string;
} export interface IMedia extends IMediaBase, Document {}
