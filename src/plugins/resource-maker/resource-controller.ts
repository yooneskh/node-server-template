import { ResourceModelProperty, IResource } from './resource-model-types';
import { ResourceControllerContext } from './resource-controller-types';
import { Model, Document } from 'mongoose';
import { validatePropertyKeys, transformIncludes } from './resource-controller-util';
import { NotFoundError, InvalidRequestError } from '../../global/errors';
import { YEventManager } from '../event-manager/event-manager';
import { ResourceValidator } from './resource-validator';

// tslint:disable: no-any
export class ResourceController<T extends IResource> {

  private resourceValidator?: ResourceValidator<T>;

  constructor(private name: string, private model: Model<T & Document, {}>, private properties: ResourceModelProperty[]) {

  }

  public setValidator(validator: ResourceValidator<T>) {
    this.resourceValidator = validator;
  }

  public async list(context: ResourceControllerContext<T>): Promise<(T & Document)[]> {

    validatePropertyKeys(context.filters ?? {}, this.properties);
    validatePropertyKeys(context.sorts ?? {}, this.properties);

    const query = this.model.find(context.filters ?? {});

    query.sort(context.sorts ?? {});
    query.select(context.selects);
    query.skip(context.skip ?? 0);

    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    const result = await query;

    YEventManager.emit(
      ['Resource', this.name, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async count(context: ResourceControllerContext<T>): Promise<number> {

    validatePropertyKeys(context.filters ?? {}, this.properties);

    const result = await this.model.countDocuments(context.filters ?? {});

    YEventManager.emit(['Resource', this.name, 'Counted'], result);
    return result;

  }

  public async retrieve(context: ResourceControllerContext<T>): Promise<T & Document> {
    if (!context.resourceId) throw new InvalidRequestError('no resource id specified');

    const query = this.model.findById(context.resourceId).select(context.selects);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${context.resourceId}`);

    YEventManager.emit(['Resource', this.name, 'Retrieved'], resource._id, resource);

    return resource;

  }

  public async findOne(context: ResourceControllerContext<T>): Promise<T & Document> {

    validatePropertyKeys(context.filters ?? {}, this.properties);

    const query = this.model.findOne(context.filters);

    query.sort(context.sorts ?? {});
    query.select(context.selects);
    if (context.lean) query.lean();

    for (const include of transformIncludes(context.includes ?? {})) {
      query.populate(include);
    }

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${JSON.stringify(context.filters)}`);

    YEventManager.emit(['Resource', this.name, 'Found'], resource._id, resource); // TODO: change name to Retrieved?

    return resource;

  }

  public async create(context: ResourceControllerContext<T>): Promise<T & Document> {

    validatePropertyKeys(context.payload ?? {}, this.properties, true);
    // TODO: check value of payload

    const resource = new this.model();

    for (const key in context.payload) {
      resource.set(key, context.payload[key]);
    }

    if (this.resourceValidator) await this.resourceValidator.validate(resource);
    await resource.save();

    YEventManager.emit(['Resource', this.name, 'Created'], resource._id, resource);
    return resource;

  }

  public async edit(context: ResourceControllerContext<T>): Promise<T & Document> {
    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');

    validatePropertyKeys(context.payload ?? {}, this.properties);
    // TODO: check value of payload

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new InvalidRequestError(`resource not found: ${this.name}@${context.resourceId}`);

    for (const key in context.payload) {
      if (key !== 'id' && key !== '_id') {
        resource.set(key, context.payload[key]); // TODO: probably needs more work for series
      }
    }

    resource.updatedAt = Date.now();
    if (this.resourceValidator) await this.resourceValidator.validate(resource);
    await resource.save();

    YEventManager.emit(['Resource', this.name, 'Updated'], resource._id, resource);
    return resource;

  }

  // todo: apply validators on this
  public async editQuery(context: ResourceControllerContext<T>): Promise<T & Document> {
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

    const model = await this.model.findByIdAndUpdate(context.resourceId, context.query, { new: true });
    if (!model) throw new NotFoundError('resourceId not found')

    YEventManager.emit(['Resource', this.name, 'Updated'], model._id, model);
    return model;

  }

  public async delete(context: ResourceControllerContext<T>): Promise<boolean> {
    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${context.resourceId}`);

    const resourceClone = JSON.parse(JSON.stringify(resource));
    await resource.remove();

    YEventManager.emit(['Resource', this.name, 'Deleted'], resourceClone._id, resourceClone);
    return true;

  }

}
