import { Config } from '../../config/config';

const defaultLocale = Config.localization.defaultLocalization;

const faviconUrl = Config.payment.response.favicon;
const fontUrls = Config.payment.response.font;

export function paymentResultPage({ locale, title, body, color }: { locale?: string, title?: string, body?: string, color?: string }) {

  const fontUrl = fontUrls[locale as 'fa' | 'en' ?? defaultLocale] as string;

  return `
  <!DOCTYPE html>
  <html lang="${locale ?? defaultLocale}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="${faviconUrl}">
    <link rel="stylesheet" href="${fontUrl}">
    <title>${title}</title>
    <style>
      * {
        font-family: iryekan, Roboto;
      }
      body {
        background: #FAFAFA;
        text-align: center;
        direction: ${['fa', 'ar'].includes(locale ?? defaultLocale) ? 'rtl' : 'ltr'};
      }
      #card {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 4px;
        display: inline-block;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid ${color};
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
      p {
        margin: 8px 16px;
      }
      p:first-child {
        margin-top: 16px;
      }
      a {
        background-color: transparent;
        text-decoration: none;
        color: #212121;
        margin: 4px;
        padding: 12px 0;
        border-radius: 4px;
        display: block;
        transition: all 300ms ease-in-out;
      }
      a:first-of-type {
        margin-top: 24px;
      }
      a:hover {
        background: rgba(0, 0, 0, 0.05);
      }
      .reason {
        font-weight: bold;
        margin-top: 16px;
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
  </html>`;

}
