import { ResourceProperty, ResourcePropertyMeta, ResourceRelation, IResource } from './resource-maker-types';
import { Model } from 'mongoose';
import { makeMainResourceModel, makeResourceRelationModel } from './resource-model';
import { ServerError } from '../global/errors';
import { ResourceController } from './resource-controller';
import { ResourceRelationController } from './resource-relation-controller';
import { Router } from 'express';

export class ResourceMaker<T extends IResource> {

  private resourceName = '';
  private resourceProperties: ResourceProperty[] = [];
  private resourceMetas: ResourcePropertyMeta[] = [];
  private resourceRelations: ResourceRelation[] = [];

  private resourceModel?: Model<T>;
  private resourceRelationModels: Model<IResource>[] = [];

  private resourceController?: ResourceController<T>;
  private resourceRelationControllers: ResourceRelationController<IResource>[] = [];

  private resourceRouter?: Router;

  constructor(name: string) {
    this.resourceName = name;
  }

  public setProperties(properties: ResourceProperty[]) {

    this.resourceProperties = properties;

    this.resourceModel = makeMainResourceModel<T>(this.resourceName, this.resourceProperties);

    return this.resourceModel;

  }

  public setMetas(metas: ResourcePropertyMeta[]) {
    this.resourceMetas = metas;
  }

  public addRelation<P extends IResource>(relation: ResourceRelation) {

    this.resourceRelations.push(relation);

    const relationModel = makeResourceRelationModel<P>(this.resourceName, relation);
    this.resourceRelationModels.push(relationModel);

    const relationController = new ResourceRelationController<P>(this.resourceName, relation.targetModelName, relationModel, relation);
    this.resourceRelationControllers.push(relationController);

    return {
      model: relationModel,
      controller: relationController
    };

  }

  public getModel() {

    if (!this.resourceModel) {
      throw new ServerError(`model is not yet made for ${this.resourceName}!`);
    }

    return this.resourceModel;

  }

  public getRelationModels() {
    return this.resourceRelationModels;
  }

  public getController() {

    if (this.resourceModel === undefined) {
      throw new ServerError('model not made for ' + this.resourceName);
    }

    this.resourceController = new ResourceController<T>(this.resourceModel, this.resourceProperties);

    return this.resourceController;

  }

  public getRelationControllers() {
    return this.resourceRelationControllers;
  }

  public getRouter() {

    // this.resourceRouter = 'adsfasdf'; // TODO: this is next step!

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
