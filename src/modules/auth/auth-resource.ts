import { IAuth, IUser } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker-next/resource-maker';
import { ResourceActionMethod } from '../../plugins/resource-maker-next/resource-maker-router-enums';
import { UserController } from '../user/user-resource';
import { Config } from '../../global/config';
import { generateRandomNumericCode, generateToken } from '../../global/util';
import { InvalidRequestError, ForbiddenAccessError } from '../../global/errors';
import { MediaController } from '../media/media-resource';
import { Request } from 'express';
import { ResourceRouter } from '../../plugins/resource-maker-next/resource-router';
import { YEventManager } from '../../plugins/event-manager/event-manager';

export function hasPermission(allPermissions: string[], neededPermissions: string[]): boolean {

  for (const permission of neededPermissions) {

    let isPermitted = false;

    for (const permit of allPermissions) {

      const regexText = '^' + permit.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
      const regexp = new RegExp(regexText);

      if (regexp.test(permission)) {
        isPermitted = true;
        break;
      }

    }

    if (!isPermitted) return false;

  }

  return true;

}


const maker = new ResourceMaker<IAuth>('Auth');

maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'type',
    type: 'string',
    required: true,
    title: 'نوع',
    titleable: true
  },
  {
    key: 'propertyIdentifier',
    type: 'string',
    title: 'شناساگر',
    titleable: true
  },
  {
    key: 'verificationCode',
    type: 'string',
    title: 'کد تایید',
    hideInTable: true
  },
  {
    key: 'valid',
    type: 'boolean',
    default: false,
    title: 'مورد تایید'
  },
  {
    key: 'lastAccessAt',
    type: 'number',
    default: -1,
    title: 'آخرین دسترسی'
  },
  {
    key: 'meta',
    type: 'object',
    title: 'اطلاعات',
    hideInTable: true
  },
  {
    key: 'token',
    type: 'string',
    hidden: true
  }
]);

export const AuthModel      = maker.getModel();
export const AuthController = maker.getController();


maker.addAction({
  signal: ['Route', 'Auth', 'Login'],
  method: ResourceActionMethod.POST,
  path: '/login',
  async dataProvider({ payload }) {

    const user = await UserController.findOne({
      filters: { phoneNumber: payload.phoneNumber }
    });

    await AuthController.create({
      payload: {
        user: user._id,
        type: 'OTP',
        propertyIdentifier: user.phoneNumber,
        verificationCode: Config.authentication.staticVerificationCode ? Config.authentication.staticVerificationCode : generateRandomNumericCode(6),
        token: undefined,
        valid: false,
        meta: undefined
      }
    });

    YEventManager.emit(['Resource', 'User', 'LoggedIn'], user._id, user);

    return true;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Register'],
  method: ResourceActionMethod.POST,
  path: '/register',
  async dataProvider({ payload }) {

    const oldUserCount = await UserController.count({
      filters: { phoneNumber: payload.phoneNumber }
    });
    if (oldUserCount !== 0) throw new InvalidRequestError('user exists');

    const user = await UserController.create({
      payload: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        permissions: ['user.*']
      }
    });

    await AuthController.create({
      payload: {
        user: user._id,
        type: 'OTP',
        propertyIdentifier: user.phoneNumber,
        verificationCode: Config.authentication.staticVerificationCode ? Config.authentication.staticVerificationCode : generateRandomNumericCode(6),
        token: undefined,
        valid: false,
        meta: undefined
      }
    });

    YEventManager.emit(['Resource', 'User', 'Registered'], user._id, user);

    return true;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Verify'],
  method: ResourceActionMethod.POST,
  path: '/verify',
  async dataProvider({ payload }) {

    const phoneNumber = payload.phoneNumber;
    const verificationCode = payload.verificationCode;

    const authTokens = await AuthController.list({
      filters: { propertyIdentifier: phoneNumber },
      sorts: { '_id': -1 },
      includes: {
        'user': '',
        'user.profilePicture': ''
      },
      limit: 1
    });
    console.log('authes', authTokens);

    const authToken = authTokens[0];

    if (!authToken || !verificationCode || !authToken.verificationCode || verificationCode !== authToken.verificationCode) {
      throw new InvalidRequestError('invalid code');
    }

    authToken.verificationCode = undefined;

    authToken.token = generateToken(); // TODO: make sure is unique
    authToken.valid = true;

    await authToken.save();

    const userObj = authToken.user as unknown as IUser;
    const user = JSON.parse(JSON.stringify(userObj));

    YEventManager.emit(['Resource', 'User', 'Verified'], userObj._id, userObj);

    return {
      ...user,
      token: authToken.token
    }

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Logout'],
  method: ResourceActionMethod.POST,
  path: '/logout',
  async dataProvider({ request }) {

    const token = request.headers.authorization;

    const authToken = await AuthController.findOne({
      filters: { token }
    });

    authToken.valid = false;
    await authToken.save();

    YEventManager.emit(['Resource', 'User', 'LoggedOut']);

    return true;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Identity'],
  method: ResourceActionMethod.GET,
  path: '/identity',
  permissionFunction: async ({ user }) => !!user,
  async dataProvider({ user }) {

    if (user && user.profile) {
      // tslint:disable-next-line: no-any
      (user as any).profile = await MediaController.retrieve({ resourceId: user.profile });
    }

    return user;

  }
});

export const AuthRouter = maker.getRouter();


export async function getUserByToken(token?: string) : Promise<IUser | undefined> {
  if (!token) return undefined;

  const authTokens = await AuthController.list({
    filters: { token, valid: true },
    sorts: { '_id': -1 },
    includes: { 'user': '' },
    limit: 1
  });
  if (!authTokens || authTokens.length === 0) return undefined;

  const authToken = authTokens[0];
  if (!authToken?.user) return undefined;

  authToken.lastAccessAt = Date.now();
  authToken.save();

  return authToken.user as unknown as IUser;

}

function transmuteRequest(request: Request) {
  return {
    token: request.headers.authorization || ''
  };
}

ResourceRouter.addPreProcessor(async context => {

  const { action, request } = context;

  const { token } = transmuteRequest(request);
  context.token = token;

  const needToLoadUser = action.permissions || action.permissionFunction || action.payloadValidator || action.payloadPreprocessor || action.postprocessor;
  if (needToLoadUser) context.user = await getUserByToken(token);

  if (action.permissions && (!context.user || !context.user.permissions || !hasPermission(context.user.permissions ?? [], action.permissions)) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  if (action.permissionFunction && !(await action.permissionFunction(context)) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  action.payloadValidator && await action.payloadValidator(context);
  action.payloadPreprocessor && await action.payloadPreprocessor(context);

});

ResourceRouter.addPreResponseProcessor(async context => {

  const { action, request } = context;
  const { token } = transmuteRequest(request);

  if (action.responsePreprocessor) {

    if (!context.user) {
      context.user = await getUserByToken(token);
    }

    await action.responsePreprocessor(context);

  }

});

ResourceRouter.addPostProcessor(async context => {

  const { action, request } = context;
  const { token } = transmuteRequest(request);

  if (action.postprocessor) {

    if (!context.user) {
      context.user = await getUserByToken(token);
    }

    await action.postprocessor(context);

  }

});
