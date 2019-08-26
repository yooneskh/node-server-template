import { Router, Request, Response } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';
import { ResourceRelationController } from './resource-relation-controller';
import { plural } from 'pluralize';
import { getUserByTokenSilent } from '../modules/user/user-controller';
import { IUser } from '../modules/user/user-model';
import { ResourceAction } from './resource-maker-types';

export enum ResourceActionMethod {
  POST,
  GET,
  PUT,
  DELETE
}

export enum ResourceActionTemplate {
  LIST,
  RETRIEVE,
  CREATE,
  UPDATE,
  DELETE
}

export enum ResourceRelationActionTemplate {
  LIST,
  RETRIEVE,
  CREATE,
  DELETE
}

interface IRouterRelation {
  targetModelName: string,
  relationModelName?: string;
  controller: ResourceRelationController,
  actions?: ResourceAction[]
}

function extractQueryObject(queryString: string, nullableValues = false): Record<string, string | number> {

  const result: Record<string, string | number> = {};

  if (!queryString) return result;

  const parts = queryString.split(',');

  for (const part of parts) {

    const [key, value] = part.split(':');

    if (!key) throw new Error(`query object invalid key '${key}'`);
    if (!nullableValues && !value) throw new Error(`query object invalid value '${key}':'${value}'`);

    result[key] = value;

  }

  return result;

}

function injectResourceRelationActionTemplate(action: ResourceAction, controller: ResourceRelationController, pluralTargetName: string) {
  if (action.template === ResourceRelationActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}`;

    action.dataProvider = async (request, response, user) => controller.listForSource(request.params.sourceId);

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.dataProvider = async (request, response, user) => controller.getSingleRelation(request.params.sourceId, request.params.targetId);

  }
  else if (action.template === ResourceRelationActionTemplate.CREATE) {

    action.method = ResourceActionMethod.POST;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.dataProvider = async (request, response, user) => controller.addRelation(request.params.sourceId, request.params.targetId, request.body.payload);

  }
  else if (action.template === ResourceRelationActionTemplate.DELETE) {

    action.method = ResourceActionMethod.DELETE;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.dataProvider = async (request, response, user) => controller.removeRelation(request.params.sourceId, request.params.targetId);

  }
}

function applyRelationController(router: Router, relation: IRouterRelation) {

  const pluralTargetName = plural(relation.relationModelName || relation.targetModelName);

  for (const action of relation.actions || []) {

    injectResourceRelationActionTemplate(action, relation.controller, pluralTargetName);

    applyActionOnRouter({
      action,
      router
    });

  }

}

function checkUserPermission(permissions: string[], permission: string): boolean {
  throw new Error('not implemented!');
}

function injectResourceTemplateOptions<T extends Document>(action: ResourceAction, controller: ResourceController<T>) {
  if (action.template === ResourceActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = '/';

    action.dataProvider = async (request, response, user) => controller.list({
      filters: extractQueryObject(request.query.filters), // TODO: add operator func to filters
      sorts: extractQueryObject(request.query.sorts),
      includes: extractQueryObject(request.query.includes, true)
    });

  }
  else if (action.template === ResourceActionTemplate.RETRIEVE) {
    throw new Error('not implemented!');
  }
  else if (action.template === ResourceActionTemplate.CREATE) {

    action.method = ResourceActionMethod.POST;
    action.path = '/';

    action.dataProvider = async (request, response, user) => controller.createNew({
      payload: request.body.payload
    });

  }
  else if (action.template === ResourceActionTemplate.UPDATE) {

    action.method = ResourceActionMethod.PUT;
    action.path = '/:resourceId';

    action.dataProvider = async (request, response, user) => controller.editOne({
      id: request.params.resourceId,
      payload: request.body.payload
    });

  }
  else if (action.template === ResourceActionTemplate.DELETE) {

    action.method = ResourceActionMethod.DELETE;
    action.path = '/:resourceId';

    action.dataProvider = async (request, response, user) => controller.deleteOne({
      id: request.params.resourceId
    });

  }
  else {
    throw new Error('unknown action template!');
  }
}

function applyActionOnRouter({ router, action }: { router: Router, action: ResourceAction }) {

  if (!action.path) throw new Error('action path undefined');

  // tslint:disable-next-line: no-any
  const actionHandler = async (request: Request, response: Response, next: (reason: any) => void) => {
    try {

      let user: IUser | undefined;
      const payload = request.body.payload;

      const needToLoadUser = action.permission || action.permissionFunction || action.permissionFunctionStrict || action.payloadPreprocessor || action.payloadPostprocessor;

      if (needToLoadUser) {
        user = await getUserByTokenSilent(request.body.token);;
      }

      if (action.permission && (!user || !user.permissions || !checkUserPermission(user.permissions, action.permission))) {
        throw new Error('forbidden access');
      }

      if ( action.permissionFunction && !(await action.permissionFunction(user)) ) {
        throw new Error('forbidden access');
      }

      if ( action.permissionFunctionStrict && ( !user || !(await action.permissionFunctionStrict(user)) ) ) {
        throw new Error('forbidden access');
      }

      if (action.payloadValidator && !(await action.payloadValidator(payload)) ) {
        throw new Error('invalid payload');
      }

      if (action.payloadPreprocessor) {

        const shouldBypass = await action.payloadPreprocessor(payload, user);

        if (shouldBypass) {
          return console.log('bypassed action');
        }

      }

      if (action.action) {
        await action.action(request, response, user);
      }
      else if (action.dataProvider) {
        response.json(await action.dataProvider(request, response, user));
      }

      if (action.payloadPostprocessor) {
        await action.payloadPostprocessor(payload, user);
      }

    }
    catch (error) {
      next(error);
    }

  };

  switch (action.method) {
    case ResourceActionMethod.GET: router.get(action.path, actionHandler); break;
    case ResourceActionMethod.POST: router.post(action.path, actionHandler); break;
    case ResourceActionMethod.PUT: router.put(action.path, actionHandler); break;
    case ResourceActionMethod.DELETE: router.delete(action.path, actionHandler); break;
    default: throw new Error('impossible action method type');
  }

}

export function scaffoldResourceRouter<T extends Document>(
  {
    resourceActions,
    controller,
    relations
  }: {
    resourceActions?: ResourceAction[],
    controller: ResourceController<T>,
    relations: IRouterRelation[]
  }
): Router {

  const resourceRouter = Router();

  for (const action of resourceActions || []) {

    injectResourceTemplateOptions(action, controller);

    applyActionOnRouter({
      router: resourceRouter,
      action: action
    });

  }

  for (const relation of relations) {
    applyRelationController(resourceRouter, relation)
  }

  return resourceRouter;

}
