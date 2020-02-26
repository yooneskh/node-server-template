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
}

export interface IResource extends Document {
  createdAt: number;
  updatedAt: number;
}