import { Document } from "mongoose";

export type SimpleCompoundIndex = { [key: string]: 1 | -1 };

export type FullCompoundIndex = {
  indexes: SimpleCompoundIndex;
  options: Record<string, any>;
};

export type CompoundIndex = SimpleCompoundIndex | FullCompoundIndex

export interface ResourceModelProperty {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'any' | 'series';
  ref?: string;
  default?: any;
  required?: boolean;
  select?: boolean;
  enum?: string[];
  isArray?: boolean;
  languages?: Record<string, any>;
  serieSchema?: ResourceModelProperty[];
  // index
  index?: boolean | { unique?: boolean; sparse?: boolean };
  unique?: boolean;
  sparse?: boolean;
  // metas
  title?: string;
  titleable?: boolean;
  hidden?: boolean;
  hideInTable?: boolean;
  dir?: string;
  longText?: boolean;
  richText?: boolean;
  timeFormat?: string;
  relationSourceModel?: string;
  relationTargetModel?: string;
  serieBase?: any;
  width?: number;
  itemWidth?: number;
  disabled?: boolean;
  readonly?: boolean;
  nonCreating?: boolean;
  labelFormat?: string;
  valueFormat?: string;
  items?: { value: string, text: string }[];
  handlerElement?: string;
}

export interface IResource {
  createdAt: number;
  updatedAt: number;
}

export interface IResourceDocument extends IResource, Document {}

export interface GeoSpat {
  type: 'Point';
  zoom?: number;
}

export interface GeoSpatPoint extends GeoSpat {
  type: 'Point';
  coordinates: [longitude: number, latitude: number];
}
