import { ResourceModelProperty } from './resource-model-types';
import { ServerError } from '../../global/errors';
import { Schema, model, Document } from 'mongoose';

// tslint:disable: no-any
export class ResourceModel<T> {

  private properties: ResourceModelProperty[] = [];

  constructor(private name: string) { }

  private mapPropertyTypeToMongooseType(propertyType: string): any {
    switch (propertyType) {
      case 'string': return String;
      case 'number': return Number;
      case 'boolean': return Boolean;
      case 'object': return Object;
      default: throw new ServerError(`resource property type unknown: ${propertyType}`);
    }
  }

  private makeSchemaOptions() {

    const schemaOptions: Record<string, any> = {};

    for (const property of this.properties) {

      let scheme: Record<string, any> = {};

      scheme.type = this.mapPropertyTypeToMongooseType(property.type)

      if (property.ref !== undefined) scheme.ref = property.ref;
      if (property.default !== undefined) scheme.default = property.default;
      if (property.required !== undefined) scheme.required = property.required;
      if (property.unique !== undefined) scheme.unique = property.unique;
      if (property.select !== undefined) scheme.select = property.select;

      if (property.languages) {

        const newScheme: Record<string, any> = {};

        for (const language in property.languages) {
          newScheme[language] = { ...scheme, ...property.languages[language] };
        }

        scheme = newScheme;

      }

      schemaOptions[property.key] = property.isArray ? [scheme] : scheme;

    }

    schemaOptions['__v'] = {
      type: Number,
      select: false
    };

    schemaOptions['createdAt'] = {
      type: Number,
      default: Date.now
    };

    schemaOptions['updatedAt'] = {
      type: Number,
      default: 0
    };

    return schemaOptions;

  }

  private makeSchema() {
    return new Schema(
      this.makeSchemaOptions(),
      {
        minimize: false
      }
    );
  }

  public addProperty(property: ResourceModelProperty) {

    if (this.properties.find(p => p.key === property.key)) throw new ServerError(`duplicate property key '${property.key}'`);

    this.properties.push(property);

  }

  public getModel() {
    return model<T & Document>(
      this.name,
      this.makeSchema()
    );
  }

}
