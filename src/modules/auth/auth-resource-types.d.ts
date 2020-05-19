import { IUser } from "../modules-interfaces";

declare module '../../plugins/resource-maker/resource-router-types' {

  interface ResourceRouterContext {
    user?: IUser;
    token?: string;
  }

  interface ResourceRouterAction {
    permissions?: string[];
    permissionFunction?: (context: ResourceRouterContext) => Promise<boolean>;
    stateValidator?: (context: ResourceRouterContext) => Promise<void>;
    payloadValidator?: (context: ResourceRouterContext) => Promise<void>;
    payloadPreprocessor?: (context: ResourceRouterContext) => Promise<void>;
    responsePreprocessor?: (context: ResourceRouterContext) => Promise<void>;
    postprocessor?: (context: ResourceRouterContext) => Promise<void>;
  }

}
