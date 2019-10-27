import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionMethod } from '../../resource-maker/resource-router';
import { UserController, IUser } from '../user/user-resource';
import { InvalidRequestError } from '../../global/errors';
import { generateToken } from '../../global/util';
import { MediaController } from '../media/media-resource';
import { IResource } from '../../resource-maker/resource-maker-types';

export interface IAuth extends IResource {
  user: string;
  type: string;
  propertyIdentifier?: string;
  verificationCode?: string;
  token: string;
  valid: boolean;
  lastAccessAt: number;
  // tslint:disable-next-line: no-any
  meta: any;
}

const maker = new ResourceMaker<IAuth>('Auth');

maker.setProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true
  },
  {
    key: 'type',
    type: 'string',
    required: true
  },
  {
    key: 'propertyIdentifier',
    type: 'string'
  },
  {
    key: 'verificationCode',
    type: 'string'
  },
  {
    key: 'token',
    type: 'string'
  },
  {
    key: 'valid',
    type: 'boolean',
    default: false
  },
  {
    key: 'lastAccessAt',
    type: 'number',
    default: -1
  },
  {
    key: 'meta',
    type: 'object'
  }
]);

export const { controller: AuthController } = maker.getMC();

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/login',
  async dataProvider(request, response) {

    const user = await UserController.findOne({
      filters: {
        phoneNumber: request.body.phoneNumber
      }
    });

    await AuthController.createNew({
      payload: {
        user: user._id,
        type: 'OTP',
        propertyIdentifier: user.phoneNumber,
        // verificationCode: generateRandomNumericCode(6);,
        verificationCode: '111111',
        token: undefined,
        valid: false,
        meta: undefined
      }
    });

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/register',
  async dataProvider(request, response) {

    const user = await UserController.createNew({
      payload: {
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        phoneNumber: request.body.phoneNumber,
        permissions: ['user.*']
      }
    });

    await AuthController.createNew({
      payload: {
        user: user._id,
        type: 'OTP',
        propertyIdentifier: user.phoneNumber,
        // verificationCode: generateRandomNumericCode(6);,
        verificationCode: '111111',
        token: undefined,
        valid: false,
        meta: undefined
      }
    });

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/verify',
  async dataProvider(request, response) {

    const phoneNumber = request.body.phoneNumber;
    const verificationCode = request.body.verificationCode;

    const authTokens = await AuthController.list({
      filters: { propertyIdentifier: phoneNumber },
      sorts: { '_id': -1 },
      includes: { 'user': '' },
      limit: 1
    });

    const authToken = authTokens[0];

    if (!authToken || !verificationCode || !authToken.verificationCode || verificationCode !== authToken.verificationCode) {
      throw new InvalidRequestError('invalid code');
    }

    authToken.verificationCode = undefined;

    // TODO: make sure is unique
    authToken.token = generateToken();
    authToken.valid = true;

    await authToken.save();

    const user = JSON.parse(JSON.stringify(authToken.user as unknown as IUser));

    return {
      ...user,
      token: authToken.token
    }

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/logout',
  async dataProvider(request, response) {

    const token = request.headers.authorization;

    const authToken = await AuthController.findOne({
      filters: { token }
    });

    if (authToken) {
      authToken.valid = false;
      await authToken.save();
    }

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.GET,
  path: '/identity',
  async permissionFunctionStrict(user) {
    return !!user;
  },
  async dataProvider(request, response, user) {

    if (user && user.profile) {
      // tslint:disable-next-line: no-any
      (user as any).profile = await MediaController.singleRetrieve({ resourceId: user.profile });
    }

    return user;

  }
});

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

  if (!authToken || !authToken.user) return undefined;

  authToken.lastAccessAt = Date.now();

  authToken.save();

  return authToken.user as unknown as IUser;

}

export const AuthRouter = maker.getRouter();
