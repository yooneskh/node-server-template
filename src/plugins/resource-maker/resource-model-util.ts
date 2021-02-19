import { ResourceModelProperty } from './resource-model-types';
import { ServerError } from '../../global/errors';
import { Schema } from 'mongoose';

// tslint:disable: no-any
export function makeSchemaOptions(properties: ResourceModelProperty[]) {
  const schemaOptions: Record<string, any> = {};

  for (const property of properties) {

    if (property.type === 'series') {
      if (!property.serieSchema) throw new ServerError('series property does not have schema');
      schemaOptions[property.key] = [makeSchemaOptions(property.serieSchema)];
      continue;
    }

    let scheme: Record<string, any> = {};

    scheme.type = mapPropertyTypeToMongooseType(property.type)

    if (property.ref !== undefined) scheme.ref = property.ref;
    if (property.default !== undefined) scheme.default = property.default;
    if (property.required !== undefined) scheme.required = property.required;
    if (property.unique !== undefined) scheme.unique = property.unique;
    if (property.select !== undefined) scheme.select = property.select;
    if (property.enum !== undefined) scheme.enum = property.enum;

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

function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    case 'object': return Object;
    case 'any': return Schema.Types.Mixed;
    case 'series': throw new ServerError('code should not reach here');
    default: throw new ServerError(`resource property type unknown: ${propertyType}`);
  }
}
