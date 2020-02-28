import { ResourceModelProperty, IResource } from './resource-model-types';
import { ServerError } from '../../global/errors';
import { Schema, model, Model } from 'mongoose';
import { makeSchemaOptions } from './resource-model-util';

// tslint:disable: no-any
export class ResourceModel<T extends IResource> {

  private properties: ResourceModelProperty[] = [];
  private model?: Model<T, {}> = undefined;

  constructor(private name: string) { }

  private makeSchema() {
    return new Schema( makeSchemaOptions(this.properties), { minimize: false } );
  }

  public addProperty(property: ResourceModelProperty) {
    if (this.model !== undefined) throw new ServerError('model is already made');
    if (this.properties.find(p => p.key === property.key)) throw new ServerError(`duplicate property key '${property.key}'`);

    this.properties.push(property);

  }

  public getProperties() {
    return this.properties;
  }

  public getModel() {

    if (this.model !== undefined) return this.model;

    this.model = model<T>(this.name, this.makeSchema());
    return this.model;

  }

}
