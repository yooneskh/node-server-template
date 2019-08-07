import { Router } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';
import { sanitizeRequestFormat } from '../global/sanitizers';

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
      response.json(await controller.listAll({
        latest: !!request.body.latest
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
