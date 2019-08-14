import Express from 'express';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';

import './global/database';

const app = Express();

app.use(logger.default(':date[clf] :method :url :status :response-time'));
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(cookieParser.default())

app.get('/ping', (request, response) => response.send('pong'));

import { AuthRouter } from './modules/auth/auth-router';
app.use('/auth', AuthRouter);

import { BookRouter } from './modules/book/book-resource';
app.use('/api/v1/books', BookRouter);

import { PageRouter } from './modules/book/page-resource';
app.use('/api/v1/pages', PageRouter);

import { SectionRouter } from './modules/book/section-resource';
app.use('/api/v1/sections', SectionRouter);

import { AuthorRouter } from './modules/author/author-resource';
app.use('/api/v1/authors', AuthorRouter);

import { errorHadler } from './global/errors';
app.use(errorHadler);

export default app;
