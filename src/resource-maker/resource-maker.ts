import { ResourceOptions } from './resource-maker.types';
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

function makeSchemaFromPropertise(options: ResourceOptions): Schema {

  // tslint:disable-next-line: no-any
  const schemaOptions: any = {};

  for (const property of options.properties) {
    schemaOptions[property.key] = {
      type: mapPropertyTypeToMongooseType(property.type)
    };
  }

  for (const relation of options.relations) {

    if (!schemaOptions[relation.property]) throw new Error(`relation ${relation.modelName} on ${options.name} doest not have the property ${relation.property} defined`);

    schemaOptions[relation.property].ref = relation.modelName;

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

export function makeResource<T extends Document>(options: ResourceOptions) {

  const resourceSchema = makeSchemaFromPropertise(options);
  const resourceModel = model<T>(options.name, resourceSchema);

  const resourceController = new ResourceController<T>(resourceModel, options);

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
