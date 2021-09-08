export const PERMISSIONS = [
  ['user',
    ...[ // general
      ['profile', 'update'],
      ['media', 'init-upload', 'upload']
    ],
    ...[ // app specific

    ]
  ],
  ['admin',
    ...[ // general
      ...[ // resources
        ['permissions', 'list'],
        ['media', 'list', 'list-count', 'retrieve'],
        ['user', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete']
      ],
      ...[ // others

      ]
    ],
    ...[ // app specific
      ...[ // resources
        ['data-category', 'retrieve', 'create', 'update', 'delete'],
        ['data', 'retrieve', 'create', 'update', 'delete'],
        ['time-tag', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['data-type', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['publisher', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['api-service', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['api-endpoint', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['api-version', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete', 'run', 'list-users'],
        ['api-log', 'list', 'list-count', 'retrieve'],
        ['api-policy', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['api-rate-limit-config', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['api-payment-config', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete']
      ],
      ...[ // others

      ]
    ]
  ]
];

export const PERMISSIONS_LOCALES = {
  'user': 'کاربر',
  'admin': 'مدیر',
  'setting': 'تنظیمات',
  ...{ // general
    ...{ // resources
      'media': 'مدیا',
      'account': 'حساب',
      'transaction': 'تراکنش',
      'transfer': 'انتقال',
      'factor': 'فاکتور',
      'payticket': 'تیکت پرداخت',
      'permissions': 'تنظیمات',
      'ticket-category': 'دسته‌بندی تیکت',
      'ticket': 'تیکت'
    },
    ...{ // actions
      'list': 'لیست',
      'list-count': 'تعداد لیست',
      'retrieve': 'گرفتن',
      'create': 'ایجاد کردن',
      'update': 'به روز رسانی',
      'delete': 'حذف',
      'profile': 'پروفایل',
      'init-upload': 'شروع بارگذاری',
      'upload': 'بارگذاری',
      'manage': 'مدیریت'
    },
    ...{ // others
      'application': 'برنامه'
    }
  },
  ...{ // app specific
    ...{ // resources
      'data-category': 'دسته‌بندی داده',
      'data': 'داده',
      'time-tag': 'تگ زمانی',
      'data-type': 'نوع داده',
      'publisher': 'انتشار دهنده',
      'api-service': 'سرویس Api',
      'api-endpoint': 'واحد Api',
      'api-version': 'نسخه Api',
      'api-log': 'لاگ Api',
      'api-policy': 'سیاست Api',
      'api-rate-limit-config': 'تنظیمات میزان فراخوانی Api',
      'api-payment-config': 'تنظیمات هزینه Api'
    },
    ...{ // actions
      'run': 'اجرا',
      'list-users': 'لیست استفاده کننده ها'
    },
    ...{ // others

    }
  }
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

export function hasSinglePermission(allPermissions: string[], neededPermission: string): boolean {
  if (!neededPermission) return true;
  return hasPermission(allPermissions, neededPermission);
}

export function hasAllPermissions(allPermissions: string[], neededPermissions: string[]): boolean {
  if (!neededPermissions || neededPermissions.length === 0) return true;
  return neededPermissions.every(permission => hasPermission(allPermissions, permission));
}

export function hasAnyPermissions(allPermissions: string[], neededPermissions: string[]): boolean {
  if (!neededPermissions || neededPermissions.length === 0) return true;
  return neededPermissions.some(permission => hasPermission(allPermissions, permission));
}
