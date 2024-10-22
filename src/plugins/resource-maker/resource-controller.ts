import { ResourceModelProperty, IResource, IResourceDocument } from './resource-model-types';
import { ResourceControllerContext } from './resource-controller-types';
import { Model } from 'mongoose';
import { validatePropertyKeys, transformIncludes } from './resource-controller-util';
import { NotFoundError, InvalidRequestError } from '../../global/errors';
import { YEventManager } from '../event-manager/event-manager';
import { ResourceValidator } from './resource-validator';

// tslint:disable: no-any
export class ResourceController<T extends IResource, TF extends IResourceDocument> {

  private resourceValidator?: ResourceValidator<T>;

  constructor(private name: string, private model: Model<TF>, private properties: ResourceModelProperty[]) {

  }

  public setValidator(validator: ResourceValidator<T>) {
    this.resourceValidator = validator;
  }

  public async list(context: ResourceControllerContext<T, TF>): Promise<TF[]> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.properties);
    validatePropertyKeys(context.sorts || {}, this.properties);

    const query = this.model.find(context.filters || {});

    query.sort(context.sorts || {});
    query.select(context.selects);
    query.skip(context.skip ?? 0);

    if (context.limit) query.limit(context.limit);
    if (context.lean) query.lean();

    query.populate(transformIncludes(context.includes ?? {}));

    const result = await query;

    YEventManager.emit(
      ['Resource', this.name, 'Listed'],
      result.map(d => d._id),
      result
    );

    return result;

  }

  public async count(context: ResourceControllerContext<T, TF>): Promise<number> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.properties);

    const result = await this.model.countDocuments(context.filters || {});

    YEventManager.emit(['Resource', this.name, 'Counted'], result);
    return result;

  }

  public async retrieve(context: ResourceControllerContext<T, TF>): Promise<TF> {
    if (!context.resourceId) throw new InvalidRequestError(`no resource id specified for ${this.name}`);;

    const query = this.model.findById(context.resourceId).select(context.selects);
    if (context.lean) query.lean();

    query.populate(transformIncludes(context.includes ?? {}));

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${context.resourceId}`, 'مورد خواسته شده یافت نشد.');

    YEventManager.emit(['Resource', this.name, 'Retrieved'], resource._id, resource);

    return resource;

  }

  public async findOne(context: ResourceControllerContext<T, TF>): Promise<TF> {

    if (!context.skipKeyCheck) validatePropertyKeys(context.filters || {}, this.properties);

    const query = this.model.findOne(context.filters);

    query.sort(context.sorts || {});
    query.select(context.selects);
    if (context.lean) query.lean();

    query.populate(transformIncludes(context.includes ?? {}));

    const resource = await query;
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${JSON.stringify(context.filters)}`, 'مورد خواسته شده یافت نشد.');

    YEventManager.emit(['Resource', this.name, 'Found'], resource._id, resource); // TODO: change name to Retrieved?

    return resource;

  }

  public async create(context: ResourceControllerContext<T, TF>): Promise<TF> {
    if (!context.payload) throw new InvalidRequestError('payload not defined', 'داده ای ارسال نشده است.');

    validatePropertyKeys(context.payload, this.properties, true);
    // TODO: check value of payload

    const resource = new this.model();

    for (const property of this.properties) {
      if (property.key in context.payload) {
        if (property.nonCreating) throw new InvalidRequestError(`non creating key '${property.key}' given for creation.`, 'اطلاعات داده شده صحیح نیست.'); // todo: move to validate

        resource.set(property.key, context.payload[property.key as keyof T]);

      }
    }

    if (this.resourceValidator) await this.resourceValidator.validate(resource as unknown as T);
    await resource.save();

    YEventManager.emit(['Resource', this.name, 'Created'], resource._id, resource);
    return resource;

  }

  public async edit(context: ResourceControllerContext<T, TF>): Promise<TF> {
    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified');
    if (!context.payload) throw new InvalidRequestError('payload not defined', 'داده ای ارسال نشده است.');

    validatePropertyKeys(context.payload, this.properties);
    // TODO: check value of payload

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new InvalidRequestError(`resource not found: ${this.name}@${context.resourceId}`, 'مورد خواسته شده یافت نشد.');

    for (const property of this.properties) {
      if (property.key in context.payload) {
        resource.set(property.key, context.payload[property.key as keyof T]);
      }
    }

    resource.updatedAt = Date.now();
    if (this.resourceValidator) await this.resourceValidator.validate(resource as unknown as T);
    await resource.save();

    YEventManager.emit(['Resource', this.name, 'Updated'], resource._id, resource);
    return resource;

  }

  // todo: apply validators on this
  public async editQuery(context: ResourceControllerContext<T, TF>): Promise<TF> {
    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified', 'مورد خواسته شده مشخص نشده است.');

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
    if (!model) throw new NotFoundError('resourceId not found', 'مورد خواسته شده یافت نشد.')

    YEventManager.emit(['Resource', this.name, 'Updated'], model._id, model);
    return model;

  }

  public async delete(context: ResourceControllerContext<T, TF>): Promise<boolean> {
    if (!context.resourceId) throw new InvalidRequestError('resourceId not specified', 'مورد خواسته شده مشخص نشده است.');

    const resource = await this.model.findById(context.resourceId);
    if (!resource) throw new NotFoundError(`resource not found: ${this.name}@${context.resourceId}`, 'مورد خواسته شده یافت نشد.');

    const resourceClone = JSON.parse(JSON.stringify(resource));
    await resource.remove();

    YEventManager.emit(['Resource', this.name, 'Deleted'], resourceClone._id, resourceClone);
    return true;

  }

}
