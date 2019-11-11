import { ResourceController } from '../../resource-maker/resource-controller';
import { IResource, ResourceProperty } from '../../resource-maker/resource-maker-types';
import { ResourceRelationController } from '../../resource-maker/resource-relation-controller';
import { Model } from 'mongoose';
import { IPermit } from './resource-access-control-model';
import { ForbiddenAccessError } from '../../global/errors';

export class PermittedResourceController<T extends IResource> extends ResourceController<T> {

  private name: string;
  private globalRead: boolean;

  constructor(name: string, model: Model<T, {}>, properties: ResourceProperty[], globalRead: boolean) {
    super(model, properties);
    this.name = name;
    this.globalRead = globalRead;
  }

  // tslint:disable-next-line: no-any
  private async injectPermits(userId: string | undefined, permitController: ResourceController<IPermit>, mode: string, filters: any) {

    if (!userId) throw new ForbiddenAccessError('forbidden access');

    const permittedResources = await permitController.list({ user: userId, [mode + 'Permit']: true }, undefined, undefined, 'resource');

    const resourceIds = permittedResources.map(permit => permit.resource);

    if (filters._id) {
      filters._id = {
        $and: [
          {
            $in: resourceIds
          },
          filters._id
        ]
      };
    }
    else {
      filters._id = { $in: resourceIds };
    }

  }

  // tslint:disable-next-line: no-any
  public async listPermitted(userId: string | undefined, permitController: ResourceController<IPermit>, filters: any = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    console.log('it was permitted!!! list ' + this.name);

    if (!this.globalRead) await this.injectPermits(userId, permitController, 'read', filters);

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
