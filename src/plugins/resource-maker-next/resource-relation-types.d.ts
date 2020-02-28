import { ResourceModelProperty } from "./resource-model-types";
import { ResourceRouterAction } from "./resource-router-types";

export interface ResourceRelation {
  targetModelName: string;
  relationModelName: string;
  singular?: boolean;
  maxCount?: number;
  properties?: ResourceModelProperty[]
  actions?: ResourceRouterAction[]
  // metas
  title?: string;
  targetPropertyTitle?: string;
}
