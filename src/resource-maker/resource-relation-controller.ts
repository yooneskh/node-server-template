import { Model, Document } from 'mongoose';
import { validatePropertyKeys, transformIncludes } from '../global/util';
import { ResourceProperty } from './resource-maker-types';

export class ResourceRelationController {

  private sourcePropertyName = '';
  private targetPropertyName = '';

  constructor(sourceModelName: string, targetModelName: string, private relationModel: Model<Document, {}>, private relationProperties: ResourceProperty[]) {

    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();

  }

  // tslint:disable-next-line: no-any
  public async listForSource({ sourceId, filters = {}, sorts = {}, includes = {}, selects = undefined }: { sourceId: string, filters?: any, sorts?: any, includes?: any, selects?: string }) {

    validatePropertyKeys(filters, this.relationProperties);
    validatePropertyKeys(sorts, this.relationProperties);

    for (const key in sorts) {
      sorts[key] = parseInt(sorts[key], 10);
    }

    const query = this.relationModel.find({ ...filters, [this.sourcePropertyName]: sourceId }).sort(sorts).select(selects);

    for (const include of transformIncludes(includes)) query.populate(include);

    return query;

  }

  public async countListForSource(sourceId: string) {
    return {
      count: await this.relationModel.countDocuments({ [this.sourcePropertyName]: sourceId })
    };
  }

  public async getSingleRelation(sourceId: string, targetId: string, selects?: string) {
    return this.relationModel.find({
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    }).select(selects);
  }

  public async getSingleRelationCount(sourceId: string, targetId: string) {
    return {
      count: await this.relationModel.countDocuments({
        [this.sourcePropertyName]: sourceId,
        [this.targetPropertyName]: targetId
      })
    };
  }

  // tslint:disable-next-line: no-any
  public async addRelation(sourceId: string, targetId: string, payload: any) {

    // TODO: validate payload

    const obj = {
      ...payload,
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    };

    const relation = new this.relationModel(obj);

    return relation.save();

  }

  public async removeRelation(sourceId: string, targetId: string) {

    await this.relationModel.deleteMany({
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    })

    return true;

  }

}
