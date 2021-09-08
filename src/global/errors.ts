import { Request, Response } from 'express';

export class HandleableError extends Error {

  public code = 1000;
  public statusCode = 400;
  public responseHeaders: Record<string, unknown> = {};

  // tslint:disable-next-line: no-any
  constructor(message?: string | undefined, public responseMessage?: string | undefined, public extra?: Record<string, any> | undefined) {
    super(message);
  }

}

export class NotFoundError extends HandleableError {
  public code = 1001;
  public statusCode = 404;
}

export class ForbiddenAccessError extends HandleableError {
  public code = 1002;
  public statusCode = 403;
}

export class InvalidRequestError extends HandleableError {
  public code = 1003;
}

export class ServerError extends HandleableError {
  public code = 1004;
}

export class InvalidStateError extends HandleableError {
  public code = 1005;
}

export class RouteBypassedError extends HandleableError {
  public code = 1006;
}

export function errorHandler(error: Error, _request: Request, response: Response, _next: Function) {
  if (error instanceof RouteBypassedError) return;

  console.error('Error ::', error.message);

  if (error instanceof HandleableError) {

    for (const header in error.responseHeaders) {
      response.setHeader(header, String(error.responseHeaders[header]));
    }

    response.status(error.statusCode)
    response.json({ code: error.code, message: error.responseMessage ?? error.message, ...(error.extra || {}) });

  }
  else {
    response.status(400).json({ message: error.message });
  }

}

process.on('uncaughtException', error => {
  console.error('socket/events error ::', error.message);
});
