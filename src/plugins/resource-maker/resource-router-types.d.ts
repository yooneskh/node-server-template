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

type IX = 'LIST' | 'LIST_COUNT' | 'RETRIEVE' | 'CREATE' | 'UPDATE' | 'DELETE';
type IY = 'LIST_ALL' | 'LIST_ALL_COUNT' | 'LIST' | 'LIST_COUNT' | 'RETRIEVE' | 'RETRIEVE_COUNT' | 'RETRIEVE_BY_ID' | 'CREATE' | 'UPDATE' | 'DELETE';

export interface ResourceRouterAction {
  template?: IX | IY;
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  signal?: string[];
  dataProvider?: (context: ResourceRouterContext) => Promise<any>;
  versionedDataproviders?: {
    [version: string]: (context: ResourceRouterContext) => Promise<any>
  };
}
