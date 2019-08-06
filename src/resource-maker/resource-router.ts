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
    response.json(await controller.listAll({ latest: !!request.body.latest }));
  });

  return ResourceRouter;

}
