import { Request, Response } from 'express';

class HandleableError extends Error {
  public code = 1000;
}

export class NotFoundError extends HandleableError {
  public code = 1001;
}

export class ForbiddenAccessError extends HandleableError {
  public code = 1002;
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

export function errorHandler(error: Error, request: Request, response: Response, next: Function) {

  console.log('Error ::', error.message);

  if (error instanceof NotFoundError) {
    response.status(404).json({ code: error.code, message: error.message});
  }
  else if (error instanceof ForbiddenAccessError) {
    response.status(403).json({ code: error.code, message: error.message});
  }
  else {
    response.status(400).json({ code: error instanceof HandleableError ? error.code : -1, message: error.message});
  }

}
