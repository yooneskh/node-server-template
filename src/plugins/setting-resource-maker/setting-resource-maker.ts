import { ServerError } from '../../global/errors';
import { ResourceController } from '../resource-maker/resource-controller';
import { ResourceMaker } from '../resource-maker/resource-maker';
import { IResource, IResourceDocument, ResourceModelProperty } from '../resource-maker/resource-model-types';
import { ResourceRouterAction } from '../resource-maker/resource-router-types';
import { extractIncludeQueryObject } from '../resource-maker/resource-router-util';
import { SettingResourceController } from './setting-resource-controller';

export class SettingResourceMaker<T extends IResource, TF extends IResourceDocument> {

  private resourceMaker = new ResourceMaker<T, TF>(this.name);
  private controller?: SettingResourceController<T, TF> = undefined;

  constructor(private name: string) {}

  public addProperty(property: ResourceModelProperty) {
    if (this.controller) throw new ServerError('controller is already made');

    this.resourceMaker.addProperty(property)

  }

  public addProperties(properties: ResourceModelProperty[]) {
    for (const property of properties) {
      this.addProperty(property);
    }
  }

  public getController() {
    if (this.controller) return this.controller;

    const resourceController = new ResourceController<T, TF>(this.name, this.resourceMaker.getModel(), this.resourceMaker.getProperties());
    return this.controller = new SettingResourceController(resourceController);

  }

  public getRouteActionRetrieve(): ResourceRouterAction {
    return {
      method: 'GET',
      path: '/',
      signal: ['Route', this.name, 'Retrieve'],
      dataProvider: async ({ query }) => this.controller?.retrieve({
        includes: extractIncludeQueryObject(query.includes),
        selects: query.selects
      })
    };
  }

  public getRouteActionUpdate(): ResourceRouterAction {
    return {
      method: 'PATCH',
      path: '/',
      signal: ['Route', this.name, 'Update'],
      dataProvider: async ({ payload }) => this.controller?.update({
        payload
      })
    };
  }

  public addAction(action: ResourceRouterAction) {
    this.resourceMaker.addAction(action);
  }

  public addActions(actions: ResourceRouterAction[]) {
    for (const action of actions) {
      this.addAction(action);
    }
  }

  public getRouter() {
    return this.resourceMaker.getRouter();
  }

}
