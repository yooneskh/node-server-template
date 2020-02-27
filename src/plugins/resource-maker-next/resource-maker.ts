import { IResource, ResourceModelProperty } from './resource-model-types';
import { ResourceModel } from './resource-model';
import { ResourceController } from './resource-controller';
import { ServerError } from '../../global/errors';
import { ResourceRouterAction } from './resource-router-types';
import { ResourceRouter } from './resource-router';

export class ResourceMaker<T extends IResource> {

  private resourceModeler = new ResourceModel<T>(this.name);
  private resourceController?: ResourceController<T>;
  private resourceRouter = new ResourceRouter(this.name);

  constructor(private name: string) {

  }

  public addProperty(property: ResourceModelProperty) {
    this.resourceModeler.addProperty(property)
  }

  public addProperties(properties: ResourceModelProperty[]) {
    properties.forEach(property => this.addProperty(property) );
  }

  public getModel() {
    return this.resourceModeler.getModel();
  }

  public getController() {
    if (this.resourceController) throw new ServerError('controller is already made');

    this.resourceController = new ResourceController(this.name, this.getModel(), this.resourceModeler.getProperties());
    return this.resourceController;

  }

  public addAction(action: ResourceRouterAction) {
    this.resourceRouter.addAction(action);
  }

  public addActions(actions: ResourceRouterAction[]) {
    actions.forEach(action => this.addAction(action) );
  }

  public getRouter() {
    return this.resourceRouter.getRouter();
  }

}
