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
    key: 'meta',
    type: 'object'
  }
]);

const { controller: AuthController } = maker.getMC();

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
        permissions: ['user.*'],
        // verificationCode: generateRandomNumericCode(6),
        token: undefined
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

    // const user = await UserController.findOne({ filters: { phoneNumber }});
    const authToken = await AuthController.findOne({
      filters: { propertyIdentifier: phoneNumber },
      includes: { 'user': '' }
    });

    if (!verificationCode || !authToken.verificationCode || verificationCode !== authToken.verificationCode) throw new InvalidRequestError('invalid code');

    authToken.verificationCode = undefined;

    // TODO: make sure is unique
    authToken.token = generateToken();

    await authToken.save();

    return {
      ...(authToken.user as unknown as IUser),
      token: authToken.token
    }

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

export const AuthRouter = maker.getRouter();
