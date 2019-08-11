import { ResourceOptions } from './resource-maker.types';
import { Document, model, Schema } from 'mongoose';


// tslint:disable-next-line: no-any
function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    default: throw new Error(`resource property type unknown: ${propertyType}`);
  }
}

function makeSchemaFromPropertise(options: ResourceOptions): Schema {

  // tslint:disable-next-line: no-any
  const schemaOptions: any = {};

  for (const property of options.properties) {

    // tslint:disable-next-line: no-any
    const scheme: Record<string, any> = {};

    scheme.type = mapPropertyTypeToMongooseType(property.type)

    if (property.ref) {
      scheme.ref = property.ref;
    }

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

  return new Schema(schemaOptions);

}

export function makeModelForResource<T extends Document>(options: ResourceOptions) {

  const schema = makeSchemaFromPropertise(options);

  return model<T>(options.name, schema);

}
