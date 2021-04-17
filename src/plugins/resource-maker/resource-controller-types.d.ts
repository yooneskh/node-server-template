import { FilterQuery } from "mongoose";
import { IResource, IResourceDocument } from "./resource-model-types";

export interface ResourceControllerContext<T extends IResource, TF extends IResourceDocument> {
  resourceId?: string;
  includes?: Record<string, string>;
  sorts?: Record<string, number>;
  filters?: FilterQuery<TF>;
  payload?: Partial<T>;
  selects?: string;
  limit?: number;
  skip?: number;
  query?: any;
  lean?: boolean;
  skipKeyCheck?: boolean;
}