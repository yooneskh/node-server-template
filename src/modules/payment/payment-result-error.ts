import { Config } from '../../config/config';
import { paymentResultPage } from './payment-result-general';

interface IPaymentResultError {
  locale?: string;
  title?: string;
  reason?: string;
  callback?: string;
  callbackSupport?: string;
}

const staticMessages = {
  fa: {
    message: 'خطایی در پرداخت شما رخ داده است. در صورت کم شدن وجه از حساب شما، وجه واریزی حداکثر طی ۷۲ ساعت به شما بازگردانده خواهد شد. در غیر اینصورت لطفا با پشتیبانی تماس بگیرید.',
    callSupport: 'تماس با پشتیبانی',
    back: 'بازگشت'
  },
  en: {
    message: 'There was a problem in processing your payment. If there was a withdrawal from your account, it will be returned within 72 hours. If it didn\'t please call support.',
    callSupport: 'Call Support',
    back: 'Return'
  }
}

export const createErrorResultPage = ({ locale, title, reason, callback, callbackSupport }: IPaymentResultError) => {

  const messages = staticMessages[locale as 'fa' | 'en' ?? Config.localization.defaultLocalization];

  return paymentResultPage({
    locale,
    title,
    color: '#fc5c65',
    body: `
      <div id="card">
        <p>${messages.message}</p>
        <div class="reason">${reason}</div>
        <a href="${callbackSupport}">${messages.callSupport}</a>
        <a href="${callback}">${messages.back}</a>
      </div>
    `
  });

}
