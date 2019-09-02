import { Request, Response } from 'express';
import { ServerError } from './errors';
import { UserController } from '../modules/user/user-resource';

// tslint:disable-next-line: no-any
export async function sanitizeRequestFormat(request: Request, response: Response, next: Function, requestFormat: any, callback: Function): Promise<void> {
  try {

    if (requestFormat) {
      throw new ServerError('not implemented');
    }

    const t = callback();

    t.catch && t.catch(next);

  }
  catch (error) {
    next(error);
  }
}

// tslint:disable-next-line: no-any
export async function sanitizeRequest(request: Request, response: Response, next: Function, requestformat: any, permission: string | undefined, callback: Function): Promise<void> {
  try {

    const token = request.body.token;
    if (!token) throw new ServerError('unauthorized request');

    request.user = await UserController.findOne({ filters: { token }});

    if (requestformat) {
      throw new ServerError('not implemented');
    }

    if (permission) {
      throw new ServerError('not implemented');
    }

    const t = callback();

    t.catch && t.catch(next);

  }
  catch (error) {
    next(error);
  }
}
