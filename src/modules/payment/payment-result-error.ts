import { Config } from '../../global/config';

interface IPaymentResultError {
  locale: string;
  title?: string;
  reason?: string;
  callback?: string;
  callbackSupport?: string;
}

const defaultLocale = Config.localization.defaultLocalization;
const faviconUrl = Config.payment.response.favicon;
const fontUrls = Config.payment.response.font;

const staticMessages = {
  fa: {
    message: 'خطایی در پرداخت شما رخ داده است. در صورت کم شدن وجه از حساب شما، وجه واریزی حداکثر طی ۷۲ ساعت به شما بازگردانده خواهد شد. در غیر اینصورت لطفا با پشتیبانی تماس بگیرید.',
    callSupport: 'تماس با پشتیبانی',
    back: 'بازگشت'
  },
  en: {
    message: 'There waqs a problem in processing your payment. If there was a withdrawal from your account, it will be returned within 72 hours. Otherwise please call support.',
    callSupport: 'Call Support',
    back: 'Return'
  }
}

export const createErrorResultPage = ({ locale, title, reason, callback, callbackSupport }: IPaymentResultError = { locale: defaultLocale }) => {

  const fontUrl = fontUrls[locale as 'fa' | 'en'] as string;
  const messages = staticMessages[locale as 'fa' | 'en'];

  return `
  <!DOCTYPE html>
  <html lang="${locale}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="${faviconUrl}">
    <link rel="stylesheet" href="${fontUrl}">
    <title>${title}</title>
    <style>
      * {
        font-family: iryekan, roboto;
      }
      body {
        background: #FAFAFA;
        text-align: center;
        direction: ${['fa', 'ar'].includes(locale) ? 'rtl' : 'ltr'};
      }
      #card {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 4px;
        display: inline-block;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid #fc5c65;
        width: 85%;
        max-width: 512px;
      }
      p {
        margin: 16px 16px 0;
      }
      .reason {
        margin-top: 8px;
        font-family: monospace;
        direction: ltr;
      }
      a {
        background-color: transparent;
        text-decoration: none;
        color: #212121;
        margin: 24px 4px 4px;
        padding: 12px 0;
        border-radius: 4px;
        display: block;
        transition: all 300ms ease-in-out;
      }
      a:hover {
        background: rgba(0, 0, 0, 0.05);
      }
      a + a {
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div id="card">
      <p>${messages.message}</p>
      <div class="reason">${reason}</div>
      <a href="${callbackSupport}">${messages.callSupport}</a>
      <a href="${callback}">${messages.back}</a>
    </div>
  </body>
  </html>`;

}
