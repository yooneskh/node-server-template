import { InvalidRequestError , InvalidRequestTimeRange } from '../../../global/errors';
import { IApiLogBase, IApiPermit, IApiRunAdditionalInfo, IApiVersion } from '../api-interfaces';
import { ApiLogController } from '../api-log-resource';
import { IApiHttpRunError, IApiHttpRunPayload, IApiHttpRunSuccess, runHttpApi , runSoapApi } from './api-http-runner';
import { examineApiPolicy } from './api-policy-examiner';


function calculateDataSize(data: unknown | undefined): number | undefined {
  if (data === undefined) return undefined;

  if (typeof data === 'string') return data.length;
  return JSON.stringify(data).length;

}


export async function runApi(permit: IApiPermit, api: IApiVersion, payload?: IApiHttpRunPayload , info?: IApiRunAdditionalInfo, policyId?: string) {

  const policyLogs: Partial<IApiLogBase> = {};
  const policyHeaders: Record<string, unknown> = {};

  if (permit.validFromEnabled) {

    const epoch = new Date(`${permit!.validFromDay} ${permit!.validFromTime}`).getTime();

    if (epoch < Date.now()) {
      throw new InvalidRequestTimeRange('time range is not valid');
    }

  }

  if (permit.validToEnabled) {

    const epoch = new Date(`${permit!.validToDay} ${permit!.validToTime}`).getTime();

    if (epoch < Date.now()) {
      throw new InvalidRequestTimeRange('Timerange is not valid.');
    }

  }

  if (policyId) {

    const policyResult = await examineApiPolicy(permit, /* api, */ policyId);

    if (!policyResult.passed) {

      await ApiLogController.create({
        payload: {
          permit: permit._id,
          api: api._id,
          apiType: api.type,
          success: false,
          startAt: Date.now(),
          endAt: Date.now(),
          totalTime: 0,
          callerIP: info?.ip,
          requestMethod: api.method,
          requestUrl: api.url,
          requestHeaders: payload?.headers,
          requestQueryParams: payload?.queryParams,
          requestPathParams: payload?.pathParams,
          requestBody: payload?.body,
          requestBodySize: payload?.body ? JSON.stringify(payload.body).length : undefined,
          errorMessage: policyResult.error?.responseMessage ?? policyResult.error?.message,
          ...policyResult.logs
        }
      });

      policyResult.error!.responseHeaders = policyResult.headers;
      throw policyResult.error;

    }

    Object.assign(policyLogs, policyResult.logs);
    Object.assign(policyHeaders, policyResult.headers);

  }


  if (api.type === 'http') {

    const timeBegin = Date.now();
    const result = await runHttpApi(api, payload as IApiHttpRunPayload);
    const timeEnd = Date.now();

    await ApiLogController.create({
      payload: {
        permit: permit._id,
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
        errorMessage: (result as IApiHttpRunError).reason,
        ...policyLogs
      }
    });

    if (result.type === 'error') {
      throw result.error;
    }

    return {
      headers: { ...policyHeaders, ...result.headers },
      status: result.status,
      data: result.data,
      latency: result.latency
    };

  }
  else if(api.type === 'soap') {

    const timeBegin = Date.now();
    const result = await runSoapApi(api, payload as IApiHttpRunPayload);
    const timeEnd = Date.now();

    await ApiLogController.create({
      payload: {
        permit: permit._id,
        api: api._id,
        apiType: api.type,
        success: result.type === 'success',
        startAt: timeBegin,
        endAt: timeEnd,
        totalTime: timeEnd - timeBegin,
        callerIP: info?.ip,
        requestUrl: api.url,
        requestBody: payload?.body,
        requestBodySize: payload?.body ? JSON.stringify(payload.body).length : undefined,
        responseHeaders: (result as IApiHttpRunSuccess).headers,
        responseStatus: (result as IApiHttpRunSuccess).status,
        responseSize: calculateDataSize((result as IApiHttpRunSuccess).data),
        responseLatency: (result as IApiHttpRunSuccess).latency,
        errorMessage: (result as IApiHttpRunError).reason,
        ...policyLogs
      }
    });

    if (result.type === 'error') {
      throw result.error;
    }

    return {
      headers: { ...policyHeaders, ...result.headers },
      status: result.status,
      data: result.data,
      latency: result.latency
    };
  }
  else {
    throw new InvalidRequestError('api type cannot be processed.');
  }

}
