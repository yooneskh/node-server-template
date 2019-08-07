import { Request, Response } from 'express';
import { getUserByToken } from '../modules/user/user-controller';

// tslint:disable-next-line: no-any
export async function sanitizeRequestFormat(request: Request, response: Response, next: Function, requestFormat: any, callback: Function): Promise<void> {
  try {

    if (requestFormat) {
      throw new Error('not implemented');
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
    if (!token) throw new Error('unauthorized request');

    request.user = await getUserByToken(token);

    if (requestformat) {
      throw new Error('not implemented');
    }

    if (permission) {
      throw new Error('not implemented');
    }

    const t = callback();

    t.catch && t.catch(next);

  }
  catch (error) {
    next(error);
  }
}
