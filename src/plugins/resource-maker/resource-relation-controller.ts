import { IResource, IResourceDocument, ResourceModelProperty } from './resource-model-types';
import { Model } from 'mongoose';
import { ResourceRelationControllerContext } from './resource-relation-controller-types';
import { ResourceRelation } from './resource-relation-types';
import { validatePropertyKeys, transformIncludes } from './resource-controller-util';
import { NotFoundError, InvalidStateError, InvalidRequestError } from '../../global/errors';
import { YEventManager } from '../event-manager/event-manager';
import { simplePascalize } from '../../global/util';

// tslint:disable: no-any
export class ResourceRelationController<T extends IResource, TF extends IResourceDocument> {

  private sourcePropertyName: string;
  private targetPropertyName: string;

  private model: Model<TF>;
  private relation: ResourceRelation;
  private relationName: string = '';
  private validationProperties: ResourceModelProperty[];

  constructor(sourceModelName: string, targetModelName: string, relationModel: Model<TF>, relation: ResourceRelation) {

    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();
    this.model = relationModel;
    this.relation = relation;
    this.relationName = relation.relationModelName || simplePascalize([sourceModelName, targetModelName, 'Relation']);

    this.validationProperties = [
      ...(relation.properties ?? []),
      {
        key: this.sourcePropertyName,
        type: 'string',
        required: true
      },
      {
        key: this.targetPropertyName,
        type: 'string',
        required: true
      }
    ];

  }

  public async listAll(context: ResourceRelationControllerContext<T, TF>): Promise<TF[]> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);
    validatePropertyKeys(context.sorts || {}, this.validationProperties);

    const query = this.model.find(context.filters || {});
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes || {})) query.populate(include);

    const result = await query;

    YEventManager.emit(
      ['Relation', this.relationName, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async countListAll(context: ResourceRelationControllerContext<T, TF>): Promise<number> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);

    const query = this.model.find(context.filters || {});
    query.skip(context.skip ?? 0);
    if (context.limit) query.limit(context.limit);

    const result = await query.countDocuments();

    YEventManager.emit(
      ['Relation', this.relationName, 'ListCounted'],
      result
    );

    return result;

  }

  public async listForSource(context: ResourceRelationControllerContext<T, TF>): Promise<TF[]> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);
    validatePropertyKeys(context.sorts || {}, this.validationProperties);

    const query = this.model.find(Object.assign({}, context.filters, { [this.sourcePropertyName]: context.sourceId}))
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes || {})) query.populate(include);

    const result = await query;

    YEventManager.emit(
      ['Relation', this.relationName, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async countListForSource(context: ResourceRelationControllerContext<T, TF>): Promise<number> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);

    const result = await this.model.countDocuments(Object.assign({}, context.filters, { [this.sourcePropertyName]: context.sourceId }));

    YEventManager.emit(
      ['Relation', this.relationName, 'Counted'],
      result
    );

    return result;

  }

  public async listForTarget(context: ResourceRelationControllerContext<T, TF>): Promise<TF[]> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);
    validatePropertyKeys(context.sorts || {}, this.validationProperties);

    const query = this.model.find(Object.assign({}, context.filters, { [this.targetPropertyName]: context.targetId }))
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes || {})) query.populate(include);

    const result = await query;

    YEventManager.emit(
      ['Relation', this.relationName, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async countListForTarget(context: ResourceRelationControllerContext<T, TF>): Promise<number> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);

    const result = await this.model.countDocuments(Object.assign({}, context.filters, { [this.targetPropertyName]: context.targetId }));

    YEventManager.emit(
      ['Relation', this.relationName, 'Counted'],
      result
    );

    return result;

  }

  public async getSingleRelation(context: ResourceRelationControllerContext<T, TF>): Promise<TF[]> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.validationProperties);
    validatePropertyKeys(context.sorts || {}, this.validationProperties);

    const query = this.model.find(Object.assign({}, context.filters, { [this.sourcePropertyName]: context.sourceId, [this.targetPropertyName]: context.targetId }))
    query.sort(context.sorts);
    query.select(context.selects);
    query.skip(context.skip ?? 0);
    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes || {})) query.populate(include);

    const result = await query;

    YEventManager.emit(
      ['Relation', this.relationName, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async getSingleRelationCount(context: ResourceRelationControllerContext<T, TF>): Promise<number> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.relation.properties || []);

    const result = await this.model.countDocuments(Object.assign({}, context.filters, { [this.sourcePropertyName]: context.sourceId, [this.targetPropertyName]: context.targetId }));

    YEventManager.emit(
      ['Relation', this.relationName, 'Counted'],
      result
    );

    return result;

  }

  public async retrieveRelation(context: ResourceRelationControllerContext<T, TF>): Promise<TF> {

    const query = this.model.findById(context.relationId).select(context.selects);

    for (const include of transformIncludes(context.includes || {})) query.populate(include);
    if (context.lean) query.lean();

    const relation = await query;
    if (!relation) throw new NotFoundError(`relation not found @${context.relationId}`, 'مورد خواسته شده یافت نشد.');

    YEventManager.emit(
      ['Relation', this.relationName, 'Retrieved'],
      relation._id,
      relation
    );

    return relation;

  }

  public async addRelation(context: ResourceRelationControllerContext<T, TF>): Promise<TF> {

    // TODO: validate payload

    if ('singular' in this.relation || 'maxCount' in this.relation) {

      const currentCount = await this.getSingleRelationCount({ sourceId: context.sourceId, targetId: context.targetId });

      if ('singular' in this.relation && this.relation.singular && currentCount >= 1) {
        throw new InvalidStateError('relation already exists', 'این مورد وجود دارد.')
      }

      if ('maxCount' in this.relation && this.relation.maxCount !== undefined && currentCount >= this.relation.maxCount) {
        throw new InvalidStateError('relation max count reached', 'حداکثر تعداد وجود دارد.')
      }

    }

    const objectToCreateFrom: any = {
      ...(context.payload ?? {}),
      [this.sourcePropertyName]: context.sourceId,
      [this.targetPropertyName]: context.targetId
    };

    const relation = new this.model();

    for (const property of this.validationProperties) {
      if (property.key in objectToCreateFrom) {
        if (property.nonCreating) throw new InvalidRequestError(`non creating key '${property.key}' given for creation.`, 'اطلاعات داده شده صحیح نیست.'); // todo: move to validate

        relation.set(property.key, objectToCreateFrom[property.key as keyof T]);

      }
    }

    await relation.save();

    YEventManager.emit(
      ['Relation', this.relationName, 'Created'],
      relation._id,
      relation
    );

    return relation;

  }

  public async updateRelation(context: ResourceRelationControllerContext<T, TF>): Promise<boolean> {
    if (!context.payload) throw new InvalidRequestError('payload not defined.', 'داده‌ای ارسال نشده است.');

    const item = await this.model.findById(context.relationId);
    if (!item) throw new NotFoundError('relation not found', 'مورد یافت نشد.');

    if (item.get(this.sourcePropertyName) !== context.sourceId || item.get(this.targetPropertyName) !== context.targetId) {
      throw new NotFoundError('relation not found', 'مورد یافت نشد.');
    }

    // TODO: validate payload

    for (const property of this.validationProperties) {
      if (property.key in context.payload) {
        if (property.key === this.sourcePropertyName || property.key === this.targetPropertyName) throw new InvalidRequestError('you cannot change the relation.', 'تغییر غیر مجاز خواسته شده است.');

        item.set(property.key, context.payload[property.key as keyof T]);

      }
    }

    item.updatedAt = Date.now();
    await item.save();

    YEventManager.emit(
      ['Relation', this.relationName, 'Updated'],
      item._id,
      item
    );

    return true;

  }

  public async removeRelation(context: ResourceRelationControllerContext<T, TF>): Promise<boolean> {

    const item = await this.model.findById(context.relationId);
    if (!item) throw new NotFoundError('relation not found', 'موردی یافت نشد.');

    if (item.get(this.sourcePropertyName) !== context.sourceId || item.get(this.targetPropertyName) !== context.targetId) {
      throw new NotFoundError('relation not found', 'موردی یافت نشد.');
    }

    const itemClone = JSON.parse(JSON.stringify(item));
    await item.remove();

    YEventManager.emit(
      ['Relation', this.relationName, 'Deleted'],
      itemClone._id,
      itemClone
    );

    return true;

  }

}
