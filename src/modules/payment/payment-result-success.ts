import { paymentResultPage } from './payment-result-general';

interface IPaymentResultSuccess {
  locale?: string;
  title?: string;
  heading?: string;
  reason?: string;
  callback?: string;
}

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

export const createSuccessResultPage = ({ locale, title, heading, reason, callback }: IPaymentResultSuccess) => {

  const messages = staticMessages[locale as 'fa' | 'en'];

  return paymentResultPage({
    locale,
    title,
    color: '#26de81',
    body: `
      <div id="card">
        <h1>${heading}</h1>
        <div class="caption">${messages.caption}</div>
        <h2>${reason}</h2>
        <p>${messages.endResult}</p>
        <a href="${callback}">${messages.view}</a>
      </div>
    `
  });

}
