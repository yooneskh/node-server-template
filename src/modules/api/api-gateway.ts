import { ForbiddenAccessError, InvalidStateError } from '../../global/errors';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import { IApiPermit } from './api-interfaces';
import { ApiPermitController } from './api-permit-resource';
import { ApiVersionController } from './api-version-resource';
import { runApi } from './runner/api-runner';


const maker = new ResourceMaker('ApiGateway');


maker.addAction({
  method: 'POST',
  path: '/:identifier',
  signal: ['Route', 'ApiGateway', 'Execute'],
  stateValidator: async ({ params: { identifier }, request, bag }) => {

    const permit = await ApiPermitController.findOne({
      filters: { identifier }
    });

    if (!request.headers['api-key']) {
      throw new ForbiddenAccessError('ApiKey not provided', 'مقداری برای Api Key ارسال نشده است.');
    }

    if (request.headers['api-key'] !== permit.apiKey) {
      throw new ForbiddenAccessError('Invalid Api Key', 'مقدار Api Key صحیح نیست.');
    }

    if (!permit.enabled) {
      throw new InvalidStateError('Api Permit not enabled.', 'مجوز شما فعال نیست.');
    }

    if (permit.blocked) {
      throw new InvalidStateError(`Api Permit blocked: "${permit.blockageReason}" at ${new Date(permit.blockedAt!)}`, `${permit.blockageReason}`);
    }

    bag.permit = permit;

  },
  dataProvider: async ({ bag, payload, request, response }) => {

    const permit = bag.permit as IApiPermit;

    const apiVersion = await ApiVersionController.retrieve({ resourceId: permit.api });

    const { status, data, headers, latency } = await runApi(
      apiVersion,
      payload,
      {
        ip: request.ip
      }
    );

    for (const header in Object.keys(headers)) {
      response.setHeader(header, headers[header]);
    }

    response.setHeader('X-OPENDATA-LATENCY', String(latency));

    response.status(status).send(data);
    return DISMISS_DATA_PROVIDER;

  }
});


export const ApiGatewayRouter = maker.getRouter();
