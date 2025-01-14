import { getConfig } from './config-loader';

export const Config = {
  env: getConfig('env', 'production'),
  port: getConfig('port', 48501),
  database: {
    host: getConfig('db.host', 'localhost'),
    port: getConfig('db.port', 27017),
    name: getConfig('db.name', 'opendata_aaa')
  },
  media: {
    baseUrl: getConfig('media.baseUrl', 'https://api.aaa.opendata.khoshghadam.com'),
    directory: getConfig('media.directory', 'download')
  },
  cors: {
    handleCors: getConfig('corsHandle', '' as string) === 'true',
    whitelistOrigins: ['https://panel-aaa-opendata.shiraz.ir', 'https://api-opendata.shiraz.ir', '']
  },
  authentication: {
    staticVerificationCode: '111111',
    tokenValidationDuration: 0
  },
  sso: {
    userInfoUrl: getConfig('sarv.ssoUserUrl', 'https://sso-sarv.shiraz.ir/auth/realms/master/protocol/openid-connect/userinfo')
  },
  sarv: {
    userProfileUrl: getConfig('sarv.profileUrl', 'https://api-sarv.shiraz.ir/api/v1/citizen/profile'),
    userLogoutUrl: getConfig('sarv.logoutUrl', 'https://api-sarv.shiraz.ir/api/v1/logout')
  },
  localization: {
    defaultLocalization: 'fa'
  },
  payment: {
    callbackUrlBase: getConfig('payment.callbackUrlBase', 'https://api.aaa.opendata.khoshghadam.com/api/paytickets'),
    informUrlBase: getConfig('payment.informUrlBase', 'https://panel.aaa.opendata.khoshghadam.com/payment'),
    response: {
      title: 'پورتال | نتیجه پرداخت',
      callback: getConfig('payment.response.callback', 'https://panel.aaa.opendata.khoshghadam.com'),
      callbackSupport: getConfig('payment.response.callbackSupport', 'https://panel.aaa.opendata.khoshghadam.com'),
      favicon: getConfig('payment.response.favicon', 'https://panel.aaa.opendata.khoshghadam.com/favicon.ico'),
      font: {
        fa: 'https://cdn.khoshghadam.com/font/iryekan/iryekan.css',
        en: 'https://cdn.khoshghadam.com/font/roboto/roboto.css'
      }
    }
  },
  zarinpal: {
    merchantId: '',
    isSandboxed: true
  },
  languages: {
    en: { default: '' },
    fa: { default: '' }
  },
  kavenegar: {
    apiKey: ''
  },
  ifttt: {
    telegram: {
      key: ''
    }
  },
  captcha: {
    validDuration: 1000 * 60 * 2
  },
  parsian: {
    loginAccount: 'Xr6I1ViYvNLK7NDgAJr2',
    paymentRequestUrl: 'http://172.17.201.213/NewIPGServices/Sale/SaleService.asmx',
    paymentVerificationUrl: 'http://172.17.201.213/NewIPGServices/Confirm/ConfirmService.asmx',
    proxy: {
      enabled: false,
      method: 'post',
      url: 'https://api.test.ir'
    }
  },
  magfa: {
    domain: 'shirazfava',
    username: 'sharvandi',
    password: 'IIXDQbSUMBZxdIRF',
    fromNumber: '3000137729',
  },
};

export interface LocalizedString {
  en: string;
  fa: string;
};
