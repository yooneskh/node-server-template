import Express from 'express';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as Cors from 'cors';

import './global/database';

const app = Express();

app.use(logger.default(':date[clf] :method :url :status :response-time'));
app.use(Express.json({ limit: '10mb' }));
app.use(Express.urlencoded({ limit: '10mb', parameterLimit: 100000, extended: false }));
app.use(cookieParser.default())

if (process.env.NODE_ENV === 'development') {
  app.use(Cors.default());
  console.log('cors loaded');
}

app.get('/ping', (request, response) => response.send('pong'));

import { AuthRouter } from './modules/auth/auth-resource';
app.use('/api/v1/auth', AuthRouter);

import { UserRouter } from './modules/user/user-resource';
app.use('/api/v1/users', UserRouter);

import { BookRouter } from './modules/book/book-resource';
app.use('/api/v1/books', BookRouter);

import { PageRouter } from './modules/book/page-resource';
app.use('/api/v1/pages', PageRouter);

import { AuthorRouter } from './modules/author/author-resource';
app.use('/api/v1/authors', AuthorRouter);

import { MediaRouter } from './modules/media/media-resource';
app.use('/api/v1/medias', MediaRouter);

import { errorHandler } from './global/errors';
app.use(errorHandler);

export default app;
