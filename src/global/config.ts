export const Config = {
  port: process.env.PORT || 48501,
  filesBaseUrl: process.env.FILES_BASE_URL || 'https://api.aaa.opendata.khoshghadam.com',
  database: {
    port: process.env.DB_PORT || 27017,
    host: process.env.DB_HOST || 'localhost',
    name: process.env.DB_NAME || 'opendata_aaa'
  },
  authentication: {
    staticVerificationCode: '111111',
    tokenValidationDuration: 0
  },
  localization: {
    defaultLocalization: 'fa'
  },
  payment: {
    callbackUrlBase: 'https://api.aaa.opendata.khoshghadam.com/api/paytickets',
    informUrlBase: 'https://panel.aaa.opendata.khoshghadam.com/payment',
    response: {
      title: 'اپلیکیشن | نتیجه پرداخت',
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
