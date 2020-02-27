import { ResourceRouterAction, ResourceRouterContext } from './resource-router-types';
import { Router, Request, Response } from 'express';
import { ServerError } from '../../global/errors';
import { ResourceActionMethod } from './resource-maker-router-enums';
import { YEventManager } from '../event-manager/event-manager';

export class ResourceRouter {

  private actions: ResourceRouterAction[] = [];
  private router?: Router = undefined;

  constructor(private name: string) {

  }

  private makeRouter() {

    this.router = Router();

    this.injectMetaAction();
    // this.injectRelationsActions();
    // this.injectMainActions();

  }

  private injectMetaAction() {

    const metaAction: ResourceRouterAction = {
      signal: ['Route', this.name, 'Metas'],
      path: '/metas',
      method: ResourceActionMethod.GET,
      dataProvider: () => 'hi'
    };

    this.applyActionOnRouter(metaAction);

  }

  private applyActionOnRouter(action: ResourceRouterAction) {

    if (!action.path || !('method' in action) || !action.dataProvider) throw new ServerError('action is not complete');
    if (this.router === undefined) throw new ServerError('router is not initialized');

    const actionHandler = async (context: ResourceRouterContext) => {
      return context.response.send( await action.dataProvider(context) ); // TODO: do this!
    }

    YEventManager.on(action.signal, actionHandler);

    const routerHandler = (request: Request, response: Response) => YEventManager.emit(action.signal, { request, response });

    if (action.method === ResourceActionMethod.GET) {
      this.router.get(action.path, routerHandler);
    }
    else if (action.method === ResourceActionMethod.HEAD) {
      this.router.get(action.path, routerHandler);
    }
    else if (action.method === ResourceActionMethod.POST) {
      this.router.get(action.path, routerHandler);
    }
    else if (action.method === ResourceActionMethod.PUT) {
      this.router.get(action.path, routerHandler);
    }
    else if (action.method === ResourceActionMethod.PATCH) {
      this.router.get(action.path, routerHandler);
    }
    else if (action.method === ResourceActionMethod.DELETE) {
      this.router.get(action.path, routerHandler);
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
