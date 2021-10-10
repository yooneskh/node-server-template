import { getConfig } from './config-loader';

export const Config = {
  env: getConfig('env', 'development'),
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
    handleCors: getConfig('corsHandle', 'true' as string) === 'true',
    whitelistOrigins: ['http://localhost:8080', 'https://api-opendata.shiraz.ir', '']
  },
  authentication: {
    staticVerificationCode: '111111',
    tokenValidationDuration: 0
  },
  sso: {
    userInfoUrl: getConfig('sarv.ssoUserUrl', 'https://sso-sarv.rojansoft.com/auth/realms/master/protocol/openid-connect/userinfo')
  },
  sarv: {
    userProfileUrl: getConfig('sarv.profileUrl', 'https://api-sarv.rojansoft.com/api/v1/citizen/profile'),
    userLogoutUrl: getConfig('sarv.logoutUrl', 'https://api-sarv.rojansoft.com/api/v1/logout')
  },
  localization: {
    defaultLocalization: 'fa'
  },
  payment: {
    callbackUrlBase: 'https://api.aaa.opendata.khoshghadam.com/api/paytickets',
    informUrlBase: 'https://panel.aaa.opendata.khoshghadam.com/payment',
    response: {
      title: 'پورتال | نتیجه پرداخت',
      callback: 'https://panel.aaa.opendata.khoshghadam.com',
      callbackSupport: 'https://panel.aaa.opendata.khoshghadam.com',
      favicon: 'https://panel.aaa.opendata.khoshghadam.com/favicon.ico',
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
  }
};

export interface LocalizedString {
  en: string;
  fa: string;
};
