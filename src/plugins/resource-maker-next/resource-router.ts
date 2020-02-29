import { ResourceRouterAction, ResourceRouterContext } from './resource-router-types';
import { Router, Request, Response } from 'express';
import { ServerError } from '../../global/errors';
import { ResourceActionMethod } from './resource-maker-router-enums';
import { YEventManager } from '../event-manager/event-manager';
import { ResourceModelProperty, IResource } from './resource-model-types';
import { populateAction, populateRelationAction } from './resource-router-util';
import { ResourceController } from './resource-controller';
import { ResourceRelation } from './resource-relation-types';
import { plural } from 'pluralize';
import { ResourceRelationController } from './resource-relation-controller';

export const DISMISS_DATA_PROVIDER = Symbol('dismiss data provider');
type RouterProcessor = (context: ResourceRouterContext) => Promise<void>;

export class ResourceRouter<T extends IResource> {

  private static preProcessors: RouterProcessor[] = [];
  private static preResponseProcessors: RouterProcessor[] = [];
  private static postProcessors: RouterProcessor[] = [];

  private actions: ResourceRouterAction[] = [];
  private relations: [ResourceRelation, ResourceRelationController<IResource>][] = [];
  private router?: Router = undefined;

  constructor(private name: string, private properties: ResourceModelProperty[], private controller: ResourceController<T>) {

  }

  public static addPreProcessor(processor: RouterProcessor) {
    ResourceRouter.preProcessors.push(processor);
  }

  public static addPreResponseProcessor(processor: RouterProcessor) {
    ResourceRouter.preResponseProcessors.push(processor);
  }

  public static addPostProcessor(processor: RouterProcessor) {
    ResourceRouter.postProcessors.push(processor);
  }

  private makeRouter() {

    this.router = Router();

    this.injectMetaAction();
    this.injectRelationsMetaAction();
    this.injectRelationsActions();
    this.injectMainActions();

  }

  private injectMetaAction() {

    const filteredProperties = this.properties.filter(property => !property.hidden);

    const metaAction: ResourceRouterAction = {
      signal: ['Route', this.name, 'Metas'],
      path: '/metas',
      method: ResourceActionMethod.GET,
      dataProvider: async () => filteredProperties
    };

    this.applyActionOnRouter(metaAction);

  }

  private injectMainActions() {
    for (const action of this.actions) {

      if ('template' in action) {
        populateAction(action, this.name, this.controller)
      }

      this.applyActionOnRouter(action);

    }
  }

  private injectRelationsMetaAction() {

    const relationsMeta = this.relations.map(r => ({
      targetModel: r[0].targetModelName,
      relationModelName: r[0].relationModelName,
      targetPropertyTitle: r[0].targetPropertyTitle,
      singular: r[0].singular,
      maxCount: r[0].maxCount,
      title: r[0].title,
      properties: r[0].properties?.filter(p => !p.hidden),
    }));

    this.applyActionOnRouter({
      signal: ['Route', this.name, 'Relations'],
      method: ResourceActionMethod.GET,
      path: '/relations',
      dataProvider: async () => relationsMeta
    });

  }

  private injectRelationsActions() {
    for (const [relation, relationController] of this.relations) {

      const pluralTargetName = plural(relation.relationModelName || relation.targetModelName);

      for (const relationAction of relation?.actions ?? []) {

        if ('template' in relationAction) {
          populateRelationAction(relationAction, relationController, pluralTargetName)
        }

        this.applyActionOnRouter(relationAction);

      }
    }
  }

  private applyActionOnRouter(action: ResourceRouterAction) {
    if (!action.path) throw new ServerError('action does not have path');
    if (!('method' in action)) throw new ServerError('action does not have method');
    if (!action.dataProvider) throw new ServerError('action does not have dataProvider');
    if (!action.signal) throw new ServerError('action does not have signal');
    if (this.router === undefined) throw new ServerError('router is not initialized');

    const actionHandler = async (context: ResourceRouterContext) => {
      try {

        for (const processor of ResourceRouter.preProcessors) await processor(context);

        context.data = await action.dataProvider?.(context);

        for (const processor of ResourceRouter.preResponseProcessors) await processor(context);

        if (context.data !== DISMISS_DATA_PROVIDER) {
          context.response.json(context.data);
        }

        for (const processor of ResourceRouter.postProcessors) await processor(context);

      }
      catch (error) {
        context.next(error);
      }
    }

    YEventManager.on(action.signal, actionHandler);

    const routerHandler = (request: Request, response: Response, next: Function) => {
      YEventManager.emit(action.signal ?? ['Route', 'NoSignal'], { action, request, response, next, payload: request.body });
    }

    switch (action.method) {
      case ResourceActionMethod.GET: this.router.get(action.path, routerHandler); break;
      case ResourceActionMethod.POST: this.router.post(action.path, routerHandler); break;
      case ResourceActionMethod.PATCH: this.router.patch(action.path, routerHandler); break;
      case ResourceActionMethod.PUT: this.router.put(action.path, routerHandler); break;
      case ResourceActionMethod.DELETE: this.router.delete(action.path, routerHandler); break;
      case ResourceActionMethod.HEAD: this.router.head(action.path, routerHandler); break;
      default: throw new ServerError('action method type invalid');
    }

  }

  public addAction(action: ResourceRouterAction) {
    if (this.router !== undefined) throw new ServerError('router is already made');

    this.actions.push(action);

  }

  public addRelation<U extends IResource>(relation: ResourceRelation, relationController: ResourceRelationController<U>) {
    if (this.router !== undefined) throw new ServerError('router is already made');

    this.relations.push([ relation, relationController ]);

  }

  public getRouter() {

    if (this.router === undefined) this.makeRouter();
    if (this.router === undefined) throw new ServerError('could not make router');

    return this.router;

  }

}
