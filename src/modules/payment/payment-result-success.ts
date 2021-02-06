import { Config } from '../../global/config';

interface IPaymentResultSuccess {
  locale: string;
  title?: string;
  heading?: string;
  reason?: string;
  callback?: string;
}

const defaultLocale = Config.localization.defaultLocalization;
const faviconUrl = Config.payment.response.favicon;
const fontUrls = Config.payment.response.font;

const staticMessages = {
  fa: {
    caption: 'جهت',
    endResult: 'با موفقیت پرداخت شد.',
    view: 'ادامه'
  },
  en: {
    caption: 'For',
    endResult: 'was payed successfully.',
    view: 'Continue'
  }
}

export const createSuccessResultPage = ({ locale, title, heading, reason, callback }: IPaymentResultSuccess = { locale: defaultLocale }) => {

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
        border-top: 4px solid #26de81;
        width: 85%;
        max-width: 512px;
      }
      h1, h2, p { margin: 0; }
      h1 {
        margin: 16px 16px 16px 8px;
      }
      h2 {
        margin: 8px 16px 16px;
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
    </style>
  </head>
  <body>
    <div id="card">
      <h1>${heading}</h1>
      <div class="caption">${messages.caption}</div>
      <h2>${reason}</h2>
      <p>${messages.endResult}</p>
      <a href="${callback}">${messages.view}</a>
    </div>
  </body>
  </html>`;

}
