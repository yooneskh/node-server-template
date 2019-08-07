import { Request, Response } from 'express';

export function errorHadler(error: Error, request: Request, response: Response, next: Function) {

  console.log('Error ::', error.message);

  response.status(400).send(error);

}
