import { Model, Document } from 'mongoose';
import { ResourceOptions } from './resource-maker-types';
import { InvalidRequestError, NotFoundError } from '../global/errors';

export class ResourceController<T extends Document> {

  private addedProperties = {
    _id: 'string',
    createdAt: 'number',
    updatedAt: 'number'
  };

  constructor(private resourceModel: Model<T, {}>, private options: ResourceOptions) { }

  // tslint:disable-next-line: no-any
  public async list({ filters = {}, sorts = {}, includes = {}, selects = undefined }: { filters?: any, sorts?: any, includes?: any, selects?: string }): Promise<T[]> {

    this.validatePropertyKeys(filters);
    this.validatePropertyKeys(sorts);

    for (const key in sorts) {
      sorts[key] = parseInt(sorts[key], 10);
    }

    const query = this.resourceModel.find(filters).sort(sorts).select(selects);

    for (const include of this.transformIncludes(includes)) query.populate(include);

    return query;

  }

  // tslint:disable-next-line: no-any
  public async count({ filters = {} }: { filters?: any }): Promise<{ count: number }> {

    this.validatePropertyKeys(filters);

    return {
      count: await this.resourceModel.countDocuments(filters)
    };

  }

  // tslint:disable-next-line: no-any
  public async singleRetrieve({ resourceId, includes = {}, selects = undefined }: { resourceId: string, includes?: any, selects?: string }): Promise<T> {

    const query = this.resourceModel.findById(resourceId).select(selects);

    for (const include of this.transformIncludes(includes)) query.populate(include);

    const resource = await query;

    if (!resource) throw new NotFoundError(`${this.options.name}@${resourceId} was not found.`);

    return resource;

  }

  // tslint:disable-next-line: no-any
  public async createNew({ payload = {} }: { payload: any }): Promise<T> {

    this.validatePayload(payload);

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

    this.validatePayload(payload);

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

  // tslint:disable-next-line: no-any
  private validatePayload(payload: any) {
    this.validatePropertyKeys(payload);
    this.validatePropertyTypes(payload)
  }

  // tslint:disable-next-line: no-any
  private validatePropertyKeys(payload: any) {
    for (const key in payload) {

      if (key in this.addedProperties) continue;

      const property = this.options.properties.find(p => p.key === key);

      if (!property) throw new InvalidRequestError('payload key invalid: ' + key);

    }
  }

  // tslint:disable-next-line: no-any
  private validatePropertyTypes(payload: any) {
    // TODO: implmement
  }

  private transformIncludes(includes: Record<string, string>) {

    // tslint:disable-next-line: no-any
    const resultArray: any[][] = [];

    for (const includeKey in includes) {

      const includeKeySeperated = includeKey.split('.');

      const prePops = includeKeySeperated.slice(0, -1);
      const lastPopulate = includeKeySeperated.slice(-1)[0];

      let packIndex = -1;

      for (let i = 0; i < resultArray.length; i++) {
        if (resultArray[i][0] && resultArray[i][0].path === includeKeySeperated[0]) {
          packIndex = i;
          break;
        }
      }

      if (packIndex === -1) {
        resultArray.push([]);
        packIndex = resultArray.length - 1;
      }

      let currentCleanIndex = 0;

      for (const prePop of prePops) {

        if (resultArray[packIndex][currentCleanIndex] && resultArray[packIndex][currentCleanIndex].path !== prePop) {
          throw new InvalidRequestError(`wrong nested include at '${includeKey}', parent must be defined before`);
        }

        currentCleanIndex++;

      }

      resultArray[packIndex].push({
        path: lastPopulate,
        select: includes[includeKey]
      });

    }

    for (const result of resultArray) {
      for (let i = result.length - 1; i >= 1; i--) {
        result[i - 1].populate = result[i];
      }
    }

    return resultArray.map(result => result[0]);

  }

}
