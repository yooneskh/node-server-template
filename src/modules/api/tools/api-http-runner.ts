import { IApiVersion } from '../api-interfaces';
import YNetwork from 'ynetwork';
import { InvalidRequestError } from '../../../global/errors';


export interface IApiHttpRunPayload {
  headers?: Record<string, string>;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: unknown;
}

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

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

export function validateHttpApiPayload(api: IApiVersion, payload?: IApiHttpRunPayload): void {

  if (api.headers) {
    if (!payload?.headers) throw new InvalidRequestError('headers not given.', 'مقداری برای Header ارسال نشده است.');

    for (const header of api.headers) {
      if (isEmpty(payload.headers[header.key])) {
        throw new InvalidRequestError(`invalid value for header "${header.key}": "${payload.headers[header.key]}"`, `مقدار نامناسب برای Header "${header.key}": "${payload.headers[header.key]}"`);
      }
    }

  }

  if (api.queryParams) {
    if (!payload?.queryParams) throw new InvalidRequestError('queryParams not given.', 'مقداری برای Query Param ارسال نشده است.');

    for (const param of api.queryParams) {
      if (isEmpty(payload.queryParams[param.key])) {
        throw new InvalidRequestError(`invalid value for queryParam "${param.key}": "${payload.queryParams[param.key]}"`, `مقدار نامناسب برای Query Param "${param.key}": "${payload.queryParams[param.key]}"`);
      }
    }

  }

  if (api.pathParams) {
    if (!payload?.pathParams) throw new InvalidRequestError('pathParams not given.', 'مقداری برای Path Param ارسال نشده است.');

    for (const param of api.pathParams) {
      if (isEmpty(payload.pathParams[param.key])) {
        throw new InvalidRequestError(`invalid value for pathParam "${param.key}": "${payload.pathParams[param.key]}"`, `مقدار نامناسب برای Path Param "${param.key}": "${payload.pathParams[param.key]}"`);
      }
    }

  }

  // todo: validate body

}


export async function runHttpApi(api: IApiVersion, payload?: IApiHttpRunPayload): Promise<IApiHttpRunSuccess | IApiHttpRunError> {

  try {
    validateHttpApiPayload(api, payload);
  }
  catch (error) {
    return {
      type: 'error',
      reason: error.responseMessage || error.message,
      error
    }
  }

  let url = api.url!;

  if (payload) {

    if (payload.pathParams) {
      for (const param of Object.keys(payload.pathParams)) {
        url = url.replace(`{${param}}`, payload.pathParams[param]);
      }
    }

    if (payload.queryParams) {
      url = `${url}${url.includes('?') ? '&' : '?'}${ Object.keys(payload.queryParams).map(it => `${it}=${encodeURIComponent(payload.queryParams![it])}`).join('&') }`;
    }

  }

  const { headers, status, result } = await YNetwork[api.method!.toLowerCase()](url, payload?.body, payload?.headers);

  if (!( status > 0 )) {
    return {
      type: 'error',
      reason: result,
      error: new Error(result)
    };
  }

  return {
    type: 'success',
    headers,
    status,
    data: result
  };

}
