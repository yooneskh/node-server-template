import { ResourceActionMethod } from "./resource-maker-router-enums";
import { Request, Response } from "express";

export interface ResourceRouterContext {
  request: Request;
  response: Response;
}

export interface ResourceRouterAction {
  path: string;
  method: ResourceActionMethod;
  signal: string[];
  dataProvider: (context: ResourceRouterContext) => any;
}
