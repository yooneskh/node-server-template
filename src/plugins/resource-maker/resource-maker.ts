import { CompoundIndex, IResource, IResourceDocument, ResourceModelProperty } from './resource-model-types';
import { ResourceModel } from './resource-model';
import { ResourceController } from './resource-controller';
import { ServerError } from '../../global/errors';
import { ResourceRouterAction } from './resource-router-types';
import { ResourceRouter } from './resource-router';
import { ResourceRelation } from './resource-relation-types';
import { ResourceRelationController } from './resource-relation-controller';
import { makeResourceRelationModel } from './resource-relation-model';
import { ResourceValidation, ResourceValidator } from './resource-validator';

export class ResourceMaker<T extends IResource, TF extends IResourceDocument> {

  private resourceModeler = new ResourceModel<TF>(this.name);
  private resourceController?: ResourceController<T, TF>;
  private resourceRouter?: ResourceRouter<T, TF>;
  private resourceValidator?: ResourceValidator<T>;

  constructor(private name: string) {}

  public addProperty(property: ResourceModelProperty) {
    this.resourceModeler.addProperty(property)
  }

  public addProperties(properties: ResourceModelProperty[]) {
    properties.forEach(property => this.addProperty(property) );
  }

  public getProperties(): ResourceModelProperty[] {
    return this.resourceModeler.getProperties();
  }

  public setCompoundIndexes(indexes: CompoundIndex[]) {
    this.resourceModeler.setCompoundIndexes(indexes);
  }

  public getModel() {
    return this.resourceModeler.getModel();
  }

  public getController() {
    if (this.resourceController) throw new ServerError('controller is already made');

    this.resourceController = new ResourceController(this.name, this.getModel(), this.resourceModeler.getProperties());
    return this.resourceController;

  }

  public setValidations(validations: ResourceValidation<T>) {
    if (!this.resourceController) throw new ServerError('must make controller before setting validations');

    this.resourceValidator = new ResourceValidator<T>(this.name, this.getProperties(), validations);
    this.resourceController.setValidator(this.resourceValidator);

  }

  public addAction(action: ResourceRouterAction) {

    if (!this.resourceRouter) {
      this.resourceRouter = new ResourceRouter<T, TF>(this.name, this.resourceModeler.getProperties(), this.resourceController, this.resourceValidator);
    }

    this.resourceRouter.addAction(action);

  }

  public addRelation<U extends IResource, UF extends IResourceDocument>(relation: ResourceRelation) {

    if (!this.resourceRouter) {
      this.resourceRouter = new ResourceRouter<T, TF>(this.name, this.resourceModeler.getProperties(), this.resourceController, this.resourceValidator);
    }

    const relationModel = makeResourceRelationModel<UF>(this.name, relation);
    const relationController = new ResourceRelationController<U, UF>(this.name, relation.targetModelName, relationModel, relation);

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
