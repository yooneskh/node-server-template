import { IResource, ResourceModelProperty } from './resource-model-types';
import { ResourceModel } from './resource-model';
import { ResourceController } from './resource-controller';
import { ServerError } from '../../global/errors';
import { ResourceRouterAction } from './resource-router-types';
import { ResourceRouter } from './resource-router';
import { ResourceRelation } from './resource-relation-types';
import { ResourceRelationController } from './resource-relation-controller';
import { makeResourceRelationModel } from './resource-relation-model';

export class ResourceMaker<T extends IResource> {

  private resourceModeler = new ResourceModel<T>(this.name);
  private resourceController?: ResourceController<T>;
  private resourceRouter?: ResourceRouter<T> = undefined;

  constructor(private name: string) {}

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

    if (!this.resourceRouter) {
      this.resourceRouter = new ResourceRouter<T>(this.name, this.resourceModeler.getProperties(), this.resourceController);
    }

    this.resourceRouter.addAction(action);

  }

  public addRelation<U extends IResource>(relation: ResourceRelation) {

    if (!this.resourceRouter) {
      if (!this.resourceController) throw new ServerError('action added before making controller');

      this.resourceRouter = new ResourceRouter<T>(this.name, this.resourceModeler.getProperties(), this.resourceController);

    }

    const relationModel = makeResourceRelationModel<U>(this.name, relation);
    const relationController = new ResourceRelationController<U>(this.name, relation.targetModelName, relationModel, relation);

    this.resourceRouter.addRelation(relation, relationController);

    return {
      model: relationModel,
      controller: relationController
    };

  }

  public addActions(actions: ResourceRouterAction[]) {
    actions.forEach(action => this.addAction(action) );
  }

  public getRouter() {
    if (!this.resourceRouter) throw new ServerError('no action added');

    return this.resourceRouter.getRouter();

  }

}
