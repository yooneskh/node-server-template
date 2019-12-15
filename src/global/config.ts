export const Config = {
  port: 48500,
  filesBaseUrl: 'http://localhost:8080',
  database: {
    port: 27017,
    host: 'localhost',
    name: 'yback'
  },
  payment: {
    callbackBase: 'http://localhost:8080/pay/verify',
    email: 'yooneskh@gmail.com',
    phone: '09364524952'
  },
  languages: {
    en: { default: '' },
    fa: { default: '' }
  }
};
