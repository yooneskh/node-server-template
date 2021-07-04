import { InvalidRequestError } from '../../../global/errors';
import { IApiVersion } from '../api-interfaces';
import { IApiHttpRunPayload, runHttpApi } from './api-http-runner';


export async function runApi(api: IApiVersion, payload?: IApiHttpRunPayload) {

  if (api.type === 'http') {

    // const timeBegin = Date.now();
    const result = await runHttpApi(api, payload as IApiHttpRunPayload);
    // const timeEnd = Date.now();

    if (result.type === 'error') {
      // todo: register api run error info
      throw result.error;
    }

    // todo: register api run success info

    return {
      headers: result.headers,
      status: result.status,
      data: result.data,
      latency: result.latency
    };

  }
  else {
    throw new InvalidRequestError('api type cannot be processed.');
  }

}
