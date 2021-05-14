import { IRegisterToken } from './auth-interfaces';
import { IUser } from '../user/user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { UserController } from '../user/user-resource';
import { Config } from '../../global/config';
import { generateRandomNumericCode, generateToken } from '../../global/util';
import { InvalidRequestError, ForbiddenAccessError, InvalidStateError } from '../../global/errors';
import { MediaController } from '../media/media-resource';
import { Request } from 'express';
import { ResourceRouter } from '../../plugins/resource-maker/resource-router';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { AuthTokenController } from './auth-token-resource';
import { RegisterTokenController } from './register-token-resource';
import { IMedia } from '../media/media-interfaces';
import { hasPermissions, PERMISSIONS, PERMISSIONS_LOCALES } from './auth-util';


const maker = new ResourceMaker('Auth');

maker.addAction({
  signal: ['Route', 'Auth', 'Login'],
  method: 'POST',
  path: '/login',
  rateLimitOptions: {
    pointsAmount: 5,
    pointsInterval: 5 * 60,
    blockDuration: 60,
    consecutiveFailDurationMultiplier: 1.5
  },
  captchaOptions: {
    enabled: true
  },
  async dataProvider({ payload }) {

    const user = await UserController.findOne({
      filters: { phoneNumber: payload.phoneNumber }
    });

    const authToken = await AuthTokenController.create({
      payload: {
        user: user._id,
        type: 'OTP',
        propertyType: 'phoneNumber',
        propertyValue: user.phoneNumber,
        verificationCode: Config.authentication.staticVerificationCode || generateRandomNumericCode(6),
        token: undefined,
        valid: false,
        closed: false,
        meta: undefined
      }
    });

    YEventManager.emit(['Resource', 'User', 'LoggedIn'], user._id, user, authToken._id, authToken);
    return true;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Register'],
  method: 'POST',
  path: '/register',
  rateLimitOptions: {
    pointsAmount: 3,
    pointsInterval: 5 * 60,
    blockDuration: 60,
    consecutiveFailDurationMultiplier: 2
  },
  captchaOptions: {
    enabled: true
  },
  async dataProvider({ payload }) {

    const { name, phoneNumber } = payload;

    const oldUserCount = await UserController.count({
      filters: { phoneNumber }
    }); if (oldUserCount !== 0) throw new InvalidRequestError('user exists');

    let registerToken: IRegisterToken;

    const previousRegisterTokens = await RegisterTokenController.list({
      filters: {
        phoneNumber,
        closed: false
      }
    });

    if (previousRegisterTokens.length > 0) {

      registerToken = previousRegisterTokens[0];

      if (registerToken.name !== name) {
        await RegisterTokenController.edit({
          resourceId: registerToken._id,
          payload: { name }
        });
      }

    }
    else {
      registerToken = await RegisterTokenController.create({
        payload: {
          name,
          phoneNumber
        }
      });
    }

    const authToken = await AuthTokenController.create({
      payload: {
        registerToken: registerToken._id,
        type: 'OTP',
        propertyType: 'phoneNumber',
        propertyValue: phoneNumber,
        verificationCode: Config.authentication.staticVerificationCode || generateRandomNumericCode(6),
        token: undefined,
        valid: false,
        closed: false,
        meta: undefined
      }
    });

    YEventManager.emit(['Resource', 'User', 'Registered'], registerToken._id, registerToken, authToken._id, authToken);
    return true;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Verify'],
  method: 'POST',
  path: '/verify',
  rateLimitOptions: {
    pointsAmount: 3,
    pointsInterval: 2 * 60,
    blockDuration: 60,
    consecutiveFailDurationMultiplier: 1.5
  },
  async dataProvider({ payload }) {

    const { phoneNumber, verificationCode } = payload;
    if (!verificationCode) throw new InvalidRequestError('invalid code');

    const authTokens = await AuthTokenController.list({
      filters: {
        propertyType: 'phoneNumber',
        propertyValue: phoneNumber,
        verificationCode,
        valid: false,
        closed: false
      },
      sorts: { '_id': -1 },
      limit: 1
    }); if (authTokens.length !== 1) throw new InvalidRequestError('invalid code');

    const authToken = authTokens[0];

    if (authToken.registerToken) {

      const registerToken = await RegisterTokenController.retrieve({ resourceId: authToken.registerToken });
      if (registerToken.phoneNumber !== phoneNumber) throw new InvalidStateError('register token phone is not the same as verify phone');

      const registerUser = await UserController.create({
        payload: {
          name: registerToken.name,
          phoneNumber: registerToken.phoneNumber,
          permissions: ['user.*']
        }
      });

      await RegisterTokenController.edit({
        resourceId: registerToken._id,
        payload: {
          closed: true,
          closedAt: Date.now()
        }
      });

      authToken.user = registerUser._id;

    }

    let token = generateToken();
    while ((await AuthTokenController.count({ filters: { token, valid: true, closed: false } })) > 0) {
      token = generateToken();
    }

    authToken.verificationCode = undefined;
    authToken.token = token;
    authToken.valid = true;
    authToken.validatedAt = Date.now();
    authToken.updatedAt = Date.now();
    await authToken.save();

    const user = await UserController.retrieve({
      resourceId: authToken.user,
      includes: {
        'profile': ''
      }
    });

    YEventManager.emit(['Resource', 'User', 'Verified'], user._id, user);

    return {
      user,
      token: authToken.token
    }

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Logout'],
  method: 'POST',
  path: '/logout',
  async dataProvider({ token }) {

    const authToken = await AuthTokenController.findOne({
      filters: { token }
    });

    await AuthTokenController.edit({
      resourceId: authToken._id,
      payload: {
        valid: false,
        closed: true,
        closedAt: Date.now()
      }
    });

    YEventManager.emit(['Resource', 'User', 'LoggedOut'], authToken.user);
    return true;

  }
});

maker.addAction({
  method: 'GET',
  path: '/permissions',
  signal: ['Route', 'Auth', 'ListPermissions'],
  permissions: ['admin.permissions.list'],
  async dataProvider() {
    return {
      permissions: PERMISSIONS,
      locales: PERMISSIONS_LOCALES
    };
  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'Identity'],
  method: 'GET',
  path: '/identity',
  permissions: ['user.profile.retrieve'],
  async dataProvider({ user }) {

    if (user!.profile) {
      (user!.profile as unknown as IMedia) = await MediaController.retrieve({ resourceId: user!.profile });
    }

    return user;

  }
});

maker.addAction({
  signal: ['Route', 'Auth', 'IdentityUpdate'],
  method: 'PATCH',
  path: '/identity',
  permissions: ['user.profile.update'],
  async dataProvider({ payload, user }) {
    return UserController.edit({
      resourceId: user!!._id,
      payload
    });
  }
});

export const AuthRouter = maker.getRouter();


export async function getUserByToken(token?: string): Promise<IUser | undefined> {
  if (!token) return undefined;

  const authTokens = await AuthTokenController.list({
    filters: {
      token,
      valid: true,
      closed: false
    },
    sorts: { '_id': -1 },
    includes: { 'user': '' },
    limit: 1
  }); if (authTokens.length === 0) return undefined;

  const authToken = authTokens[0];

  if (Config.authentication.tokenValidationDuration && authToken.validatedAt + Config.authentication.tokenValidationDuration < Date.now()) {
    await AuthTokenController.edit({
      resourceId: authToken._id,
      payload: {
        valid: false,
        closed: true,
        closedAt: Date.now()
      }
    }); return undefined;
  }

  authToken.lastAccessAt = Date.now();
  authToken.save();

  return authToken.user as unknown as IUser;

}

function transmuteRequest(request: Request) {
  return {
    token: request.headers.authorization || request.query['x-token'] as string || request.body.xToken as string || ''
  };
}

ResourceRouter.addPreProcessor(async context => {

  const { action, request } = context;

  const { token } = transmuteRequest(request);
  context.token = token;

  if (context.token) context.user = await getUserByToken(token);

  if (action.permissions && (!context.user || !context.user.permissions || !hasPermissions(context.user.permissions ?? [], action.permissions)) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  if (action.permissionFunction && !(await action.permissionFunction(context)) ) {
    throw new ForbiddenAccessError('forbidden access');
  }

  action.stateValidator && await action.stateValidator(context);
  action.payloadValidator && await action.payloadValidator(context);
  action.payloadPreprocessor && await action.payloadPreprocessor(context);

});

ResourceRouter.addPreResponseProcessor(async context => {
  if (context.action.responsePreprocessor) {
    if (!context.user && context.token) context.user = await getUserByToken(context.token);
    await context.action.responsePreprocessor(context);
  }
});

ResourceRouter.addPostProcessor(async context => {
  if (context.action.postprocessor) {
    if (!context.user && context.token) context.user = await getUserByToken(context.token);
    await context.action.postprocessor(context);
  }
});
