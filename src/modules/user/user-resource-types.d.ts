import { ResourceAction, ResourceActionBag } from '../../resource-maker-new/resource-maker-types';
import { Merge } from 'type-fest';
import { IUser } from './user-resource';

declare module '../../resource-maker-new/resource-maker-types' {
  interface ResourceAction {
    permission?: string;
    permissionFunction?: (bag: Merge<ResourceActionBag, { user?: IUser, payload: any }>) => Promise<boolean>;
    permissionFunctionStrict?: (bag: Merge<ResourceActionBag, { user: IUser, payload: any }>) => Promise<boolean>;
    payloadValidator?: (bag: Merge<ResourceActionBag, { user?: IUser, payload: any }>) => Promise<boolean>;
    payloadPreprocessor?: (bag: Merge<ResourceActionBag, { user?: IUser, payload: any }>) => Promise<boolean>;
    responsePreprocessor?: (bag: Merge<ResourceActionBag, { user?: IUser, payload: any, data: any }>) => Promise<boolean>;
    postprocessor?: (bag: Merge<ResourceActionBag, { user?: IUser, payload: any, data: any }>) => Promise<boolean>;
  }
}
