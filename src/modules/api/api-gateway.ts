import { ForbiddenAccessError, InvalidStateError } from '../../global/errors';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import { ApiEndpointController } from './api-endpoint-resource';
import { IApiPermit } from './api-interfaces';
import { ApiPermitController } from './api-permit-resource';
import { ApiVersionController } from './api-version-resource';
import { runApi } from './runner/api-runner';


const maker = new ResourceMaker('ApiGateway');


maker.addAction({
  method: 'POST',
  path: '/:identifier/:apiVersion',
  signal: ['Route', 'ApiGateway', 'Execute'],
  rateLimitOptions: undefined,
  permissionFunction: async ({ params: { identifier }, request, bag }) => {

    const permit = await ApiPermitController.findOne({
      filters: {
        identifier
      }
    });

    if (!request.headers['api-key']) {
      throw new ForbiddenAccessError('ApiKey not provided', 'مقداری برای Api Key ارسال نشده است.');
    }

    if (request.headers['api-key'] !== permit.apiKey) {
      throw new ForbiddenAccessError('Invalid Api Key', 'مقدار Api Key صحیح نیست.');
    }

    bag.permit = permit;
    return true;

  },
  stateValidator: async ({ bag }) => {

    const permit = bag.permit as IApiPermit;

    const apiEndpoint = await ApiEndpointController.retrieve({ resourceId: permit.apiEndpoint });

    if (apiEndpoint.disabled) {
      throw new InvalidStateError('این Api فعال نیست.');
    }


    if (!permit.enabled) {
      throw new InvalidStateError('Api Permit not enabled.', 'مجوز شما فعال نیست.');
    }

    if (permit.blocked) {
      throw new InvalidStateError(`Api Permit blocked: "${permit.blockageReason}" at ${new Date(permit.blockedAt!)}`, `${permit.blockageReason}`);
    }

  },
  dataProvider: async ({ params: { apiVersion: version }, bag, payload, request, response }) => {

    const permit = bag.permit as IApiPermit;

    const apiVersion = await ApiVersionController.findOne({
      filters: {
        endpoint: permit.apiEndpoint,
        version: parseInt(version, 10)
      }
    });


    if (apiVersion.disabled) {
      return apiVersion.disabledMessage || 'این Api غیر فعال شده است.';
    }

    const { status, data, headers, latency } = await runApi(
      permit,
      apiVersion,
      payload,
      {
        ip: request.ip
      },
      permit.policy
    );

    for (const header of Object.keys(headers)) {
      response.setHeader(header, String(headers[header]));
    }

    response.setHeader('x-opendata-latency', String(latency));

    response.status(status).send(data);
    return DISMISS_DATA_PROVIDER;

  }
});


export const ApiGatewayRouter = maker.getRouter();
