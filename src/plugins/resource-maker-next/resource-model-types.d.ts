import { Document } from "mongoose";

export interface ResourceModelProperty {
  key: string;
  type: string;
  ref?: string;
  default?: any;
  required?: boolean;
  unique?: boolean;
  select?: boolean;
  isArray?: boolean;
  languages?: Record<string, any>;
  title?: string;
  titleable?: boolean;
  hidden?: boolean;
  hideInTable?: boolean;
}

export interface IResource extends Document {
  createdAt: number;
  updatedAt: number;
}