import { ResourceRouterAction } from './resource-router-types';
import { Router, request, response } from 'express';
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
    this.injectRelationsActions();
    this.injectMainActions();

  }

  private injectMetaAction() {

    const metaAction: ResourceRouterAction = {
      path: '/metas',
      method: ResourceActionMethod.GET,
      dataProvider: () => 'hi'
    };

    this.applyActionOnRouter(metaAction);

  }

  private applyActionOnRouter(action: ResourceRouterAction) {

    if (!action.path || !('method' in action) || !action.dataProvider) throw new ServerError('action is not complete');
    if (this.router === undefined) throw new ServerError('router is not initialized');

    const actionHandler = () => {

    }

    if (action.method === ResourceActionMethod.GET) {
      this.router.get(action.path, (request, response) => {
        YEventManager.emit(action.signal, { request, response });
      });
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
