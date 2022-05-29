import { IUser } from '../user/user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { UserController } from '../user/user-resource';
import { InvalidRequestError, ForbiddenAccessError } from '../../global/errors';
import { Request } from 'express';
import { ResourceRouter } from '../../plugins/resource-maker/resource-router';
import { getUserProfile, logoutUser } from '../sarv/sarv-server';
import { hasAllPermissions, hasAnyPermissions, hasSinglePermission, PERMISSIONS, PERMISSIONS_LOCALES } from './auth-util';


const maker = new ResourceMaker('Auth');


maker.addAction({
  signal: ['Route', 'Auth', 'Logout'],
  method: 'POST',
  path: '/logout',
  async dataProvider({ token, payload }) {
    if (!token) throw new InvalidRequestError('token not given', 'شناسه کاربری داده نشده است.');

    if (payload.sarvLogout) {
      await logoutUser(token);
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
  async dataProvider({ token }) {

    const profile = await getUserProfile(token!);

    const user = await UserController.findOne({
      filters: {
        $or: [
          {
            ssoId: profile.SSOId
          },
          {
            'sarvInfo._id': profile._id
          },
        ]
      },
      skipKeyCheck: true
    });


    return UserController.edit({
      resourceId: user._id,
      payload: {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`,
        phoneNumber: profile.phoneNumber.startsWith('09') ? `+98${profile.phoneNumber.slice(1)}` : profile.phoneNumber,
        email: profile.email,
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
          $or: [
            {
              ssoId: profile.SSOId
            },
            {
              'sarvInfo._id': profile._id
            },
          ]
        },
        skipKeyCheck: true
      });
    }
    catch {

      user = await UserController.create({
        payload: {
          name: `${profile.firstName || ''} ${profile.lastName || ''}`,
          phoneNumber: profile.phoneNumber.startsWith('09') ? `+98${profile.phoneNumber.slice(1)}` : profile.phoneNumber,
          ssoId: profile.SSOId,
          permissions: ['user.*']
        }
      });

    }


    await UserController.edit({
      resourceId: user._id,
      payload: {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`,
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


export const AuthRouter = maker.getRouter();


export async function getUserByToken(token?: string): Promise<IUser | undefined> {
  if (!token) return undefined;

  const profile = await getUserProfile(token);

  const user = await UserController.findOne({
    filters: {
      $or: [
        {
          ssoId: profile.SSOId
        },
        {
          'sarvInfo._id': profile._id
        },
      ]
    },
    skipKeyCheck: true
  });

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
