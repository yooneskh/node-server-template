import { ResourceActionMethod, ResourceActionTemplate, ResourceRelationActionTemplate } from "./resource-maker-router-enums";
import { Request, Response } from "express";

export interface ResourceRouterContext {
  action: ResourceRouterAction;
  request: Request;
  response: Response;
  next: Function;
  payload: any;
  bag: any;
  version: string;
  data?: any;
  resourceId?: string;
}

export interface ResourceRouterAction {
  template?: ResourceActionTemplate | ResourceRelationActionTemplate;
  path?: string;
  method?: ResourceActionMethod;
  signal?: string[];
  dataProvider?: (context: ResourceRouterContext) => Promise<any>;
}
