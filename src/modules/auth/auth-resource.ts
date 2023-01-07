import { IUser } from '../user/user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { UserController } from '../user/user-resource';
import { InvalidRequestError, ForbiddenAccessError, NotFoundError } from '../../global/errors';
import { Request } from 'express';
import { ResourceRouter } from '../../plugins/resource-maker/resource-router';
import { getUserProfile, logoutUser } from '../sarv/sarv-server';
import { hasAllPermissions, hasAnyPermissions, hasSinglePermission, PERMISSIONS, PERMISSIONS_LOCALES } from './auth-util';
import { AuthTokenController } from './auth-token-resource';
import { RoleController } from '../user/role-resource';


function createUUID(parts: number) {
  return (
    Array.from({ length: parts })
      .fill(undefined)
      .map(() => Math.random().toString(16).slice(2))
      .join('-')
  )
}


const maker = new ResourceMaker('Auth');


maker.addAction({
  signal: ['Route', 'Auth', 'Logout'],
  method: 'POST',
  path: '/logout',
  async dataProvider({ token, payload }) {

    if (!token) {
      throw new InvalidRequestError('token not given', 'شناسه کاربری داده نشده است.');
    }

    try {

      const authToken = await AuthTokenController.findOne({
        filters: {
          token,
        }
      });

      AuthTokenController.edit({
        resourceId: authToken._id,
        payload: {
          valid: false,
          closed: true,
          closedAt: Date.now(),
        }
      });

    }
    catch {

      if (payload.sarvLogout) {
        await logoutUser(token);
      }

    }


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
  async dataProvider({ user }) {
    return user;
  }
});

maker.addAction({
  method: 'POST',
  path: '/identity/initialize',
  signal: ['Route', 'Auth', 'InitializeIdentity'],
  async dataProvider({ payload }) {

    const { token } = payload;
    if (!token) throw new InvalidRequestError('invalid token', 'توکن صحیح نیست');

    const profile = await getUserProfile(token);
    let user: IUser;

    try {
      user = await UserController.findOne({
        filters: {
          ssoId: profile.SSOId
        },
      });
    }
    catch {

      user = await UserController.create({
        payload: {
          name: profile.type === 'person' ? `${profile.firstName || ''} ${profile.lastName || ''}` : profile.companyName,
          phoneNumber: profile.phoneNumber.startsWith('09') ? `+98${profile.phoneNumber.slice(1)}` : profile.phoneNumber,
          ssoId: profile.SSOId,
          permissions: ['user.*']
        }
      });

    }


    await UserController.edit({
      resourceId: user._id,
      payload: {
        name: profile.type === 'person' ? `${profile.firstName || ''} ${profile.lastName || ''}` : profile.companyName,
        email: profile.email,
        phoneNumber: profile.phoneNumber.startsWith('09') ? `+98${profile.phoneNumber.slice(1)}` : profile.phoneNumber,
        sarvInfo: profile,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fatherName: profile.fatherName,
        dateOfBirth: profile.dateOfBirth,
        address: profile.address,
        type: profile.type,
        nationalCode: profile.nationalCode,
        companyName: profile.companyName,
        companyRegistrationDate: profile.companyRegistrationDate,
        companyType: profile.companyType,
        economicalCode: profile.economicalCode,
        registrationCode: profile.registrationCode
      }
    });

    return true;

  }
});

maker.addAction({
  method: 'POST',
  path: '/login/admin',
  signal: ['Route', 'Auth', 'LoginAdmin'],
  async dataProvider({ payload }) {

    const { username, password } = payload;

    if (!username || !password) {
      throw new InvalidRequestError('empty username or password', 'کاربر وجود ندارد یا نام کاربری یا رمز عبور اشتباه است.');
    }

    const user = await UserController.findOne({
      filters: {
        adminUsername: username,
      }
    });

    if (!user.adminPassword) {
      throw new Error('user has no password');
    }


    if (user.adminPassword !== password) {
      throw new NotFoundError('invalid password', 'کاربر وجود ندارد یا نام کاربری یا رمز عبور اشتباه است.')
    }


    const authToken = AuthTokenController.create({
      payload: {
        user: user._id,
        type: 'username',
        token: createUUID(12),
        valid: true,
        validatedAt: Date.now(),
        closed: false,
      }
    });


    return authToken;

  }
});


export const AuthRouter = maker.getRouter();


export async function getUserByToken(token?: string): Promise<IUser | undefined> {

  if (!token) {
    return undefined;
  }


  let user: IUser;

  try {

    const authToken = await AuthTokenController.findOne({
      filters: {
        token,
        valid: true,
      }
    });

    user = await UserController.retrieve({
      resourceId: authToken.user,
    });

  }
  catch {

    const profile = await getUserProfile(token);

    user = await UserController.findOne({
      filters: {
        ssoId: profile.SSOId
      },
    });

  }


  if (user.roles && user.roles.length > 0) {

    const roles = await Promise.all(
      user.roles.map(it =>
        RoleController.retrieve({ resourceId: it })
      )
    );

    user.permissions = [user.permissions, roles.flatMap(it => it.permissions)].flat(2);

  }


  return user;

}

function transmuteRequest(request: Request) {
  return {
    token: request.headers.authorization || request.query['x-token'] as string || request.body.xToken as string || ''
  };
}

function makeUserPermissionChecker(user: IUser | undefined) {
  return function(neededPermission: string): boolean {
    if (!user || !user.permissions || user.permissions.length === 0) return false;
    // if (user.blocked) throw new ForbiddenAccessError('user is blocked', 'این کاربر مسدود شده است.');
    return hasSinglePermission(user.permissions, neededPermission);
  }
}

function makeUserAllPermissionsChecker(user: IUser | undefined) {
  return function(neededPermissions: string[]): boolean {
    if (!user || !user.permissions || user.permissions.length === 0) return false;
    // if (user.blocked) throw new ForbiddenAccessError('user is blocked', 'این کاربر مسدود شده است.');
    return hasAllPermissions(user.permissions, neededPermissions);
  }
}

function makeUserAnyPermissionsChecker(user: IUser | undefined) {
  return function(neededPermissions: string[]): boolean {
    if (!user || !user.permissions || user.permissions.length === 0) return false;
    // if (user.blocked) throw new ForbiddenAccessError('user is blocked', 'این کاربر مسدود شده است.');
    return hasAnyPermissions(user.permissions, neededPermissions);
  }
}

ResourceRouter.addPreProcessor(async context => {

  const { action, request } = context;

  const { token } = transmuteRequest(request);
  context.token = token;

  if (context.token) context.user = await getUserByToken(token);
  context.hasPermission = makeUserPermissionChecker(context.user);
  context.hasAllPermissions = makeUserAllPermissionsChecker(context.user);
  context.hasAnyPermission = makeUserAnyPermissionsChecker(context.user);

  if (action.permission && !context.hasPermission(action.permission)) {
    throw new ForbiddenAccessError('forbidden access', 'شما دسترسی لازم را ندارید.');
  }

  if (action.permissions && !context.hasAllPermissions(action.permissions)) {
    throw new ForbiddenAccessError('forbidden access', 'شما دسترسی لازم را ندارید.');
  }

  if (action.anyPermissions && !context.hasAnyPermission(action.anyPermissions)) {
    throw new ForbiddenAccessError('forbidden access', 'شما دسترسی لازم را ندارید.');
  }

  if ( action.permissionFunction && !(await action.permissionFunction(context)) ) {
    throw new ForbiddenAccessError('forbidden access', 'شما دسترسی لازم را ندارید.');
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
