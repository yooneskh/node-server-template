import { ResourceProperty, ResourceRelation } from './resource-maker-types';
import { Document, model, Schema } from 'mongoose';
import { simplePascalize } from '../global/util';
import { ServerError } from '../global/errors';

// tslint:disable-next-line: no-any
function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    case 'object': return Object;
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

function makeRelationSchema(resourceName: string, relation: ResourceRelation) {

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

  return new Schema(schemeOptions);

}

export function makeMainResourceModel<T extends Document>(name: string, properties: ResourceProperty[]) {
  return model<T>(
    name,
    new Schema(makeSchemaOptionsFromPropertise(properties))
  )
}

export function makeResourceRelationModel<T extends Document>(name: string, relation: ResourceRelation) {

  const schema = makeRelationSchema(name, relation);

  const relationName = relation.relationModelName || simplePascalize([name, relation.targetModelName, 'Relation']);

  return model<T>(relationName, schema);

}
