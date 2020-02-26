import { ResourceRouterAction } from './resource-router-types';
import { Router } from 'express';
import { ServerError } from '../../global/errors';

export class ResourceRouter {

  private actions: ResourceRouterAction[] = [];
  private router?: Router = undefined;

  constructor(private name: string) {

  }

  public addAction(action: ResourceRouterAction) {

    if (this.router !== undefined) throw new ServerError('router is already made');

    this.actions.push(action);

  }

  private makeRouter() {

  }

  public getRouter() {

    this.makeRouter();
    if (this.router === undefined) throw new ServerError('could not make router');

    return this.router;

  }

}
