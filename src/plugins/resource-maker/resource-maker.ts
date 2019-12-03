import { ResourceProperty, ResourcePropertyMeta, ResourceRelation, IResource, ResourceAction } from './resource-maker-types';
import { Model } from 'mongoose';
import { makeMainResourceModel, makeResourceRelationModel } from './resource-model';
import { ServerError } from '../../global/errors';
import { ResourceController } from './resource-controller';
import { ResourceRelationController } from './resource-relation-controller';
import { Router } from 'express';
import { scaffoldResourceRouter, IRouterRelation } from './resource-router';

export class ResourceMaker<T extends IResource> {

  private name = '';
  private properties: ResourceProperty[] = [];
  private metas: ResourcePropertyMeta[] = [];
  private relations: ResourceRelation[] = [];
  private actions: ResourceAction[] = [];

  private model?: Model<T>;
  private relationModels: Model<IResource>[] = [];

  private controller?: ResourceController<T>;
  private relationControllers: ResourceRelationController<IResource>[] = [];

  private router?: Router;

  constructor(name: string) {
    this.name = name;
  }

  public getName() {
    return this.name;
  }

  public setProperties(properties: ResourceProperty[]) {

    this.properties = properties;

    this.model = makeMainResourceModel<T>(this.name, this.properties);

    return this.model;

  }

  public getProperties() {
    return this.properties;
  }

  public setMetas(metas: ResourcePropertyMeta[]) {
    this.metas = metas;
  }

  public addRelation<P extends IResource>(relation: ResourceRelation) {

    this.relations.push(relation);

    const relationModel = makeResourceRelationModel<P>(this.name, relation);
    this.relationModels.push(relationModel);

    const relationController = new ResourceRelationController<P>(this.name, relation.targetModelName, relationModel, relation);
    this.relationControllers.push(relationController);

    return {
      model: relationModel,
      controller: relationController
    };

  }

  public getModel() {

    if (!this.model) {
      throw new ServerError(`properties not set yet for ${this.name}!`);
    }

    return this.model;

  }

  public getRelationModels() {
    return this.relationModels;
  }

  public getController() {

    if (this.model === undefined) {
      throw new ServerError(`model not made for ${this.name}`);
    }

    this.controller = new ResourceController<T>(this.model, this.properties);

    return this.controller;

  }

  public setController(controller: ResourceController<T>) {
    this.controller = controller;
  }

  public getRelationControllers() {
    return this.relationControllers;
  }

  public addAction(action: ResourceAction) {
    this.actions.push(action);
  }

  public addActions(actions: ResourceAction[]) {
    actions.map(action => this.addAction(action));
  }

  public getRouter() {

    const routerRelations: IRouterRelation[] = this.relations.map((relation, index) => ({
      targetModelName: relation.targetModelName,
      relationModelName: relation.relationModelName,
      controller: this.relationControllers[index],
      actions: relation.actions
    }));

    this.router = scaffoldResourceRouter(this.actions, routerRelations, this.properties, this.metas, this.controller)

    return this.router;

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
