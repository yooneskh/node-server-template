import { ResourceOptions } from './resource-maker-types';
import { Document } from 'mongoose';
import { ResourceController } from './resource-controller';
import { scaffoldResourceRouter } from './resource-router';
import { makeModelForResource } from './resource-model';
import { ResourceRelationController } from './resource-relation-controller';

export function makeResourceModel<T extends Document>(options: ResourceOptions) {
  return makeModelForResource<T>(options);
}

// tslint:disable-next-line: no-any
export function makeResourceController<T extends Document>(options: ResourceOptions, resourceModel: any, relationModels: any[]) {
  return {
    resourceController: new ResourceController<T>(resourceModel, options),
    relationControllers: relationModels.map((model, index) =>
      new ResourceRelationController(options.name, (options.relations || [])[index].targetModelName, model, (options.relations || [])[index])
    )
  }
}

// tslint:disable-next-line: no-any
export function makeResourceRouter<T extends Document>(options: ResourceOptions, resourceController: any, relationControllers: any[]) {
  return scaffoldResourceRouter<T>({
    resourceActions: options.actions,
    controller: resourceController,
    relations: (options.relations || []).map((relation, index) => ({
      targetModelName: relation.targetModelName,
      relationModelName: relation.relationModelName,
      controller: relationControllers[index],
      actions: relation.actions
    }))
  });
}

export function makeResource<T extends Document>(options: ResourceOptions) {

  const { mainModel: resourceModel, relationModels } = makeModelForResource<T>(options);

  const { resourceController, relationControllers } = makeResourceController<T>(options, resourceModel, relationModels);

  const resourceRouter = makeResourceRouter<T>(options, resourceController, relationControllers);

  return {
    model: resourceModel,
    controller: resourceController,
    router: resourceRouter
  };

}
