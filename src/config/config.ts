import { getConfig } from './config-loader';

export const Config = {
  env: getConfig('env', ''),
  port: getConfig('port', 48500),
  database: {
    host: getConfig('db.host', 'localhost'),
    port: getConfig('db.port', 27017),
    name: getConfig('db.name', 'yback')
  },
  media: {
    baseUrl: getConfig('media.baseUrl', 'http://localhost:8080'),
    directory: getConfig('media.directory', 'download')
  },
  authentication: {
    staticVerificationCode: '111111',
    tokenValidationDuration: 0
  },
  localization: {
    defaultLocalization: 'fa'
  },
  payment: {
    callbackUrlBase: 'https://api.yooneskh.ir/api/paytickets',
    informUrlBase: 'https://yooneskh.ir/payment',
    response: {
      title: 'اپلیکیشن | نتیجه پرداخت',
      callback: 'https://yooneskh.ir',
      callbackSupport: 'https://yooneskh.ir',
      favicon: 'https://yooneskh.ir/favicon.ico',
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

export interface LocalizedString {
  en: string;
  fa: string;
};
