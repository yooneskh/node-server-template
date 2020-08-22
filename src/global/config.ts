export const Config = {
  port: 48500,
  filesBaseUrl: 'http://localhost:8080',
  database: {
    port: 27017,
    host: 'localhost',
    name: 'yback'
  },
  authentication: {
    staticVerificationCode: '111111'
  },
  payment: {
    callbackUrlBase: 'https://api.yooneskh.ir/api/v1/paytickets',
    informUrlBase: 'https://yooneskh.ir/payment',
    zarinpal: {
      email: 'yooneskh@gmail.com',
      phone: '09364524952'
    },
    response: {
      title: 'مرکز طب | نتیجه پرداخت',
      callback: 'https://yooneskh.ir',
      callbackSupport: 'https://yooneskh.ir'
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
  }
};
