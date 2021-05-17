import { getConfig } from './config-loader';

export const Config = {
  env: getConfig('env', ''),
  port: getConfig('port', 48501),
  database: {
    host: getConfig('db.host', 'localhost'),
    port: getConfig('db.port', 27017),
    name: getConfig('db.name', 'opendata_aaa')
  },
  media: {
    baseUrl: getConfig('media.baseUrl', 'http://api.aaa.opendata.khoshghadam.com'),
    directory: getConfig('media.directory', 'download')
  },
  cors: {
    handleCors: getConfig('corsHandle', '' as string) === 'true',
    whitelistOrigins: ['https://panel-aaa-opendata.shiraz.ir', 'https://api-data.shiraz.ir']
  },
  authentication: {
    staticVerificationCode: '111111',
    tokenValidationDuration: 0
  },
  sso: {
    userInfoUrl: getConfig('sarv.ssoUserUrl', 'https://sso-sarv.rojansoft.com/auth/realms/master/protocol/openid-connect/userinfo')
  },
  sarv: {
    userProfileUrl: getConfig('sarv.profileUrl', 'https://api-sarv.rojansoft.com/api/v1/citizen/profile')
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
    merchantId: 'c40c2e72-f604-11e7-95af-000c295eb8fc',
    isSandboxed: true
  },
  languages: {
    en: { default: '' },
    fa: { default: '' }
  },
  kavenegar: {
    apiKey: '31315054767A313565645A53616B766B7171544F505055394E415155386F4D76'
  },
  ifttt: {
    telegram: {
      key: 'bd9xshBbi7rURLfoTaN8d6'
    }
  },
  captcha: {
    validDuration: 1000 * 60 * 2
  }
};