import { ResourceAction, ResourceActionBag } from '../../plugins/resource-maker/resource-maker-types';
import { Merge } from 'type-fest';
import { IUser } from '../user/user-resource';


interface ResourceActionAuthBag extends ResourceActionBag {
  payload: any;
}

interface ResourceActionStrictAuthBag extends ResourceActionAuthBag {
  user: IUser;
}

interface ResourceActionResponsedAuthBag extends ResourceActionAuthBag {
  data: any;
}

declare module '../../plugins/resource-maker/resource-maker-types' {

  interface ResourceActionBag {
    user?: IUser;
  }

  interface ResourceAction {
    permission?: string;
    permissionFunction?: (bag: ResourceActionAuthBag) => Promise<boolean>;
    permissionFunctionStrict?: (bag: ResourceActionStrictAuthBag) => Promise<boolean>;
    payloadValidator?: (bag: ResourceActionAuthBag) => Promise<boolean>;
    payloadPreprocessor?: (bag: ResourceActionAuthBag) => Promise<boolean | void>;
    responsePreprocessor?: (bag: ResourceActionResponsedAuthBag) => Promise<boolean | void>;
    postprocessor?: (bag: ResourceActionResponsedAuthBag) => Promise<boolean | void>;
  }

}
