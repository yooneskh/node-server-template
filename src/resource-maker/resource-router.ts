import { Router } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';
import { sanitizeRequestFormat } from '../global/sanitizers';

function extractQueryObject(queryString: string): Record<string, string> {

  const result: Record<string, string> = {};

  if (!queryString) return result;

  const parts = queryString.split(',');

  for (const part of parts) {

    const [key, value] = part.split(':');

    if (!key || !value) throw new Error(`query object invalid at '${key}':'${value}'`);

    result[key] = value;

  }

  return result;

}

export function makeResourceRouter<T extends Document>(
  {
    resourceName,
    controller
  }: {
    resourceName: string,
    controller: ResourceController<T>
  }
): Router {

  const ResourceRouter = Router();

  ResourceRouter.get('/', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.list({
        filters: extractQueryObject(request.query.filters), // TODO: add operator func to filters
        sorts: extractQueryObject(request.query.sorts)
      }));
    });
  });

  ResourceRouter.post('/', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.createNew({
        payload: request.body.payload
      }));
    });
  });

  ResourceRouter.put('/:resourceId', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.editOne({
        id: request.params.resourceId,
        payload: request.body.payload
      }));
    });
  });

  ResourceRouter.delete('/:resourceId', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.deleteOne({
        id: request.params.resourceId
      }));
    });
  });

  return ResourceRouter;

}
