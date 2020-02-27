import { ResourceRouterAction, ResourceRouterContext } from './resource-router-types';
import { Router, Request, Response } from 'express';
import { ServerError } from '../../global/errors';
import { ResourceActionMethod } from './resource-maker-router-enums';
import { YEventManager } from '../event-manager/event-manager';
import { ResourceModelProperty } from './resource-model-types';

export const DISMISS_DATA_PROVIDER = Symbol('dismiss data provider');
type RouterProcessor = (context: ResourceRouterContext) => Promise<void>;

export class ResourceRouter {

  private static preProcessors: RouterProcessor[] = [];
  private static preResponseProcessors: RouterProcessor[] = [];
  private static postProcessors: RouterProcessor[] = [];

  private actions: ResourceRouterAction[] = [];
  private router?: Router = undefined;

  constructor(private name: string, private properties: ResourceModelProperty[]) {

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
    // this.injectRelationsActions();
    // this.injectMainActions();

  }

  private injectMetaAction() {

    const filteredProperties = this.properties.filter(property => !property.hidden);

    const metaAction: ResourceRouterAction = {
      signal: ['Route', this.name, 'Metas'],
      path: '/metas',
      method: ResourceActionMethod.GET,
      dataProvider: () => filteredProperties
    };

    this.applyActionOnRouter(metaAction);

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

    const routerHandler = (request: Request, response: Response, next: Function) => YEventManager.emit(action.signal, { request, response, next });

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

  public getRouter() {

    this.makeRouter();
    if (this.router === undefined) throw new ServerError('could not make router');

    return this.router;

  }

}
