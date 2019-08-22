import { ResourceOptions } from './resource-maker-types';
import { Document } from 'mongoose';
import { ResourceController } from './resource-controller';
import { makeResourceRouter } from './resource-router';
import { makeModelForResource } from './resource-model';
import { ResourceRelationController } from './resource-relation-controller';

export function makeResource<T extends Document>(options: ResourceOptions) {

  const { mainModel: resourceModel, relationModels } = makeModelForResource<T>(options);

  const resourceController = new ResourceController<T>(resourceModel, options);

  const relationControllers = relationModels.map((relationModel, index) =>
    new ResourceRelationController(options.name, (options.relations || [])[index].targetModelName, relationModel)
  );

  const resourceRouter = makeResourceRouter<T>({
    resourceActions: options.actions,
    controller: resourceController,
    relations: (options.relations || []).map((relation, index) => ({
      targetModelName: relation.targetModelName,
      relationModelName: relation.relationModelName,
      controller: relationControllers[index],
      actions: relation.actions
    }))
  });

  return {
    model: resourceModel,
    controller: resourceController,
    router: resourceRouter
  };

}
