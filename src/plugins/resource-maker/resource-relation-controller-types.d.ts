import { FilterQuery } from "mongoose";
import { IResource, IResourceDocument } from "./resource-model-types";

export interface ResourceRelationControllerContext<T extends IResource, TF extends IResourceDocument> {
  relationId?: string;
  sourceId?: string;
  targetId?: string;
  includes?: Record<string, string>;
  sorts?: Record<string, number>;
  filters?: FilterQuery<TF>;
  payload?: Partial<T>;
  selects?: string;
  limit?: number;
  skip?: number;
  query?: any;
  lean?: boolean;
}
