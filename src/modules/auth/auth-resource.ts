import { IResource } from '../../resource-maker/resource-maker-types';
import { ResourceMaker, ResourceActionMethod } from '../../resource-maker/resource-maker';
import { InvalidRequestError } from '../../global/errors';
import { generateToken } from '../../global/util';
import { IUser, UserController } from '../user/user-resource';
import { MediaController } from '../media/media-resource';


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
  async dataProvider({ request }) {

    const user = await UserController.findOne(
      { phoneNumber: request.body.phoneNumber }
    );

    await AuthController.createNew({
      user: user._id,
      type: 'OTP',
      propertyIdentifier: user.phoneNumber,
      // verificationCode: generateRandomNumericCode(6);,
      verificationCode: '111111',
      token: undefined,
      valid: false,
      meta: undefined
    });

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/register',
  async dataProvider({ request }) {

    const user = await UserController.createNew({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      phoneNumber: request.body.phoneNumber,
      permissions: ['user.*']
    });

    await AuthController.createNew({
      user: user._id,
      type: 'OTP',
      propertyIdentifier: user.phoneNumber,
      // verificationCode: generateRandomNumericCode(6);,
      verificationCode: '111111',
      token: undefined,
      valid: false,
      meta: undefined
    });

    return true;

  }
});

maker.addAction({
  method: ResourceActionMethod.POST,
  path: '/verify',
  async dataProvider({ request }) {

    const phoneNumber = request.body.phoneNumber;
    const verificationCode = request.body.verificationCode;

    const authTokens = await AuthController.list(
      { propertyIdentifier: phoneNumber },
      { '_id': -1 },
      { 'user': '' },
      undefined,
      1
    );

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
  async dataProvider({ request }) {

    const token = request.headers.authorization;

    const authToken = await AuthController.findOne(
      { token }
    );

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
  async permissionFunctionStrict({ user }) {
    return !!user;
  },
  async dataProvider({ user }) {

    if (user && user.profile) {
      (user as any).profile = await MediaController.singleRetrieve(user.profile);
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
