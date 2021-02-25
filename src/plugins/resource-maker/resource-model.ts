import { ResourceModelProperty, IResource, CompoundIndex } from './resource-model-types';
import { ServerError } from '../../global/errors';
import { Schema, model, Model, Document } from 'mongoose';
import { makeSchemaOptions } from './resource-model-util';

export class ResourceModel<T extends IResource> {

  private properties: ResourceModelProperty[] = [];
  private model?: Model<T & Document, {}>;
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
        if (index.indexes) {
          // tslint:disable-next-line: no-any
          schema.index(index.indexes, index.options as Record<string, any>)
        }
        else {
          schema.index(index)
        }
      }
    }

    this.model = model<T & Document>(this.name, schema);
    return this.model;

  }

}
