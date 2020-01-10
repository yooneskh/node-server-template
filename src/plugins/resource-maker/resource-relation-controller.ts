import { Model } from 'mongoose';
import { validatePropertyKeys, transformIncludes } from '../../global/util';
import { ResourceRelation, IResource, IFilter } from './resource-maker-types';
import { InvalidStateError, NotFoundError } from '../../global/errors';

export class ResourceRelationController<T extends IResource> {

  private sourcePropertyName: string;
  private targetPropertyName: string;

  private model: Model<T>;
  private options: ResourceRelation;

  constructor(sourceModelName: string, targetModelName: string, relationModel: Model<T>, relationOptions: ResourceRelation) {
    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();
    this.model = relationModel;
    this.options = relationOptions;
  }

  public async listForSource(sourceId: string, filters: IFilter = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    validatePropertyKeys(filters, this.options.properties || []);
    validatePropertyKeys(sorts, this.options.properties || []);

    const query = this.model.find({ ...filters, [this.sourcePropertyName]: sourceId }).sort(sorts).select(selects).skip(skip).limit(limit);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  public async countListForSource(sourceId: string, filters: IFilter = {}): Promise<number> {

    validatePropertyKeys(filters, this.options.properties || []);

    return this.model.countDocuments({ ...filters, [this.sourcePropertyName]: sourceId });

  }

  public async getSingleRelation(sourceId: string, targetId: string, filters: IFilter = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    validatePropertyKeys(filters, this.options.properties || []);
    validatePropertyKeys(sorts, this.options.properties || []);

    const query = this.model.find({ ...filters, [this.sourcePropertyName]: sourceId, [this.targetPropertyName]: targetId }).sort(sorts).select(selects).skip(skip).limit(limit);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  public async getSingleRelationCount(sourceId: string, targetId: string, filters: IFilter = {}): Promise<number> {

    validatePropertyKeys(filters, this.options.properties || []);

    return this.model.countDocuments({
      ...filters,
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    });

  }

  public async retrieveRelation(relationId: string, includes: Record<string, string> = {}, selects?: string): Promise<T> {

    const query = this.model.findById(relationId).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    const relation = await query;

    if (!relation) throw new NotFoundError(`relation not found @${relationId}`);

    return relation;

  }

  public async addRelation(sourceId: string, targetId: string, payload: Partial<T>): Promise<T> {

    // TODO: validate payload

    if ('singular' in this.options || 'maxCount' in this.options) {

      const currentCount = await this.getSingleRelationCount(sourceId, targetId);

      if ('singular' in this.options && this.options.singular && currentCount >= 1) {
        throw new InvalidStateError('relation already exists')
      }

      if ('maxCount' in this.options && this.options.maxCount !== undefined && currentCount >= this.options.maxCount) {
        throw new InvalidStateError('relation max count reached')
      }

    }

    const obj = {
      ...payload,
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    };

    const relation = new this.model(obj);

    return relation.save();

  }

  public async updateRelation(sourceId: string, targetId: string, relationId: string, payload: Partial<T>): Promise<boolean> {

    const item = await this.model.findById(relationId);

    if (!item) throw new NotFoundError('relation not found');

    if (item.get(this.sourcePropertyName) !== sourceId || item.get(this.targetPropertyName) !== targetId) {
      throw new NotFoundError('relation not found');
    }

    // TODO: validate payload

    Object.keys(payload).forEach(key => {
      if (key !== this.sourcePropertyName || key !== this.targetPropertyName || key !== '_id') {
        // tslint:disable-next-line: no-any
        item.set(key, (payload as any)[key]);
      }
    });

    item.updatedAt = Date.now();

    await item.save();

    return true;

  }

  public async removeRelation(sourceId: string, targetId: string, relationId: string): Promise<boolean> {

    const item = await this.model.findById(relationId);

    if (!item) throw new NotFoundError('relation not found');

    if (item.get(this.sourcePropertyName) !== sourceId || item.get(this.targetPropertyName) !== targetId) {
      throw new NotFoundError('relation not found');
    }

    await item.remove();

    return true;

  }

}
