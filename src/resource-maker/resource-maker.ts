import { ResourceOptions, ResourceProperty, ResourceAction, ResourceRelation, ResourcePropertyMeta } from './resource-maker-types';
import { Document, Model } from 'mongoose';
import { ResourceController } from './resource-controller';
import { scaffoldResourceRouter } from './resource-router';
import { makeModelForResource } from './resource-model';
import { ResourceRelationController } from './resource-relation-controller';
import { ServerError } from '../global/errors';
import { Router } from 'express';

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
    resourceProperties: options.properties,
    resourceMetas: options.metas || [],
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

export class ResourceMaker <T extends Document> {

  private options: ResourceOptions = { name: '', properties: [] };

  private resourceModel: Model<T> | undefined = undefined;
  private resourceRelationModels: Model<Document>[] = [];

  private resourceController:  ResourceController<T> | undefined;
  private relationControllers: ResourceRelationController[] = [];

  private resourceRouter: Router | undefined;

  constructor(name: string) {
    this.options.name = name;
  }

  public setProperties(properties: ResourceProperty[]) {
    this.options.properties = properties;
  }

  public setMetas(metas: ResourcePropertyMeta[]) {
    this.options.metas = metas;
  }

  public setRelations(relations: ResourceRelation[]) {
    this.options.relations = relations;
  }

  public addRelation(relation: ResourceRelation) {

    if (this.options.relations === undefined) {
      this.options.relations = [];
    }

    this.options.relations.push(relation);

  }

  public setActions(actions: ResourceAction[]) {
    this.options.actions = actions;
  }

  public addAction(action: ResourceAction) {

    if (this.options.actions === undefined) {
      this.options.actions = [];
    }

    this.options.actions.push(action);

  }

  public getModel() {

    if (this.options.properties.length === 0) {
      throw new ServerError('no property specified for ' + this.options.name);
    }

    if (this.resourceModel !== undefined) {
      throw new ServerError('model already made for ' + this.options.name);
    }

    const res = makeModelForResource<T>(this.options);

    this.resourceModel = res.mainModel;
    this.resourceRelationModels = res.relationModels;

    return this.resourceModel;

  }

  public getRelationModels() {

    if (this.resourceModel === undefined) {
      throw new ServerError('model not made for ' + this.options.name);
    }

    return this.resourceRelationModels;

  }

  public getController() {

    if (this.resourceModel === undefined) {
      throw new ServerError('model not made for ' + this.options.name);
    }

    const result = makeResourceController<T>(this.options, this.resourceModel, this.resourceRelationModels);

    this.resourceController = result.resourceController;
    this.relationControllers = result.relationControllers;

    return this.resourceController;

  }

  public getRelationControllers() {

    if (this.resourceController === undefined) {
      throw new ServerError('controller not made for ' + this.options.name);
    }

    return this.relationControllers;

  }

  public getRouter() {

    if (this.resourceController === undefined) {
      throw new ServerError('controller not made for ' + this.options.name);
    }

    this.resourceRouter = makeResourceRouter<T>(this.options, this.resourceController, this.relationControllers);

    return this.resourceRouter;

  }

  public getMC() {
    return {
      model: this.getModel(),
      controller: this.getController()
    }
  }

  public getMCR() {
    return {
      model: this.getModel(),
      controller: this.getController(),
      router: this.getRouter()
    }
  }

}
