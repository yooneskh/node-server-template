import { IApiVersion } from '../api-interfaces';
import YNetwork from 'ynetwork';


export interface IApiHttpRunResult {
  type: 'success' | 'error';
}

export interface IApiHttpRunSuccess extends IApiHttpRunResult {
  type: 'success';
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export interface IApiHttpRunError extends IApiHttpRunResult {
  type: 'error';
  reason: string;
  error: Error;
}


export async function runHttpApi(api: IApiVersion): Promise<IApiHttpRunSuccess | IApiHttpRunError> {

  const { headers, status, result } = await YNetwork[api.method!.toLowerCase()](api.url!); // todo: this only handles GET, handle others

  if (status && status !== -1) {
    return {
      type: 'success',
      headers,
      status,
      data: result
    };
  }

  return {
    type: 'error',
    reason: 'not implemented',
    error: new Error('not implemented')
  };

}
