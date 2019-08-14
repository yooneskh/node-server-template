import { Model, Document } from 'mongoose';

export class ResourceRelationContrller {

  private sourcePropertyName = '';
  private targetPropertyName = '';

  constructor(sourceModelName: string, targetModelName: string, private relationModel: Model<Document, {}>) {

    this.sourcePropertyName = sourceModelName.toLowerCase();
    this.targetPropertyName = targetModelName.toLowerCase();

  }

  public listForSource(sourceId: string) {
    return this.relationModel.find({ [this.sourcePropertyName]: sourceId });
  }

  public getSingleRelation(sourceId: string, targetId: string) {
    return this.relationModel.find({
      [this.sourcePropertyName]: sourceId,
      [this.targetPropertyName]: targetId
    });
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
