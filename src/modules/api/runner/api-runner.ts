import { InvalidRequestError } from '../../../global/errors';
import { IApiRunAdditionalInfo, IApiVersion } from '../api-interfaces';
import { ApiLogController } from '../api-log-resource';
import { IApiHttpRunError, IApiHttpRunPayload, IApiHttpRunSuccess, runHttpApi } from './api-http-runner';


function calculateDataSize(data: unknown | undefined): number | undefined {
  if (data === undefined) return undefined;

  if (typeof data === 'string') return data.length;
  return JSON.stringify(data).length;

}


export async function runApi(api: IApiVersion, payload?: IApiHttpRunPayload, info?: IApiRunAdditionalInfo) {

  if (api.type === 'http') {

    const timeBegin = Date.now();
    const result = await runHttpApi(api, payload as IApiHttpRunPayload);
    const timeEnd = Date.now();

    await ApiLogController.create({
      payload: {
        api: api._id,
        apiType: api.type,
        success: result.type === 'success',
        startAt: timeBegin,
        endAt: timeEnd,
        totalTime: timeEnd - timeBegin,
        callerIP: info?.ip,
        requestMethod: api.method,
        requestUrl: api.url,
        requestHeaders: payload?.headers,
        requestQueryParams: payload?.queryParams,
        requestPathParams: payload?.pathParams,
        requestBody: payload?.body,
        requestBodySize: payload?.body ? JSON.stringify(payload.body).length : undefined,
        responseHeaders: (result as IApiHttpRunSuccess).headers,
        responseStatus: (result as IApiHttpRunSuccess).status,
        responseSize: calculateDataSize((result as IApiHttpRunSuccess).data),
        responseLatency: (result as IApiHttpRunSuccess).latency,
        errorMessage: (result as IApiHttpRunError).reason
      }
    });

    if (result.type === 'error') {
      throw result.error;
    }

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
