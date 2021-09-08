import { ResourceModelProperty, CompoundIndex, IResourceDocument } from './resource-model-types';
import { ServerError } from '../../global/errors';
import { Schema, model, Model } from 'mongoose';
import { makeSchemaOptions } from './resource-model-util';

export class ResourceModel<TF extends IResourceDocument> {

  private properties: ResourceModelProperty[] = [];
  private model?: Model<TF>;
  private compoundIndexes?: CompoundIndex[];

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

  public setCompoundIndexes(indexes: CompoundIndex[]) {
    this.compoundIndexes = indexes;
  }

  public getModel() {
    if (this.model !== undefined) return this.model;

    const schema = this.makeSchema();

    if (this.compoundIndexes && this.compoundIndexes.length > 0) {
      for (const index of this.compoundIndexes) {
        schema.index(index.indexes, index.options)
      }
    }

    this.model = model<TF>(this.name, schema);
    return this.model;

  }

}
