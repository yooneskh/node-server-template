import { Document, IndexDefinition } from "mongoose";

export type CompoundIndex = {
  indexes: IndexDefinition;
  options?: Record<string, any>
}

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
  // existence criteria
  vIf?: any;
  // index
  index?: boolean | { unique?: boolean; sparse?: boolean };
  unique?: boolean;
  sparse?: boolean;
  // metas
  title?: string;
  placeholder?: string;
  titleable?: boolean;
  hidden?: boolean;
  hideInTable?: boolean;
  dir?: 'ltr' | 'rtl';
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
  // validation
  validator?: RegExp | Function | string;
  conditionalRequired?: boolean;
}

export interface IResource {
  _id?: any;
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
