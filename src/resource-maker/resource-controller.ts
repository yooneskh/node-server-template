import { Model, Document } from 'mongoose';

export class ResourceController<T extends Document> {

  constructor(private resourceModel: Model<T, {}>) { }

  public async listAll({ latest = false }): Promise<T[]> {
    return this.resourceModel.find().sort({ _id: latest ? -1 : 1 });
  }

}
