import { Model, Document } from 'mongoose';

export class ResourceController<T extends Document> {

  constructor(private resourceModel: Model<T, {}>) { }

  public async listAll({ latest = false }): Promise<T[]> {
    return this.resourceModel.find().sort({ _id: latest ? -1 : 1 });
  }

  // tslint:disable-next-line: no-any
  public async createNew({ propertise = {}}: { propertise: any }): Promise<T> {

    // todo: validate propertise

    const resource = new this.resourceModel();

    for (const key of Object.keys(propertise)) {
      // tslint:disable-next-line: no-any
      (resource as any)[key] = propertise[key];
    }

    return resource.save();

  }

  // tslint:disable-next-line: no-any
  public async editOne({ id = '', propertise = {}}: { id: string, propertise: any }): Promise<T> {

    if (!id) throw new Error('id not specified');

    // todo: validate propertise

    const resource = await this.resourceModel.findById(id);

    if (!resource) throw new Error('resource not found: ' + this.resourceModel.modelName);

    for (const key of Object.keys(propertise)) {
      if (key !== 'id' && key !== '_id') {
        // tslint:disable-next-line: no-any
        (resource as any)[key] = propertise[key];
      }
    }

    return resource.save();

  }

}
