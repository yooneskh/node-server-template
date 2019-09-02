import { Model, Document } from 'mongoose';

export class ResourceRelationController {

  private sourcePropertyName = '';
  private targetPropertyName = '';

  constructor(sourceModelName: string, targetModelName: string, private relationModel: Model<Document, {}>) {

    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();

  }

  public async listForSource(sourceId: string, selects?: string) {
    return this.relationModel.find({ [this.sourcePropertyName]: sourceId }).select(selects);
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
