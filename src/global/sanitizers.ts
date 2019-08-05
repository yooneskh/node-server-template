import { IncomingMessage, ServerResponse } from 'http';
import Restana from 'restana';
import { getUserByToken } from '../modules/user/user-controller';

// tslint:disable-next-line: no-any
export async function sanitizeRequestFormat(request: IncomingMessage & Restana.RequestExtensions, requestFormat: any, callback: Function): Promise<void> {

  if (requestFormat) {
    throw new Error('not implemented');
  }

  callback();

}

// tslint:disable-next-line: no-any
export async function sanitizeRequest(request: IncomingMessage & Restana.RequestExtensions, response: ServerResponse & Restana.ResponseExtensions, requestformat: any, permission: string | undefined, callback: Function): Promise<void> {

  const token = request.body.token;
  if (!token) throw new Error('unauthorized request');

  request.user = await getUserByToken(token);

  if (requestformat) {
    throw new Error('not implemented');
  }

  if (permission) {
    throw new Error('not implemented');
  }

  callback();

}
