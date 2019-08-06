import { Router } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';

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

  // const basePath = `/${resourceName.toLowerCase()}`;

  ResourceRouter.get('/', async (request, response) => {
    response.json(await controller.listAll({
      latest: !!request.body.latest
    }));
  });

  ResourceRouter.post('/', async (request, response) => {
    response.json(await controller.createNew({
      propertise: request.body.propertise
    }));
  });

  ResourceRouter.put('/:resourceId', async (request, response) => {
    response.json(await controller.editOne({
      id: request.params.resourceId,
      propertise: request.body.propertise
    }));
  });

  return ResourceRouter;

}
