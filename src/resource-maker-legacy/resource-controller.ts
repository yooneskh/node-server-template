import { Model, Document } from 'mongoose';
import { ResourceOptions } from './resource-maker-types';
import { InvalidRequestError, NotFoundError } from '../global/errors';
import { validatePropertyKeys, validatePayload, transformIncludes } from '../global/util';

export class ResourceController<T extends Document> {

  constructor(private resourceModel: Model<T, {}>, private options: ResourceOptions) { }

  // tslint:disable-next-line: no-any
  public async list({ filters = {}, sorts = {}, includes = {}, selects = undefined, limit = 1000 * 1000 * 1000, skip = 0 }: { filters?: any, sorts?: any, includes?: any, selects?: string, limit?: number, skip?: number }): Promise<T[]> {

    validatePropertyKeys(filters, this.options.properties);
    validatePropertyKeys(sorts, this.options.properties);

    for (const key in sorts) {
      sorts[key] = parseInt(sorts[key], 10);
    }

    const query = this.resourceModel.find(filters).sort(sorts).select(selects).skip(skip).limit(limit);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  // tslint:disable-next-line: no-any
  public async count({ filters = {} }: { filters?: any }): Promise<{ count: number }> {

    validatePropertyKeys(filters, this.options.properties);

    return {
      count: await this.resourceModel.countDocuments(filters)
    };

  }

  // tslint:disable-next-line: no-any
  public async singleRetrieve({ resourceId, includes = {}, selects = undefined }: { resourceId: string, includes?: any, selects?: string }): Promise<T> {

    const query = this.resourceModel.findById(resourceId).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.resourceModel.modelName}@${resourceId}`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async findOne({ filters, includes = {}, selects = undefined }: { filters: any, includes?: any, selects?: string }): Promise<T> {

    const query = this.resourceModel.findOne(filters).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.resourceModel.modelName}@${JSON.stringify(filters)}`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async createNew({ payload = {} }: { payload: any }): Promise<T> {

    validatePayload(payload, this.options.properties);

    const resource = new this.resourceModel();

    for (const key of Object.keys(payload)) {
      // tslint:disable-next-line: no-any
      (resource as any)[key] = payload[key];
    }

    return resource.save();

  }

  // tslint:disable-next-line: no-any
  public async editOne({ id = '', payload = {}}: { id: string, payload: any }): Promise<T> {

    if (!id) throw new InvalidRequestError('id not specified');

    validatePayload(payload, this.options.properties);

    const resource = await this.resourceModel.findById(id);

    if (!resource) throw new InvalidRequestError('resource not found: ' + this.resourceModel.modelName + '@' + id);

    for (const key of Object.keys(payload)) {
      if (key !== 'id' && key !== '_id') {
        // tslint:disable-next-line: no-any
        (resource as any)[key] = payload[key];
      }
    }

    // tslint:disable-next-line: no-any
    (resource as any).updatedAt = Date.now();

    return resource.save();

  }

  public async deleteOne({ id = '' }: { id: string }): Promise<boolean> {

    if (!id) throw new InvalidRequestError('id not specified');

    const resource = await this.resourceModel.findById(id);

    if (!resource) throw new InvalidRequestError('resource not found: ' + this.resourceModel.modelName + '@' + id);

    resource.remove();

    return true;

  }

}
