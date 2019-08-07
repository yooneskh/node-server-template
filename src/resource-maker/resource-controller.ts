import { Model, Document } from 'mongoose';
import { ResourceOptions } from './resource-maker.types';

export class ResourceController<T extends Document> {

  constructor(private resourceModel: Model<T, {}>, private options: ResourceOptions) { }

  public async listAll({ latest = false }): Promise<T[]> {
    return this.resourceModel.find().sort({ _id: latest ? -1 : 1 });
  }

  // tslint:disable-next-line: no-any
  public async createNew({ payload = {}}: { payload: any }): Promise<T> {

    this.validatePayload(payload);

    const resource = new this.resourceModel();

    for (const key of Object.keys(payload)) {
      // tslint:disable-next-line: no-any
      (resource as any)[key] = payload[key];
    }

    return resource.save();

  }

  // tslint:disable-next-line: no-any
  public async editOne({ id = '', payload = {}}: { id: string, payload: any }): Promise<T> {

    if (!id) throw new Error('id not specified');

    this.validatePayload(payload);

    const resource = await this.resourceModel.findById(id);

    if (!resource) throw new Error('resource not found: ' + this.resourceModel.modelName);

    for (const key of Object.keys(payload)) {
      if (key !== 'id' && key !== '_id') {
        // tslint:disable-next-line: no-any
        (resource as any)[key] = payload[key];
      }
    }

    return resource.save();

  }

  // tslint:disable-next-line: no-any
  private validatePayload(payload: any) {
    for (const key in payload) {

      const property = this.options.properties.find(p => p.key === key);

      if (!property) throw new Error('payload key invalid: ' + key);

    }
  }

}
