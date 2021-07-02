import { IApiVersion } from '../api-interfaces';

export interface IApiSoapRunResult {
  type: 'success' | 'error';
}

export interface IApiSoapRunSuccess extends IApiSoapRunResult {
  type: 'success';
  data: unknown;
}

export interface IApiSoapRunError extends IApiSoapRunResult {
  type: 'error';
  reason: string;
  error: Error;
}


export async function runSoapApi(api: IApiVersion): Promise<IApiSoapRunSuccess | IApiSoapRunError> {

  console.log(api);

  return {
    type: 'error',
    reason: 'not implemented',
    error: new Error('not implemented')
  };

}
