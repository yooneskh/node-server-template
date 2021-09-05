import { IUser } from '../user/user-interfaces';


type HasPermissionFunction = (neededPermission: string) => boolean;
type HasPermissionsFunction = (neededPermissions: string[]) => boolean;


declare module '../../plugins/resource-maker/resource-router-types' {

  interface ResourceRouterContext {
    user?: IUser;
    token?: string;
    hasPermission: HasPermissionFunction;
    hasAllPermissions: HasPermissionsFunction;
    hasAnyPermission: HasPermissionsFunction;
  }

  interface ResourceRouterAction {
    permission?: string;
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
