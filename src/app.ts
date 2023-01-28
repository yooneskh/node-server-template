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

app.post('/test', (request, response) => {

  if (!request.body) {
    return response.status(400).json({ message: 'no body specified' });
  }

  if (typeof request.body !== 'object') {
    return response.status(400).json({ message: 'body is not an object' });
  }

  if (!request.body.name) {
    return response.status(400).json({ message: '"name" property does not exist in the body' });
  }

  if (request.body.name !== 'Shiraz OpenData') {
    return response.status(400).json({ message: '"name" property is not equal to "Shiraz OpenData"' });
  }

  return response.json({ success: true });

});


// general routes

// import './plugins/html-sanitizer/html-sanitizer-processor';
import { setGlobalRateLimitOption } from './plugins/rate-limiter/rate-limiter';
import './plugins/captcha/captcha-processor';
import './plugins/log-requests/log-request-processor';

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
import { RoleRouter } from './modules/user/role-resource';
app.use('/api/users', UserRouter);
app.use('/api/roles', RoleRouter);

import { MediaRouter } from './modules/media/media-resource';
app.use('/api/media', MediaRouter);

import './modules/media/media-validators'
import './modules/media/media-addons'

import { LogRouter } from './plugins/log-requests/log-resource';
app.use('/api/logs' , LogRouter);

// import './modules/sms-notification/sms-manager';
// import './modules/telegram-notification/telegram-manager';


// app specific routes

import { DataCategoryRouter } from './modules/data/data-category-resource';
import { DataRouter } from './modules/data/data-resource';
import { TimeTagRouter } from './modules/data/time-tag-resource';
import { DataTypeRouter } from './modules/data/data-type-resource';
import { PublisherRouter } from './modules/data/publisher-resource';
import { GeoDataRouter } from './modules/data/geo-data-resource';
app.use('/api/datacategories', DataCategoryRouter);
app.use('/api/data', DataRouter);
app.use('/api/timetags', TimeTagRouter);
app.use('/api/datatypes', DataTypeRouter);
app.use('/api/publishers', PublisherRouter);
app.use('/api/geodata', GeoDataRouter);

import { ApiEndpointRouter } from './modules/api/api-endpoint-resource';
import { ApiVersionRouter } from './modules/api/api-version-resource';
import { ApiLogRouter } from './modules/api/api-log-resource';
import { ApiPermitRouter } from './modules/api/api-permit-resource';
import { ApiGatewayRouter } from './modules/api/api-gateway';
import { ApiPolicyRouter } from './modules/api/api-policy-resource';
import { ApiReceiverRouter } from './modules/api/api-receivers-resource';
import { ApiNewRequestRouter } from './modules/api/api-new-request-resource';
import { ApiRequestRouter } from './modules/api/api-request-resource';
import { ApiCallDetailsRouter } from './modules/api/runner/api-call-details';
app.use('/api/apiendpoints', ApiEndpointRouter);
app.use('/api/apiversions', ApiVersionRouter);
app.use('/api/apilogs', ApiLogRouter);
app.use('/api/apipermits', ApiPermitRouter);
app.use('/api/gateway', ApiGatewayRouter);
app.use('/api/apipolicies', ApiPolicyRouter);
app.use('/api/apireceivers', ApiReceiverRouter);
app.use('/api/apinewrequests', ApiNewRequestRouter);
app.use('/api/apirequests', ApiRequestRouter);
app.use('/api/apicalldetails', ApiCallDetailsRouter);


import { ConditionRouter } from './modules/condition/condition-resource';
import { ConditionDocumentRouter } from './modules/condition/condition-document-resource';
import { ConditionDocumentEntryRouter } from './modules/condition/condition-document-entry-resource';
app.use('/api/conditions', ConditionRouter);
app.use('/api/conditiondocuments', ConditionDocumentRouter);
app.use('/api/conditiondocumententries', ConditionDocumentEntryRouter);


import { AccountRouter } from './modules/accounting/account-resource';
import { TransactionRouter } from './modules/accounting/transaction-resource';
import { TransferRouter } from './modules/accounting/transfer-resource';
app.use('/api/accounts', AccountRouter);
app.use('/api/transactions', TransactionRouter);
app.use('/api/transfers', TransferRouter);

import { PayTicketRouter } from './modules/payment/pay-ticket-resource';
app.use('/api/paytickets', PayTicketRouter);

import './modules/accounting/account-listeners';


import { ApiTicketRouter } from './modules/ticket/api-ticket-resource';
import { TicketCategoryRouter } from './modules/ticket/ticket-category-resource';
import { TicketMessageRouter } from './modules/ticket/ticket-message-resource';
app.use('/api/apitickets', ApiTicketRouter);
app.use('/api/ticketcategories', TicketCategoryRouter);
app.use('/api/ticketmessages', TicketMessageRouter);


import { GuideRouter } from './modules/guide/guide-resource';
app.use('/api/guides', GuideRouter);


import { ApiHomeSettingRouter } from './modules/settings/api-home-settings';
app.use('/api/settings/api/home', ApiHomeSettingRouter);


import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
