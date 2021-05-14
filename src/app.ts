import Express from 'express';
import Logger from 'morgan';
import CookieParser from 'cookie-parser';
import Cors from 'cors';
import { Config } from './global/config';

import './global/database';

const app = Express();

app.use(Logger(':date[clf] :method :url :status :res[content-length] :response-time ms'));
app.use(Express.json({ limit: '10mb' }));
app.use(Express.urlencoded({ limit: '10mb', parameterLimit: 100000, extended: false }));
app.use(CookieParser());

if (Config.cors.handleCors) {
  app.use(Cors({
    origin: (origin, callback) => {
      if (Config.cors.whitelistOrigins.includes(origin || '')) {
        callback(null, true); // tslint:disable-line: no-null-keyword
      }
      else {
        callback(new Error('Invalid CORS'));
      }
    }
  })); console.log('cors loaded');
}

app.get('/ping', (_request, response) => response.send('pong'));


// general routes

import './plugins/html-sanitizer/html-sanitizer-processor';
import './plugins/rate-limiter/rate-limiter';
import './plugins/captcha/captcha-processor';

import { AuthRouter } from './modules/auth/auth-resource';
import { CaptchaRouter } from './plugins/captcha/captcha-resource';
app.use('/api/auth', AuthRouter);
app.use('/api/captchas', CaptchaRouter);

import { UserRouter } from './modules/user/user-resource';
app.use('/api/users', UserRouter);

import { MediaRouter } from './modules/media/media-resource';
app.use('/api/media', MediaRouter);

import './modules/sms-notification/sms-manager';
// import './modules/telegram-notification/telegram-manager';


// app specific routes

import { DataCategoryRouter } from './modules/data/data-category-resource';
import { DataRouter } from './modules/data/data-resource';
app.use('/api/datacategories', DataCategoryRouter);
app.use('/api/data', DataRouter);


import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
