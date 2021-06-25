import { Request, Response } from "express";

type SetHeaderFunction = (header: string, value: string) => void;

export interface ResourceRouterContext {
  action: ResourceRouterAction;
  request: Request;
  response: Response;
  next: Function;
  setHeader: SetHeaderFunction,
  payload: any;
  params: Record<string, string>;
  query: Record<string, string>;
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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  signal?: string[];
  dataProvider?: (context: ResourceRouterContext) => Promise<any>;
  versionedDataproviders?: {
    [version: string]: (context: ResourceRouterContext) => Promise<any>
  };
}
