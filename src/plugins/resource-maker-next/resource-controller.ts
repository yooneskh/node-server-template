import { ResourceModelProperty } from './resource-model-types';
import { ResourceControllerContext } from './resource-controller-types';
import { Model, Document } from 'mongoose';
import { RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT } from './config';

// tslint:disable: no-any
export class ResourceController<T extends Document> {

  constructor(private name: string, private model: Model<T, {}>, private properties: ResourceModelProperty[]) {

  }

  public async list(context: ResourceControllerContext): Promise<T[]> {

    validatePropertyKeys(context.filters ?? {}, this.properties);
    validatePropertyKeys(context.sorts ?? {}, this.properties);

    const query = this.model.find(context.filters ?? {}).sort(context.sorts ?? {}).select(context.selects).skip(context.skip ?? 0).limit(context.limit ?? RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

}
