import { ResourceOptions, ResourceProperty, ResourceRelation } from './resource-maker.types';
import { Document, model, Schema } from 'mongoose';
import { simplePascalize } from '../global/util';

// tslint:disable-next-line: no-any
function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    default: throw new Error(`resource property type unknown: ${propertyType}`);
  }
}

// tslint:disable-next-line: no-any
function makeSchemaOptionsFromPropertise(properties: ResourceProperty[]): Record<string, any> {

  // tslint:disable-next-line: no-any
  const schemaOptions: Record<string, any> = {};

  for (const property of properties) {

    // tslint:disable-next-line: no-any
    const scheme: Record<string, any> = {};

    scheme.type = mapPropertyTypeToMongooseType(property.type)

    if (property.ref) scheme.ref = property.ref;
    if (property.default) scheme.default = property.default;

    schemaOptions[property.key] = scheme;

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

function makeSchemaFromPropertise(properties: ResourceProperty[]): Schema {
  return new Schema(makeSchemaOptionsFromPropertise(properties));
}

function makeRelationSchemas(resourceName: string, relations: ResourceRelation[]) {

  const result = [];

  for (const relation of relations) {

    const schemeOptions = makeSchemaOptionsFromPropertise(relation.properties || []);

    schemeOptions[resourceName.toLowerCase()] = {
      type: String,
      ref: resourceName,
      required: true
    }

    schemeOptions[relation.targetModelName.toLowerCase()] = {
      type: String,
      ref: relation.targetModelName,
      required: true
    }

    result.push(new Schema(schemeOptions));

  }

  return result;

}

export function makeModelForResource<T extends Document>(options: ResourceOptions) {

  const mainSchema = makeSchemaFromPropertise(options.properties);

  const relationSchemas = makeRelationSchemas(options.name, options.relations || []);

  const relationModels = relationSchemas.map((schema, index) => {

    const relation = (options.relations || [])[index];

    if (!relation) throw new Error('more relation schemas than relation options! (wth?)');

    const relationName = relation.relationModelName || simplePascalize([options.name, relation.targetModelName, 'Relation']);

    return model(relationName, schema);

  });

  return {
    mainModel: model<T>(options.name, mainSchema),
    relationModels
  };

}
