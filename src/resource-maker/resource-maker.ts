import { ResourceOptions, ResourceProperty } from './resource-maker.types';
import { Schema, model, Document } from 'mongoose';
import { ResourceController } from './resource-controller';
import { makeResourceRouter } from './resource-router';

// tslint:disable-next-line: no-any
function mapPropertyTypeToMongooseType(propertyType: string): any {
  switch (propertyType) {
    case 'string': return String;
    case 'number': return Number;
    default: throw new Error(`resource property type unknown: ${propertyType}`);
  }
}

function makeSchemaFromPropertise(propertise: ResourceProperty[]): Schema {

  // tslint:disable-next-line: no-any
  const schemaOptions: any = {};

  for (const property of propertise) {
    schemaOptions[property.key] = {
      type: mapPropertyTypeToMongooseType(property.type)
    };
  }

  schemaOptions['__v'] = {
    type: Number,
    select: false
  };

  return new Schema(schemaOptions);

}

export function makeResource<T extends Document>(options: ResourceOptions) {

  const resourceSchema = makeSchemaFromPropertise(options.properties);
  const resourceModel = model<T>(options.name, resourceSchema);

  const resourceController = new ResourceController<T>(resourceModel);

  const resourceRouter = makeResourceRouter<T>({
    resourceName: options.name,
    controller: resourceController
  });

  return {
    model: resourceModel,
    controller: resourceController,
    router: resourceRouter
  };

}
