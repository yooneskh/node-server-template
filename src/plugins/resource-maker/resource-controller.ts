import { Model } from 'mongoose';
import { InvalidRequestError, NotFoundError } from '../../global/errors';
import { validatePropertyKeys, validatePayload, transformIncludes } from '../../global/util';
import { ResourceProperty, IResource, IFilter } from './resource-maker-types';

export class ResourceController<T extends IResource> {

  private model: Model<T>;
  private properties: ResourceProperty[];

  constructor(model: Model<T, {}>, properties: ResourceProperty[]) {
    this.model = model;
    this.properties = properties;
  }

  // tslint:disable-next-line: no-any
  public async list(filters: IFilter = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    validatePropertyKeys(filters, this.properties);
    validatePropertyKeys(sorts, this.properties);

    const query = this.model.find(filters).sort(sorts).select(selects).skip(skip).limit(limit);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  // tslint:disable-next-line: no-any
  public async count(filters: IFilter = {}): Promise<number> {

    validatePropertyKeys(filters, this.properties);

    return this.model.countDocuments(filters);

  }

  public async singleRetrieve(resourceId: string, includes: Record<string, string> = {}, selects?: string): Promise<T> {

    const query = this.model.findById(resourceId).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${resourceId}`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async findOne(filters: IFilter = {}, includes: Record<string, string> = {}, selects?: string): Promise<T> {

    const query = this.model.findOne(filters).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${JSON.stringify(filters)}`);

    return resource;

  }

  public async createNew(payload: Partial<T>): Promise<T> {

    validatePayload(payload, this.properties, true);

    const resource = new this.model();

    for (const key in payload) {
      resource.set(key, payload[key]);
    }

    return resource.save();

  }

  public async editOne(id: string, payload: Partial<T>): Promise<T> {

    if (!id) throw new InvalidRequestError('id not specified');

    validatePayload(payload, this.properties);

    const resource = await this.model.findById(id);

    if (!resource) throw new InvalidRequestError(`resource not found: ${this.model.modelName} @${id}`);

    for (const key in payload) {
      if (key !== 'id' && key !== '_id') {
        resource.set(key, payload[key]);
      }
    }

    resource.updatedAt = Date.now();

    return resource.save();

  }

  public async deleteOne(id: string): Promise<boolean> {

    if (!id) throw new InvalidRequestError('id not specified');

    const resource = await this.model.findById(id);

    if (!resource) throw new InvalidRequestError('resource not found: ' + this.model.modelName + '@' + id);

    await resource.remove();

    return true;

  }

}
