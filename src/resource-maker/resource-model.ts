import { ResourceOptions, ResourceProperty, ResourceRelation } from './resource-maker-types';
import { Document, model, Schema } from 'mongoose';
import { simplePascalize } from '../global/util';
import { ServerError } from '../global/errors';

// tslint:disable-next-line: no-any
function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    default: throw new ServerError(`resource property type unknown: ${propertyType}`);
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

    if ('ref' in property) scheme.ref = property.ref;
    if ('default' in property) scheme.default = property.default;
    if ('required' in property) scheme.required = property.required;
    if ('unique' in property) scheme.unique = property.unique;
    if ('select' in property) scheme.select = property.select;

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
