import { Model, Document } from 'mongoose';
import { InvalidRequestError, NotFoundError } from '../global/errors';
import { validatePropertyKeys, validatePayload, transformIncludes } from '../global/util';
import { ResourceProperty } from './resource-maker-types';

export class ResourceController<T extends Document> {

  private model: Model<T>;
  private properties: ResourceProperty[];

  constructor(model: Model<T, {}>, properties: ResourceProperty[]) {
    this.model = model;
    this.properties = properties;
  }

  // tslint:disable-next-line: no-any
  public async list(filters: any = {}, sorts: any = {}, includes: any = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    validatePropertyKeys(filters, this.properties);
    validatePropertyKeys(sorts, this.properties);

    for (const key in sorts) {
      sorts[key] = parseInt(sorts[key], 10);
    }

    const query = this.model.find(filters).sort(sorts).select(selects).skip(skip).limit(limit);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  // tslint:disable-next-line: no-any
  public async count(filters: any = {}): Promise<number> {

    validatePropertyKeys(filters, this.properties);

    return this.model.countDocuments(filters);

  }

  // tslint:disable-next-line: no-any
  public async singleRetrieve(resourceId: string, includes: any = {}, selects?: string): Promise<T> {

    const query = this.model.findById(resourceId).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${resourceId}`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async findOne(filters: any = {}, includes: any = {}, selects?: string): Promise<T> {

    const query = this.model.findOne(filters).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`resource not found: ${this.model.modelName}@${JSON.stringify(filters)}`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async createNew(payload: any = {}): Promise<T> {

    validatePayload(payload, this.properties);

    const resource = new this.model();

    for (const key of Object.keys(payload)) {
      // tslint:disable-next-line: no-any
      (resource as any)[key] = payload[key];
    }

    return resource.save();

  }

  // tslint:disable-next-line: no-any
  public async editOne(id: string, payload: any = {}): Promise<T> {

    if (!id) throw new InvalidRequestError('id not specified');

    validatePayload(payload, this.properties);

    const resource = await this.model.findById(id);

    if (!resource) throw new InvalidRequestError('resource not found: ' + this.model.modelName + '@' + id);

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

  public async deleteOne(id: string): Promise<boolean> {

    if (!id) throw new InvalidRequestError('id not specified');

    const resource = await this.model.findById(id);

    if (!resource) throw new InvalidRequestError('resource not found: ' + this.model.modelName + '@' + id);

    resource.remove();

    return true;

  }

}
