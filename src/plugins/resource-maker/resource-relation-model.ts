import { ResourceRelation } from './resource-relation-types';
import { model, Schema } from 'mongoose';
import { IResourceDocument } from './resource-model-types';
import { simplePascalize } from '../../global/util';
import { makeSchemaOptions } from './resource-model-util';

export function makeResourceRelationModel<TF extends IResourceDocument>(name: string, relation: ResourceRelation) {

  const schema = makeRelationSchema(name, relation);
  const relationName = relation.relationModelName || simplePascalize([name, relation.targetModelName, 'Relation']);

  return model<TF>(relationName, schema);

}

function makeRelationSchema(resourceName: string, relation: ResourceRelation) {

  const schemeOptions = makeSchemaOptions(relation.properties || []);

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

  return new Schema(schemeOptions, { minimize: false });

}
