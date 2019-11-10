import { ResourceController } from '../../resource-maker/resource-controller';
import { IResource, ResourceProperty } from '../../resource-maker/resource-maker-types';
import { ResourceRelationController } from '../../resource-maker/resource-relation-controller';
import { Model } from 'mongoose';

export class PermittedResourceController<T extends IResource> extends ResourceController<T> {

  private name: string;

  constructor(name: string, model: Model<T, {}>, properties: ResourceProperty[]) {
    super(model, properties);
    this.name = name;
  }

  // tslint:disable-next-line: no-any
  public async listPermitted(userId: string, filters: any = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    console.log('it was permitted!!! list' + this.name);

    // TODO: next step! add filter by this resources permits collection for reads

    return super.list(filters, sorts, includes, selects, limit, skip);

  }

  // tslint:disable-next-line: no-any
  public async countPermitted(filters: any = {}): Promise<number> {
    console.log('it was permitted!!!' + this.name);
    return super.count(filters);
  }

  public async singleRetrievePermitted(resourceId: string, includes: Record<string, string> = {}, selects?: string): Promise<T> {
    console.log('it was permitted!!!' + this.name);
    return super.singleRetrieve(resourceId, includes, selects);
  }

  // tslint:disable-next-line: no-any
  public async findOnePermitted(filters: any = {}, includes: Record<string, string> = {}, selects?: string): Promise<T> {
    console.log('it was permitted!!!' + this.name);
    return super.findOne(filters, includes, selects);
  }

  public async createNewPermitted(payload: Partial<T>): Promise<T> {
    console.log('it was permitted!!!' + this.name);
    return super.createNew(payload);
  }

  public async editOnePermitted(id: string, payload: Partial<T>): Promise<T> {
    console.log('it was permitted!!!' + this.name);
    return super.editOne(id, payload);
  }

  public async deleteOnePermitted(id: string): Promise<boolean> {
    console.log('it was permitted!!!' + this.name);
    return super.deleteOne(id);
  }

}

export class PermittedResourceRelationController<T extends IResource> extends ResourceRelationController<T> {

}
