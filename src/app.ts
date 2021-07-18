import Express from 'express';
import Logger from 'morgan';
import CookieParser from 'cookie-parser';
import Cors from 'cors';
import { Config } from './config/config';

import './global/database';

const app = Express();

app.set('trust proxy', true);
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
import { setGlobalRateLimitOption } from './plugins/rate-limiter/rate-limiter';
import './plugins/captcha/captcha-processor';

setGlobalRateLimitOption({
  pointsAmount: 40,
  pointsInterval: 1,
  blockDuration: 10,
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

// import './modules/sms-notification/sms-manager';
// import './modules/telegram-notification/telegram-manager';


// app specific routes

import { DataCategoryRouter } from './modules/data/data-category-resource';
import { DataRouter } from './modules/data/data-resource';
import { TimeTagRouter } from './modules/data/time-tag-resource';
import { DataTypeRouter } from './modules/data/data-type-resource';
import { PublisherRouter } from './modules/data/publisher-resource';
app.use('/api/datacategories', DataCategoryRouter);
app.use('/api/data', DataRouter);
app.use('/api/timetags', TimeTagRouter);
app.use('/api/datatypes', DataTypeRouter);
app.use('/api/publishers', PublisherRouter);

import { ApiServiceRouter } from './modules/api/api-service-resource';
import { ApiEndpointRouter } from './modules/api/api-endpoint-resource';
import { ApiVersionRouter } from './modules/api/api-version-resource';
import { ApiLogRouter } from './modules/api/api-log-resource';
import { ApiPermitRouter } from './modules/api/api-permit-resource';
import { ApiGatewayRouter } from './modules/api/api-gateway';
import { ApiPolicyRouter } from './modules/api/api-policy-resource';
import { ApiRateLimitConfigRouter } from './modules/api/api-rate-limit-config-resource';
import { ApiPaymentConfigRouter } from './modules/api/api-payment-config-resource';
app.use('/api/apiservices', ApiServiceRouter);
app.use('/api/apiendpoints', ApiEndpointRouter);
app.use('/api/apiversions', ApiVersionRouter);
app.use('/api/apilogs', ApiLogRouter);
app.use('/api/apipermits', ApiPermitRouter);
app.use('/api/gateway', ApiGatewayRouter);
app.use('/api/apipolicies', ApiPolicyRouter);
app.use('/api/apiratelimitconfigs', ApiRateLimitConfigRouter);
app.use('/api/apipaymentconfigs', ApiPaymentConfigRouter);


import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
