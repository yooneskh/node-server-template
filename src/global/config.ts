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
    callbackBase: 'http://localhost:8080/payment/verify',
    email: 'yooneskh@gmail.com',
    phone: '09364524952'
  },
  zarinpal: {
    merchantId: 'c40c2e72-f604-11e7-95af-000c295eb8fc',
    isSandboxed: true
  },
  languages: {
    en: { default: '' },
    fa: { default: '' }
  }
};
