import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { DISMISS_DATA_PROVIDER } from '../../plugins/resource-maker/resource-router';
import { ApiPermitController } from './api-permit-resource';
import { ApiVersionController } from './api-version-resource';
import { runApi } from './runner/api-runner';


const maker = new ResourceMaker('ApiGateway');


maker.addAction({
  method: 'POST',
  path: '/:identifier/:apiVersion',
  signal: ['Route', 'ApiGateway', 'Execute'],
  rateLimitOptions: undefined,
  dataProvider: async ({ params: { identifier, apiVersion: version }, payload, request, response }) => {

    const permit = await ApiPermitController.findOne({
      filters: {
        identifier
      }
    });

    const apiVersion = await ApiVersionController.findOne({
      filters: {
        endpoint: permit.apiEndpoint,
        version,
      }
    });


    const { status, data, headers, latency } = await runApi({
      permit,
      api: apiVersion,
      payload,
      info: {
        ip: request.ip,
      },
      policyId: permit.policy,
      providedKey: request.headers['api-key'] as string | undefined,
    });

    for (const header of Object.keys(headers)) {
      response.setHeader(header, String(headers[header]));
    }

    response.setHeader('x-opendata-latency', String(latency));

    response.status(status).send(data);
    return DISMISS_DATA_PROVIDER;

  }
});


export const ApiGatewayRouter = maker.getRouter();
