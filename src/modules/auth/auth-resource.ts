import { IUser } from '../user/user-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { UserController } from '../user/user-resource';
import { InvalidRequestError, ForbiddenAccessError } from '../../global/errors';
import { Request } from 'express';
import { ResourceRouter } from '../../plugins/resource-maker/resource-router';
import { YEventManager } from '../../plugins/event-manager/event-manager';
import { AuthTokenController } from './auth-token-resource';
import { getSSOUserByToken } from '../sarv/sarv-sso';
import { getUserProfile } from '../sarv/sarv-server';

const PERMISSIONS = [
  ['user',
    ['profile', 'retrieve', 'update'],
    ['data-request', 'mine'],
    ['media', 'init-upload', 'upload']
  ],
  ['admin',
    ['account', 'list', 'list-count', 'retrieve', 'delete'],
    ['transaction', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['transfer', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['factor', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['payticket', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['update', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['user', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['permissions', 'list'],
    ['data-category', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['data-request', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['data', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
    ['setting',
      ['website', 'explore', 'footer', 'home', 'navbar']
    ]
  ]
];

const PERMISSIONS_LOCALES = {
  'user': 'کاربر',
  'admin': 'مدیر',
  'profile': 'پروفایل',
  'data-request': 'درخواست داده',
  'media': 'مدیا',
  'account': 'حساب',
  'transaction': 'تراکنش',
  'transfer': 'انتقال',
  'factor': 'فاکتور',
  'update': 'به روز رسانی',
  'payticket': 'تیکت پرداخت',
  'data-category': 'دسته‌بندی داده',
  'data': 'داده',
  'setting': 'تنظیمات',
  'website': 'وب‌سایت',
  'explore': 'گردش',
  'footer': 'پاصفحه',
  'home': 'خانه',
  'navbar': 'سرصفحه',
  'list': 'لیست',
  'list-count': 'تعداد لیست',
  'retrieve': 'گرفتن',
  'create': 'ایجاد کردن',
  'delete': 'حذف'
};

function matchPermission(permit: string, permission: string): boolean {

  const permitParts = permit.split('.');
  const permissionParts = permission.split('.');

  for (let i = 0, len = permitParts.length; i < len; i++) {
    if (permitParts[i] === '*') return  true;
    if (permitParts[i] !== permissionParts[i]) return false;
  }

  return permitParts.length === permissionParts.length;

}

function hasPermission(allPermissions: string[], permission: string): boolean {
  return allPermissions.some(permit => matchPermission(permit, permission));
}

export function hasPermissions(allPermissions: string[], neededPermissions: string[]): boolean {
  return neededPermissions.every(permission => hasPermission(allPermissions, permission));
}


const maker = new ResourceMaker('Auth');


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

    const ssoUser = await getSSOUserByToken(token);
    let user: IUser;

    try {
      user = await UserController.findOne({
        filters: {
          ssoId: ssoUser.sub
        }
      });
    }
    catch {

      const phone = (ssoUser.preferred_username.startsWith('+') ?
        ssoUser.preferred_username : (ssoUser.preferred_username.startsWith('09') ?
          `+98${ssoUser.preferred_username.slice(1)}` : (() => { throw new InvalidRequestError('phone from sso is unrecognizeable ' + ssoUser.preferred_username, 'مشاره تلفن در sso قابل شناسایی نبود') })()
        )
      );

      user = await UserController.create({
        payload: {
          name: ssoUser.name ?? `${ssoUser.given_name || ''} ${ssoUser.family_name || ''}` ?? '',
          phoneNumber: phone,
          ssoId: ssoUser.sub,
          permissions: ['user.*']
        }
      });

    }

    const profile = await getUserProfile(token);

    await UserController.edit({
      resourceId: user._id,
      payload: {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`,
        email: profile.email,
        sarvInfo: profile
      }
    });

    return true;

  }
});

export const AuthRouter = maker.getRouter();


export async function getUserByToken(token?: string): Promise<IUser | undefined> {
  if (!token) return undefined;

  const [ssoUser, profile] = await Promise.all([getSSOUserByToken(token), getUserProfile(token)]);

  const user = await UserController.findOne({
    filters: {
      ssoId: ssoUser.sub
    }
  });

  const phone = (ssoUser.preferred_username.startsWith('+') ?
    ssoUser.preferred_username : (ssoUser.preferred_username.startsWith('09') ?
      `+98${ssoUser.preferred_username.slice(1)}` : (() => { throw new InvalidRequestError('phone from sso is unrecognizeable ' + ssoUser.preferred_username, 'مشاره تلفن در sso قابل شناسایی نبود') })()
    )
  );

  return UserController.edit({
    resourceId: user._id,
    payload: {
      name: `${profile.firstName} ${profile.lastName}`,
      phoneNumber: phone,
      email: profile.email,
      sarvInfo: profile
    }
  });

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

  const { action, request } = context;
  const { token } = transmuteRequest(request);

  if (action.responsePreprocessor) {
    if (!context.user && token) context.user = await getUserByToken(token);
    await action.responsePreprocessor(context);
  }

});

ResourceRouter.addPostProcessor(async context => {

  const { action, request } = context;
  const { token } = transmuteRequest(request);

  if (action.postprocessor) {
    if (!context.user && token) context.user = await getUserByToken(token);
    await action.postprocessor(context);
  }

});
