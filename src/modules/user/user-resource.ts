import { ResourceMaker } from '../../resource-maker-new/resource-maker';
import { IResource, ResourceActionTemplate } from '../../resource-maker-new/resource-maker-types';
import { hasPermission } from '../../resource-maker-new/resource-maker-util';
import { getUserByToken } from '../auth/auth-resource';
import { addResourceRouterPreProcessor, addResourceRouterPostProcessor, addResourceRouterPreResponseProcessor } from '../../resource-maker-new/resource-router';
import { ForbiddenAccessError, InvalidRequestError } from '../../global/errors';

export interface IUser extends IResource {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profile: string;
  permissions: string[];
  verificationCode: string | undefined;
  token: string | undefined;
}

const maker = new ResourceMaker<IUser>('User');

maker.setProperties([
  {
    key: 'firstName',
    type: 'string'
  },
  {
    key: 'lastName',
    type: 'string'
  },
  {
    key: 'phoneNumber',
    type: 'string',
    unique: true,
    required: true
  },
  {
    key: 'profilePicture',
    type: 'string',
    ref: 'Media',
    // default: '' // put mediaId of default profilePicture here
  },
  {
    key: 'permissions',
    type: 'string',
    isArray: true,
    default: ['user.*']
  }
]);

maker.setMetas([
  {
    key: 'firstName',
    title: 'نام',
    order: 1,
    titleAble: true
  },
  {
    key: 'lastName',
    title: 'نام خانوادگی',
    order: 2,
    titleAble: true
  },
  {
    key: 'phoneNumber',
    title: 'شماره تلفن',
    order: 3
  },
  {
    key: 'profilePicture',
    title: 'تصویر پروفایل',
    order: 4
  },
  {
    key: 'permissions',
    title: 'مجوزها',
    hideInTable: true
  }
]);

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: UserModel, controller: UserController, router: UserRouter } = maker.getMCR();

// TODO: add middleware of preprocessors and post processors, complete from temp.txt

addResourceRouterPreProcessor(async bag => {

  const { action, request, response } = bag;

  let user: IUser | undefined;
  const payload = request.body;
  const token = request.headers.authorization;

  const needToLoadUser = action.permission || action.permissionFunction || action.permissionFunctionStrict || action.payloadValidator || action.payloadPreprocessor || action.postprocessor;

  if (needToLoadUser) {
    user = await getUserByToken(token);
  }

  if (action.permission && (!user || !user.permissions || !hasPermission(user.permissions || [], action.permission)) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  if ( action.permissionFunction && !(await action.permissionFunction({ ...bag, user, payload })) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  if ( action.permissionFunctionStrict && ( !user || !(await action.permissionFunctionStrict({ ...bag, user, payload })) ) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  if (action.payloadValidator && !(await action.payloadValidator({ ...bag, user, payload })) ) {
    throw new InvalidRequestError('payload validation failed');
  }

  if (action.payloadPreprocessor) {

    const shouldBypass = await action.payloadPreprocessor({ ...bag, user, payload });

    if (shouldBypass) {
      return console.log('bypassed action');
    }

  }

});

addResourceRouterPreResponseProcessor(async bag => {

  const { action, request, response, data } = bag;

  const payload = request.body;
  const token = request.headers.authorization;

  const user = await getUserByToken(token);

  if (action.responsePreprocessor) {
    await action.responsePreprocessor({ ...bag, user, payload, data });
  }

});

addResourceRouterPostProcessor(async bag => {

  const { action, request, response, data } = bag;

  const payload = request.body;
  const token = request.headers.authorization;

  const user = await getUserByToken(token);

  if (action.postprocessor) {
    await action.postprocessor({ ...bag, user, payload, data });
  }

});
