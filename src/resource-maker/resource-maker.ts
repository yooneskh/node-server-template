import { ResourceOptions } from './resource-maker.types';
import { Document } from 'mongoose';
import { ResourceController } from './resource-controller';
import { makeResourceRouter } from './resource-router';
import { makeModelForResource } from './resource-model';


export function makeResource<T extends Document>(options: ResourceOptions) {

  const resourceModel = makeModelForResource<T>(options);

  const resourceController = new ResourceController<T>(resourceModel, options);

  const resourceRouter = makeResourceRouter<T>({
    resourceName: options.name,
    controller: resourceController
  });

  return {
    model: resourceModel,
    controller: resourceController,
    router: resourceRouter
  };

}
