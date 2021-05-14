import Express from 'express';
import Logger from 'morgan';
import CookieParser from 'cookie-parser';
import Cors from 'cors';

import './global/database';

const app = Express();

app.use(Logger(':date[clf] :method :url :status :res[content-length] :response-time ms'));
app.use(Express.json({ limit: '10mb' }));
app.use(Express.urlencoded({ limit: '10mb', parameterLimit: 100000, extended: false }));
app.use(CookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(Cors());
  console.log('cors loaded');
}

app.get('/ping', (_request, response) => response.send('pong'));


// general routes

import './plugins/html-sanitizer/html-sanitizer-processor';
import { setGlobalRateLimitOption } from './plugins/rate-limiter/rate-limiter';
import './plugins/captcha/captcha-processor';

setGlobalRateLimitOption({
  pointsAmount: 10,
  pointsInterval: 20,
  blockDuration: 60,
  consecutiveFailDurationMultiplier: 1.5
});

import { AuthRouter } from './modules/auth/auth-resource';
import { CaptchaRouter } from './plugins/captcha/captcha-resource';
app.use('/api/auth', AuthRouter);
app.use('/api/captchas', CaptchaRouter);

import { UserRouter } from './modules/user/user-resource';
app.use('/api/users', UserRouter);

import { MediaRouter } from './modules/media/media-resource';
app.use('/api/media', MediaRouter);

import { UpdateRouter } from './modules/update/update-resource';
app.use('/api/updates', UpdateRouter);

import { FactorRouter } from './modules/payment/factor-resource';
import { PayTicketRouter } from './modules/payment/pay-ticket-resource';
app.use('/api/factors', FactorRouter);
app.use('/api/paytickets', PayTicketRouter);

import { AccountRouter } from './modules/accounting/account-resource';
import { TransactionRouter } from './modules/accounting/transaction-resource';
import { TransferRouter } from './modules/accounting/transfer-resource';
app.use('/api/accounts', AccountRouter);
app.use('/api/transactions', TransactionRouter);
app.use('/api/transfers', TransferRouter);

import './modules/sms-notification/sms-manager';
import './modules/telegram-notification/telegram-manager';


// app specific routes

import { BookRouter } from './modules/book/book-resource';
app.use('/api/books', BookRouter);

import { PageRouter } from './modules/book/page-resource';
app.use('/api/pages', PageRouter);

import { AuthorRouter } from './modules/author/author-resource';
app.use('/api/authors', AuthorRouter);

import { ApplicationSettingRouter } from './modules/settings/application-settings';
app.use('/api/settings/application', ApplicationSettingRouter);


import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
