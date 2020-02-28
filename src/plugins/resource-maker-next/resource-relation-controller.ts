import { IResource } from './resource-model-types';
import { Model } from 'mongoose';
import { ResourceRelationControllerContext } from './resource-relation-controller-types';
import { ResourceRelation } from './resource-relation-types';
import { validatePropertyKeys, transformIncludes } from './resource-controller-util';
import { RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT } from './config';
import { NotFoundError, InvalidStateError } from '../../global/errors';

// tslint:disable: no-any
export class ResourceRelationController<T extends IResource> {

  private sourcePropertyName: string;
  private targetPropertyName: string;

  private model: Model<T>;
  private relation: ResourceRelation;

  constructor(sourceModelName: string, targetModelName: string, relationModel: Model<T>, relation: ResourceRelation) {
    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();
    this.model = relationModel;
    this.relation = relation;
  }

  public async listAll(context: ResourceRelationControllerContext<T>): Promise<T[]> {

    validatePropertyKeys(context.filters ?? {}, this.relation.properties ?? []);
    validatePropertyKeys(context.sorts ?? {}, this.relation.properties ?? []);

    const query = this.model.find(context.filters);
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    query.limit(context.limit ?? RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT);

    for (const include of transformIncludes(context.includes ?? {})) query.populate(include);

    return query;

  }

  public async listForSource(context: ResourceRelationControllerContext<T>): Promise<T[]> {

    validatePropertyKeys(context.filters ?? {}, this.relation.properties ?? []);
    validatePropertyKeys(context.sorts ?? {}, this.relation.properties ?? []);

    const query = this.model.find({ ...context.filters, [this.sourcePropertyName]: context.sourceId })
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    query.limit(context.limit ?? RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT);

    for (const include of transformIncludes(context.includes ?? {})) query.populate(include);

    return query;

  }

  public async countListForSource(context: ResourceRelationControllerContext<T>): Promise<number> {

    validatePropertyKeys(context.filters ?? {}, this.relation.properties ?? []);

    return this.model.countDocuments({ ...context.filters, [this.sourcePropertyName]: context.sourceId });

  }

  public async getSingleRelation(context: ResourceRelationControllerContext<T>): Promise<T[]> {

    validatePropertyKeys(context.filters ?? {}, this.relation.properties ?? []);
    validatePropertyKeys(context.sorts ?? {}, this.relation.properties ?? []);

    const query = this.model.find({ ...context.filters, [this.sourcePropertyName]: context.sourceId, [this.targetPropertyName]: context.targetId })
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    query.limit(context.limit ?? RESOURCE_CONTROLLER_LIST_LIMIT_DEFAULT);

    for (const include of transformIncludes(context.includes ?? {})) query.populate(include);

    return query;

  }

  public async getSingleRelationCount(context: ResourceRelationControllerContext<T>): Promise<number> {

    validatePropertyKeys(context.filters ?? {}, this.relation.properties || []);

    return this.model.countDocuments({
      ...context.filters,
      [this.sourcePropertyName]: context.sourceId,
      [this.targetPropertyName]: context.targetId
    });

  }

  public async retrieveRelation(context: ResourceRelationControllerContext<T>): Promise<T> {

    const query = this.model.findById(context.relationId).select(context.selects);

    for (const include of transformIncludes(context.includes ?? {})) query.populate(include);

    const relation = await query;
    if (!relation) throw new NotFoundError(`relation not found @${context.relationId}`);

    return relation;

  }

  public async addRelation(context: ResourceRelationControllerContext<T>): Promise<T> {

    // TODO: validate payload

    if ('singular' in this.relation || 'maxCount' in this.relation) {

      const currentCount = await this.getSingleRelationCount({ sourceId: context.sourceId, targetId: context.targetId });

      if ('singular' in this.relation && this.relation.singular && currentCount >= 1) {
        throw new InvalidStateError('relation already exists')
      }

      if ('maxCount' in this.relation && this.relation.maxCount !== undefined && currentCount >= this.relation.maxCount) {
        throw new InvalidStateError('relation max count reached')
      }

    }

    const objectToCreateFrom: any = {
      ...context.payload,
      [this.sourcePropertyName]: context.sourceId,
      [this.targetPropertyName]: context.targetId
    };

    const relation = new this.model();

    for (const key in objectToCreateFrom) {
      relation.set(key, objectToCreateFrom[key]);
    }

    return relation.save();

  }

  public async updateRelation(context: ResourceRelationControllerContext<T>): Promise<boolean> {

    const item = await this.model.findById(context.relationId);
    if (!item) throw new NotFoundError('relation not found');

    if (item.get(this.sourcePropertyName) !== context.sourceId || item.get(this.targetPropertyName) !== context.targetId) {
      throw new NotFoundError('relation not found');
    }

    // TODO: validate payload

    for (const key in context.payload ?? {}) {
      if (key !== this.sourcePropertyName || key !== this.targetPropertyName || key !== '_id') {
        item.set(key, (context.payload as any)[key]);
      }
    }

    item.updatedAt = Date.now();

    await item.save();

    return true;

  }

  public async removeRelation(context: ResourceRelationControllerContext<T>): Promise<boolean> {

    const item = await this.model.findById(context.relationId);
    if (!item) throw new NotFoundError('relation not found');

    if (item.get(this.sourcePropertyName) !== context.sourceId || item.get(this.targetPropertyName) !== context.targetId) {
      throw new NotFoundError('relation not found');
    }

    await item.remove();

    return true;

  }

}
