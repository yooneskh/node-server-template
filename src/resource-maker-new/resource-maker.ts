import { ResourceProperty, ResourcePropertyMeta, ResourceRelation } from './resource-maker-types';
import { Model, Document } from 'mongoose';
import { makeMainResourceModel, makeResourceRelationModel } from './resource-model';
import { ServerError } from '../global/errors';
import { ResourceController } from './resource-controller';

export class ResourceMaker<T extends Document> {

  private resourceName = '';
  private resourceProperties: ResourceProperty[] = [];
  private resourceMetas: ResourcePropertyMeta[] = [];
  private resourceRelations: ResourceRelation[] = [];

  private resourceModel?: Model<T>;
  private resourceRelationModels: Model<Document>[] = [];

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

  public addRelation<P extends Document>(relation: ResourceRelation) {

    this.resourceRelations.push(relation);

    const relationModel = makeResourceRelationModel<P>(this.resourceName, relation);

    this.resourceRelationModels.push(relationModel);

    return relationModel;

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

    const controller = new ResourceController<T>(this.resourceModel, this.resourceProperties);

    // TODO: here ...

  }

}
