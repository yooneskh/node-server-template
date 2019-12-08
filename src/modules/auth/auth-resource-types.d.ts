import { ResourceAction, ResourceActionBag } from '../../plugins/resource-maker/resource-maker-types';
import { Merge } from 'type-fest';
import { IUser } from '../user/user-resource';


interface ResourceActionStrictAuthBag extends ResourceActionBag {
  user: IUser;
}

interface ResourceActionResponsedAuthBag extends ResourceActionBag {
  data: any;
}

declare module '../../plugins/resource-maker/resource-maker-types' {

  interface ResourceActionBag {
    user?: IUser;
    payload?:  any;
    token?: string;
  }

  interface ResourceAction {
    permission?: string;
    permissionFunction?: (bag: ResourceActionBag) => Promise<boolean>;
    permissionFunctionStrict?: (bag: ResourceActionStrictAuthBag) => Promise<boolean>;
    payloadValidator?: (bag: ResourceActionBag) => Promise<boolean>;
    payloadPreprocessor?: (bag: ResourceActionBag) => Promise<boolean | void>;
    responsePreprocessor?: (bag: ResourceActionResponsedAuthBag) => Promise<boolean | void>;
    postprocessor?: (bag: ResourceActionResponsedAuthBag) => Promise<boolean | void>;
  }

}
