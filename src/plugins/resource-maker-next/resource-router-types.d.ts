import { ResourceActionMethod, ResourceActionTemplate } from "./resource-maker-router-enums";
import { Request, Response } from "express";

export interface ResourceRouterContext {
  request: Request;
  response: Response;
  next: Function;
  data?: any;
}

export interface ResourceRouterAction {
  template: ResourceActionTemplate;
  path: string;
  method: ResourceActionMethod;
  signal: string[];
  dataProvider: (context: ResourceRouterContext) => any;
}
