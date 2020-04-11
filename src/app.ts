import Express from 'express';
import Logger from 'morgan';
import CookieParser from 'cookie-parser';
import Cors from 'cors';

import './global/database';

const app = Express();

app.use(Logger('combined'));
app.use(Express.json({ limit: '10mb' }));
app.use(Express.urlencoded({ limit: '10mb', parameterLimit: 100000, extended: false }));
app.use(CookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(Cors());
  console.log('cors loaded');
}

app.get('/ping', (request, response) => response.send('pong'));


// general routes

import { AuthRouter } from './modules/auth/auth-resource';
app.use('/api/v1/auth', AuthRouter);

import { UserRouter } from './modules/user/user-resource';
app.use('/api/v1/users', UserRouter);

import { MediaRouter } from './modules/media/media-resource';
app.use('/api/v1/medias', MediaRouter);

import { UpdateRouter } from './modules/update/update-resource';
app.use('/api/v1/updates', UpdateRouter);

import { ProductRouter } from './modules/shop/product-resource';
app.use('/api/v1/products', ProductRouter);

import { FactorRouter } from './modules/shop/factor-resource';
app.use('/api/v1/factors', FactorRouter);

import { PayTicketRouter } from './modules/shop/pay-ticket-resource';
app.use('/api/v1/paytickets', PayTicketRouter);

import { AccountRouter } from './modules/accounting/account-resource';
app.use('/api/v1/accounts', AccountRouter);

import { TransactionRouter } from './modules/accounting/transaction-resource';
app.use('/api/v1/transactions', TransactionRouter);

import { TransferRouter } from './modules/accounting/transfer-resource';
app.use('/api/v1/transfers', TransferRouter);


// app specific routes

import { BookRouter } from './modules/book/book-resource';
app.use('/api/v1/books', BookRouter);

import { PageRouter } from './modules/book/page-resource';
app.use('/api/v1/pages', PageRouter);

import { AuthorRouter } from './modules/author/author-resource';
app.use('/api/v1/authors', AuthorRouter);


import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
