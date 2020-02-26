import { ResourceModelProperty, IResource } from './resource-model-types';
import { ResourceControllerContext } from './resource-controller-types';
import { Model } from 'mongoose';
import { RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT } from './config';
import { validatePropertyKeys, transformIncludes } from './resource-controller-util';
import { NotFoundError, InvalidRequestError } from '../../global/errors';

// tslint:disable: no-any
export class ResourceController<T extends IResource> {

  constructor(private name: string, private model: Model<T, {}>, private properties: ResourceModelProperty[]) {

  }

  public async list(context: ResourceControllerContext<T>): Promise<T[]> {

    validatePropertyKeys(context.filters ?? {}, this.properties);
    validatePropertyKeys(context.sorts ?? {}, this.properties);

    const query = this.model.find(context.filters ?? {});

    query.sort(context.sorts ?? {});
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    query.limit(context.limit ?? RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT);

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    return query;

  }

  public async count(context: ResourceControllerContext<T>): Promise<number> {

    validatePropertyKeys(context.filters ?? {}, this.properties);

    return this.model.countDocuments(context.filters);

  }

  public async retrieve(context: ResourceControllerContext<T>): Promise<T> {

    if (!context.resourceId) throw new InvalidRequestError('no resource id specified');

    const query = this.model.findById(context.resourceId).select(context.selects);

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${context.resourceId}`);

    return resource;

  }

  public async findOne(context: ResourceControllerContext<T>): Promise<T> {

    const query = this.model.findOne(context.filters).select(context.selects);

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${JSON.stringify(context.filters)}`);

    return resource;

  }

  public async create(context: ResourceControllerContext<T>): Promise<T> {

    validatePropertyKeys(context.payload ?? {}, this.properties, true); // TODO: check value of payload

    const resource = new this.model();

    for (const key in context.payload) {
      resource.set(key, context.payload[key]);
    }

    return resource.save();

  }

  public async edit(context: ResourceControllerContext<T>): Promise<T> {

    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');

    validatePropertyKeys(context.payload ?? {}, this.properties); // TODO: check value of payload

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new InvalidRequestError(`resource not found: ${this.model.modelName} @${context.resourceId}`);

    for (const key in context.payload) {
      if (key !== 'id' && key !== '_id') {
        resource.set(key, context.payload[key]);
      }
    }

    resource.updatedAt = Date.now();
    return resource.save();

  }

  public async editQuery(context: ResourceControllerContext<T>): Promise<void> {

    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');

    if ('$set' in context.query) {
      context.query.$set.updatedAt = Date.now();
    }
    else {
      context.query = {
        ...context.query,
        $set: {
          updatedAt: Date.now()
        }
      }
    }

    await this.model.updateOne({ _id: context.resourceId }, context.query);

  }

  public async delete(context: ResourceControllerContext<T>): Promise<boolean> {

    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new InvalidRequestError(`resource not found: ${this.model.modelName}@${context.resourceId}`);

    await resource.remove();

    return true;

  }

}
