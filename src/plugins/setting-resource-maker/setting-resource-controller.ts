import { ResourceController } from '../resource-maker/resource-controller';
import { IResource, IResourceDocument } from '../resource-maker/resource-model-types';
import { SettingResourceControllerContext } from './setting-resource-controller-types';

export class SettingResourceController<T extends IResource, TF extends IResourceDocument> {

  private isEnsured = false;

  constructor(private controller: ResourceController<T, TF>) {

  }

  private async ensureItem(): Promise<void> {
    if (this.isEnsured) return;

    const size = await this.controller.count({ filters: {} });
    if (size > 0) {
      this.isEnsured = true;
      return;
    }

    await this.controller.create({ payload: {} });
    this.isEnsured = true;

  }

  public async retrieve(context: SettingResourceControllerContext<T>): Promise<TF> {
    await this.ensureItem();

    return this.controller.findOne({
      filters: {},
      selects: context.selects,
      includes: context.includes
    });

  }

  public async update(context: SettingResourceControllerContext<T>): Promise<TF> {
    await this.ensureItem();

    const item = await this.retrieve({});

    return this.controller.edit({
      resourceId: item._id,
      payload: context.payload
    });

  }

}
