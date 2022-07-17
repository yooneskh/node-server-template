import { IApiHttpBodySchema, IApiVersion } from '../api-interfaces';
import { YNetwork } from 'ynetwork';
import { InvalidRequestError, ServerError } from '../../../global/errors';
import Handlebars from 'handlebars';


export interface IApiHttpRunPayload {
  headers?: Record<string, string>;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: unknown;
}

export interface IApiSoapRunPayload {
  typeOfAction?:  Record<string, string>;
  input? : Record<string, string>;
}


export interface IApiHttpRunResult {
  type: 'success' | 'error';
}

export interface IApiHttpRunSuccess extends IApiHttpRunResult {
  type: 'success';
  status: number;
  data: unknown;
  headers: Record<string, string>;
  latency: number;
}

export interface IApiHttpRunError extends IApiHttpRunResult {
  type: 'error';
  reason: string;
  error: Error;
}


function isEmpty(value: unknown) {
  return value === undefined || value === null || value === '';
}

function validatePayloadBody(payload: unknown, schema: IApiHttpBodySchema) {
  switch (schema.type) {
    case 'boolean': if (typeof payload !== 'boolean') throw new InvalidRequestError(`type of "${JSON.stringify(payload)}" should be boolean.`, `نوع ورودی "${JSON.stringify(payload)}" باید boolean باشد.`); break;
    case 'number': if (typeof payload !== 'number') throw new InvalidRequestError(`type of "${JSON.stringify(payload)}" should be number.`, `نوع ورودی "${JSON.stringify(payload)}" باید number باشد.`); break;
    case 'string': if (typeof payload !== 'string') throw new InvalidRequestError(`type of "${JSON.stringify(payload)}" should be string.`, `نوع ورودی "${JSON.stringify(payload)}" باید string باشد.`); break;
    case 'array': {

      if (!Array.isArray(payload)) {
        throw new InvalidRequestError(`type of "${JSON.stringify(payload)}" should be array.`, `نوع ورودی "${JSON.stringify(payload)}" باید array باشد.`);
      }

      for (const child of payload) {
        if (typeof child !== schema.subtype!) {
          throw new InvalidRequestError(`type of "${JSON.stringify(child)}" should be ${schema.subtype}.`, `نوع ورودی "${JSON.stringify(child)}" باید ${schema.subtype} باشد.`);
        }
      }

      break;

    }
    case 'object': {
      if (typeof payload !== 'object' || !payload) {
        throw new InvalidRequestError(`type of "${JSON.stringify(payload)}" should be object.`, `نوع ورودی "${JSON.stringify(payload)}" باید object باشد.`);
      }

      for (const child of schema.children || []) {

        if (!( child.key in payload )) {
          throw new InvalidRequestError(`"${child.key}" must exist in "${JSON.stringify(payload)}".`, `کلید "${child.key}" باید در "${JSON.stringify(payload)}" باشد.`);
        }

        // tslint:disable-next-line: no-any
        validatePayloadBody((payload as any)[child.key], child);

      }

      break;

    }
    default: throw new ServerError('body type validation not immplemented.');
  }
}

export function validateHttpApiPayload(api: IApiVersion, payload?: IApiHttpRunPayload): void {

  if (api.headers && api.headers.length > 0) {
    if (!payload?.headers) throw new InvalidRequestError('headers not given.', 'مقداری برای Header ارسال نشده است.');

    for (const header of api.headers) {
      if (isEmpty(payload.headers[header.key])) {
        throw new InvalidRequestError(`invalid value for header "${header.key}": "${payload.headers[header.key]}"`, `مقدار نامناسب برای Header "${header.key}": "${payload.headers[header.key]}"`);
      }
    }

  }

  if (api.queryParams && api.queryParams.length > 0) {
    if (!payload?.queryParams) throw new InvalidRequestError('queryParams not given.', 'مقداری برای Query Param ارسال نشده است.');

    for (const param of api.queryParams) {
      if (isEmpty(payload.queryParams[param.key])) {
        throw new InvalidRequestError(`invalid value for queryParam "${param.key}": "${payload.queryParams[param.key]}"`, `مقدار نامناسب برای Query Param "${param.key}": "${payload.queryParams[param.key]}"`);
      }
    }

  }

  if (api.pathParams && api.pathParams.length > 0) {
    if (!payload?.pathParams) throw new InvalidRequestError('pathParams not given.', 'مقداری برای Path Param ارسال نشده است.');

    for (const param of api.pathParams) {
      if (isEmpty(payload.pathParams[param.key])) {
        throw new InvalidRequestError(`invalid value for pathParam "${param.key}": "${payload.pathParams[param.key]}"`, `مقدار نامناسب برای Path Param "${param.key}": "${payload.pathParams[param.key]}"`);
      }
    }

  }

  if (api.hasBody) {
    validatePayloadBody(payload?.body, api.bodySchema!);
  }

}


export async function runHttpApi(api: IApiVersion, payload?: IApiHttpRunPayload): Promise<IApiHttpRunSuccess | IApiHttpRunError> {

  try {
    validateHttpApiPayload(api, payload);
  }
  catch (error: any) {
    return {
      type: 'error',
      reason: error.responseMessage || error.message,
      error
    };
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

  const requestHeaders = payload?.headers ?? {};

  if (api.staticHeaders) {
    for (const header of api.staticHeaders ?? []) {
      requestHeaders[header.key] = header.value;
    }
  }

  const timeBegin = Date.now();
  const { headers, status, data } = await YNetwork[api.method!.toLowerCase()](url, payload?.body, requestHeaders);
  const timeEnd = Date.now();

  if (!( status > 0 )) {
    return {
      type: 'error',
      reason: data,
      error: new Error(data)
    };
  }

  return {
    type: 'success',
    headers,
    status,
    data,
    latency: timeEnd - timeBegin
  };

}


const myunescape = (alteredString:any) => alteredString.replace(/&amp;/g , '&').replace(/&lt;/g  , '<').replace(/&gt;/g  , '>');

export async function runSoapApi(api: IApiVersion, payload?: IApiHttpRunPayload): Promise<IApiHttpRunSuccess | IApiHttpRunError> {

  try {
    validateHttpApiPayload(api, payload);
  }
  catch (error: any) {
    return {
      type: 'error',
      reason: error.responseMessage || error.message,
      error
    };
  }

  var templateScript = Handlebars.compile(myunescape(api.soapBody));
  var body = templateScript(payload?.body);

  const requestHeaders = {
    "Content-Type": "text/xml",
    ...(payload?.headers ?? {})
  } as Record<string, string>;

  if (api.staticHeaders) {
    for (const header of api.staticHeaders ?? []) {
      requestHeaders[header.key] = header.value;
    }
  }

  const timeBegin = Date.now();
  const { headers, status, data } = await YNetwork["post"](api.url, body, requestHeaders);
  const timeEnd = Date.now();

  if (!( status > 0 )) {
    return {
      type: 'error',
      reason: data,
      error: new Error(data)
    };
  }

  return {
    type: 'success',
    headers,
    status,
    data,
    latency: timeEnd - timeBegin
  };

}