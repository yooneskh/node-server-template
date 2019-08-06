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

export default app;
