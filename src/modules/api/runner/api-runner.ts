import { ForbiddenAccessError, InvalidRequestError , InvalidRequestTimeRange, InvalidStateError } from '../../../global/errors';
import { IApiLogBase, IApiPermit, IApiRunAdditionalInfo, IApiVersion } from '../api-interfaces';
import { ApiLogController } from '../api-log-resource';
import { IApiHttpRunError, IApiHttpRunPayload, IApiHttpRunSuccess, runHttpApi , runSoapApi } from './api-http-runner';
import { examineApiPolicy } from './api-policy-examiner';


function calculateDataSize(data: unknown | undefined): number | undefined {
  if (data === undefined) return undefined;

  if (typeof data === 'string') return data.length;
  return JSON.stringify(data).length;

}


export interface IRunApi {
  permit: IApiPermit;
  api: IApiVersion;
  payload?: IApiHttpRunPayload;
  info?: IApiRunAdditionalInfo;
  policyId?: string;
  providedKey?: string;
}

export async function runApi({ permit, api, payload, info, policyId, providedKey }: IRunApi) {

  const policyLogs: Partial<IApiLogBase> = {};
  const policyHeaders: Record<string, unknown> = {};

  const usualLog = {
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
  };


  if (!providedKey) {

    await ApiLogController.create({
      payload: {
        ...usualLog,
        errorMessage: 'مقداری برای Api Key ارسال نشده است',
      }
    });

    throw new ForbiddenAccessError('api key not provided', 'مقداری برای Api Key ارسال نشده است.');

  }

  if (providedKey !== permit.apiKey) {

    await ApiLogController.create({
      payload: {
        ...usualLog,
        errorMessage: 'مقدار Api Key صحیح نیست.',
      }
    });

    throw new ForbiddenAccessError('invalid api key', 'مقدار Api Key صحیح نیست..');

  }

  if (!permit.enabled) {

    await ApiLogController.create({
      payload: {
        ...usualLog,
        errorMessage: 'مجوز فعال نیست',
      }
    });

    throw new InvalidStateError('api permit not enabled.', 'مجوز فعال نیست.');

  }

  if (api.disabled) {

    await ApiLogController.create({
      payload: {
        ...usualLog,
        errorMessage: api.disabledMessage || 'این Api عیر فعال شده است.',
      }
    });

    throw new InvalidStateError('api version is disabled.', api.disabledMessage || 'این Api عیر فعال شده است.');

  }

  if (permit.blocked) {

    await ApiLogController.create({
      payload: {
        ...usualLog,
        errorMessage: `مجوز مسدود شده: ${permit.blockageReason}`,
      }
    });

    throw new InvalidStateError(`api permit blocked at ${permit.blockedAt} because: ${permit.blockageReason}`, `مجوز مسدود شده: ${permit.blockageReason}`);

  }

  if (permit.validFromEnabled) {

    const epoch = new Date(`${permit!.validFromDay} ${permit!.validFromTime}`).getTime();

    if (epoch > Date.now()) {

      await ApiLogController.create({
        payload: {
          ...usualLog,
          errorMessage: 'زمان شروع استفاده از این مجوز هنوز نرسیده است',
        }
      });

      throw new InvalidRequestTimeRange('time range is not valid');

    }

  }

  if (permit.validToEnabled) {

    const epoch = new Date(`${permit!.validToDay} ${permit!.validToTime}`).getTime();

    if (epoch < Date.now()) {

      await ApiLogController.create({
        payload: {
          ...usualLog,
          errorMessage: 'زمان استفاده از این مجوز به پایان رسیده است',
        }
      });

      throw new InvalidRequestTimeRange('time range is not valid.');

    }

  }

  if (policyId) {

    const policyResult = await examineApiPolicy(permit, policyId);

    if (!policyResult.passed) {

      await ApiLogController.create({
        payload: {
          ...usualLog,
          errorMessage: policyResult.error?.responseMessage ?? policyResult.error?.message,
          ...policyResult.logs
        },
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
        ...usualLog,
        success: result.type === 'success',
        startAt: timeBegin,
        endAt: timeEnd,
        totalTime: timeEnd - timeBegin,
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
        ...usualLog,
        success: result.type === 'success',
        startAt: timeBegin,
        endAt: timeEnd,
        totalTime: timeEnd - timeBegin,
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
