import { IUser } from '../user/user-interfaces';


type HasPermissionsFunction = (neededPermissions: string[]) => boolean;


declare module '../../plugins/resource-maker/resource-router-types' {

  interface ResourceRouterContext {
    user?: IUser;
    token?: string;
    userHasAllPermissions: HasPermissionsFunction;
    userHasAnyPermissions: HasPermissionsFunction;
  }

  interface ResourceRouterAction {
    permissions?: string[];
    anyPermissions?: string[];
    permissionFunction?: (context: ResourceRouterContext) => Promise<boolean>;
    stateValidator?: (context: ResourceRouterContext) => Promise<void>;
    payloadValidator?: (context: ResourceRouterContext) => Promise<void>;
    payloadPreprocessor?: (context: ResourceRouterContext) => Promise<void>;
    responsePreprocessor?: (context: ResourceRouterContext) => Promise<void>;
    postprocessor?: (context: ResourceRouterContext) => Promise<void>;
  }

}
