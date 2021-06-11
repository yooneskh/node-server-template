export const PERMISSIONS = [
  ['user',
    ...[ // general
      ['profile', 'retrieve', 'update'],
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
        ['account', 'list', 'list-count', 'retrieve', 'delete'],
        ['transaction', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['transfer', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['factor', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['payticket', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['update', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['user', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete']
      ],
      ...[ // others
        ['setting',
          ['application']
        ]
      ]
    ],
    ...[ // app specific
      ...[ // resources
        ['book', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['page', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete'],
        ['author', 'list', 'list-count', 'retrieve', 'create', 'update', 'delete']
      ],
      ...[ // others

      ]
    ]
  ]
];

export const PERMISSIONS_LOCALES = {
  'user': 'کاربر',
  'admin': 'مدیر',
  ...{ // general
    ...{ // resources
      'media': 'مدیا',
      'account': 'حساب',
      'transaction': 'تراکنش',
      'transfer': 'انتقال',
      'factor': 'فاکتور',
      'payticket': 'تیکت پرداخت',
      'permissions': 'تنظیمات',
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
    },
    ...{ // others
      'setting': 'تنظیمات',
      'application': 'برنامه',
    }
  },
  ...{ // app specific
    ...{ // resources
      'book': 'کتاب',
      'page': 'صفحه',
      'author': 'نویسنده'
    },
    ...{ // actions

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

export function hasPermissions(allPermissions: string[], neededPermissions: string[]): boolean {
  return neededPermissions.every(permission => hasPermission(allPermissions, permission));
}
