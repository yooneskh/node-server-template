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
