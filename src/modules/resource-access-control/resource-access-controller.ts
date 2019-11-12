import { ResourceController } from '../../resource-maker/resource-controller';
import { IResource, ResourceProperty, IFilter } from '../../resource-maker/resource-maker-types';
import { ResourceRelationController } from '../../resource-maker/resource-relation-controller';
import { Model } from 'mongoose';
import { IPermit } from './resource-access-control-model';
import { ForbiddenAccessError } from '../../global/errors';
import { UserController } from '../user/user-resource';
import { hasPermission } from '../auth/auth-resource';

export class PermittedResourceController<T extends IResource> extends ResourceController<T> {

  private name: string;
  private nameLowercased: string;
  private globalRead: boolean;

  constructor(name: string, model: Model<T, {}>, properties: ResourceProperty[], globalRead: boolean) {
    super(model, properties);
    this.name = name;
    this.nameLowercased = this.name.toLowerCase();
    this.globalRead = globalRead;
  }

  private async canBypassAccessControl(userId: string | undefined, mode: string): Promise<boolean> {

    if (!userId) return false;

    const user = await UserController.singleRetrieve(userId);

    return hasPermission(user.permissions, `admin.${this.nameLowercased}.${mode}`);

  }

  private async getPermittedResourceIds(userId: string | undefined, permitController: ResourceController<IPermit>, mode: string): Promise<string[]> {

    if (!userId) throw new ForbiddenAccessError('forbidden access');

    const permittedResources = await permitController.list({ user: userId, [mode + 'Permit']: true }, undefined, undefined, 'resource');

    return permittedResources.map(permit => permit.resource);

  }

  private async injectPermits(userId: string | undefined, permitController: ResourceController<IPermit>, mode: string, filters: IFilter) {

    const resourceIds = await this.getPermittedResourceIds(userId, permitController, mode);

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

  public async listPermitted(userId: string | undefined, permitController: ResourceController<IPermit>, filters: IFilter = {}, sorts: Record<string, number> = {}, includes: Record<string, string> = {}, selects?: string, limit = 1000 * 1000 * 1000, skip = 0): Promise<T[]> {

    if ( !this.globalRead && !(await this.canBypassAccessControl(userId, 'retrieve')) ) {
      await this.injectPermits(userId, permitController, 'read', filters);
    }

    return super.list(filters, sorts, includes, selects, limit, skip);

  }

  public async countPermitted(userId: string | undefined, permitController: ResourceController<IPermit>, filters: IFilter = {}): Promise<number> {

    if ( !this.globalRead && !(await this.canBypassAccessControl(userId, 'retrieve')) ) {
      await this.injectPermits(userId, permitController, 'read', filters);
    }

    return super.count(filters);

  }

  public async singleRetrievePermitted(userId: string | undefined, permitController: ResourceController<IPermit>, resourceId: string, includes: Record<string, string> = {}, selects?: string): Promise<T> {

    if ( !this.globalRead && !(await this.canBypassAccessControl(userId, 'retrieve')) ) {
      if (!(await this.getPermittedResourceIds(userId, permitController, 'read')).includes(resourceId)) {
        throw new ForbiddenAccessError('forbidden access');
      }
    }

    return super.singleRetrieve(resourceId, includes, selects);

  }

  public async findOnePermitted(userId: string | undefined, permitController: ResourceController<IPermit>, filters: IFilter = {}, includes: Record<string, string> = {}, selects?: string): Promise<T> {

    if ( !this.globalRead && !(await this.canBypassAccessControl(userId, 'retrieve')) ) {
      await this.injectPermits(userId, permitController, 'read', filters);
    }

    return super.findOne(filters, includes, selects);

  }

  public async createNewPermitted(userId: string | undefined, permitController: ResourceController<IPermit>, payload: Partial<T>): Promise<T> {

    const resource = await super.createNew(payload);

    try {
      await permitController.createNew({
        user: userId,
        resource: resource._id,
        readPermit: true,
        updatePermit: true,
        deletePermit: true
      });
    }
    catch (error) {
      await resource.remove();
      throw error;
    }

    return resource;

  }

  public async editOnePermitted(userId: string | undefined, permitController: ResourceController<IPermit>, id: string, payload: Partial<T>): Promise<T> {

    if ( !(await this.getPermittedResourceIds(userId, permitController, 'update')).includes(id) && !(await this.canBypassAccessControl(userId, 'update')) ) {
      throw new ForbiddenAccessError('forbidden access');
    }

    return super.editOne(id, payload);

  }

  public async deleteOnePermitted(userId: string | undefined, permitController: ResourceController<IPermit>, id: string): Promise<boolean> {

    if ( !(await this.getPermittedResourceIds(userId, permitController, 'delete')).includes(id) && !(await this.canBypassAccessControl(userId, 'delete'))) {
      throw new ForbiddenAccessError('forbidden access');
    }

    return super.deleteOne(id);

  }

}

export class PermittedResourceRelationController<T extends IResource> extends ResourceRelationController<T> {

}
