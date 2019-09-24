import { Router, Request, Response } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';
import { ResourceRelationController } from './resource-relation-controller';
import { plural } from 'pluralize';
import { ResourceAction, ResourceProperty, ResourcePropertyMeta } from './resource-maker-types';
import { InvalidRequestError, ServerError, ForbiddenAccessError } from '../global/errors';
import { IUser, UserController } from '../modules/user/user-resource';
import { Merge } from 'type-fest';

export enum ResourceActionMethod {
  POST,
  GET,
  PUT,
  DELETE
}

export enum ResourceActionTemplate {
  LIST,
  LIST_COUNT,
  RETRIEVE,
  CREATE,
  UPDATE,
  DELETE
}

export enum ResourceRelationActionTemplate {
  LIST,
  LIST_COUNT,
  RETRIEVE,
  RETRIEVE_COUNT,
  CREATE,
  DELETE
}

interface IRouterRelation {
  targetModelName: string,
  relationModelName?: string;
  controller: ResourceRelationController,
  actions?: ResourceAction[]
}

function injectMetaInformation({ router, properties, metas }: { router: Router, properties: ResourceProperty[], metas: ResourcePropertyMeta[] }) {

  // tslint:disable-next-line: no-any
  let result: Merge<ResourcePropertyMeta, ResourceProperty>[] = [];

  for (const property of properties) {
    result.push({
      ...(metas.find(meta => meta.key === property.key)),
      ...property
    });
  }

  result = result.filter(item => !item.hidden);

  result.sort((item1, item2) => {
    if (item1.order === undefined) {
      return 1;
    }
    else if (item2.order === undefined) {
      return -1;
    }
    else {
      return item1.order - item2.order;
    }
  });

  applyActionOnRouter({
    router,
    action: {
      path: '/meta',
      method: ResourceActionMethod.GET,
      dataProvider: async () => result
    }
  });

}

function extractQueryObject(queryString: string, nullableValues = false) {

  const result: Record<string, string | number | boolean> = {};

  if (!queryString) return result;

  const parts = queryString.split(',');

  for (const part of parts) {

    const [key, value] = part.split(':');

    if (!key) throw new InvalidRequestError(`query object invalid key '${key}'`);
    if (!nullableValues && !value) throw new InvalidRequestError(`query object invalid value '${key}':'${value}'`);

    result[key] = value === '+true' ? true : (value === '-false' ? false : value);

  }

  return result;

}

function injectResourceRelationActionTemplate(action: ResourceAction, controller: ResourceRelationController, pluralTargetName: string) {
  if (action.template === ResourceRelationActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}`;

    action.dataProvider = async (request, response, user) => controller.listForSource({
      sourceId: request.params.sourceId,
      filters: extractQueryObject(request.query.filters), // TODO: add operator func to filters
      sorts: extractQueryObject(request.query.sorts),
      includes: extractQueryObject(request.query.includes, true),
      selects: request.query.selects
    });

  }
  else if (action.template === ResourceRelationActionTemplate.LIST_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/count`;

    action.dataProvider = async (request, response, user) => controller.countListForSource(request.params.sourceId);

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.dataProvider = async (request, response, user) => controller.getSingleRelation(request.params.sourceId, request.params.targetId, request.query.selects);

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;

    action.dataProvider = async (request, response, user) => controller.getSingleRelationCount(request.params.sourceId, request.params.targetId);

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

    if ('template' in action) {
      injectResourceRelationActionTemplate(action, relation.controller, pluralTargetName);
    }

    applyActionOnRouter({
      action,
      router
    });

  }

}

function checkUserPermission(permissions: string[], permission: string): boolean {
  throw new ServerError('not implemented!');
}

function injectResourceTemplateOptions<T extends Document>(action: ResourceAction, controller: ResourceController<T>) {
  if (action.template === ResourceActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = '/';

    action.dataProvider = async (request, response, user) => controller.list({
      filters: extractQueryObject(request.query.filters), // TODO: add operator func to filters
      sorts: extractQueryObject(request.query.sorts),
      includes: extractQueryObject(request.query.includes, true),
      selects: request.query.selects
    });

  }
  else if (action.template === ResourceActionTemplate.LIST_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = '/count';

    action.dataProvider = async (request, response, user) => controller.count({
      filters: extractQueryObject(request.query.filters) // TODO: add operator func to filters
    });

  }
  else if (action.template === ResourceActionTemplate.RETRIEVE) {

    action.method = ResourceActionMethod.GET;
    action.path = '/:resourceId';

    action.dataProvider = async (request, response, user) => controller.singleRetrieve({
      resourceId: request.params.resourceId,
      includes: extractQueryObject(request.query.includes, true),
      selects: request.query.selects
    });

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
    throw new ServerError('unknown action template!');
  }
}

function applyActionOnRouter({ router, action }: { router: Router, action: ResourceAction }) {

  if (!action.path) throw new ServerError('action path undefined');

  // tslint:disable-next-line: no-any
  const actionHandler = async (request: Request, response: Response, next: (reason: any) => void) => {
    try {

      let user: IUser | undefined;
      const payload = request.body.payload;

      const needToLoadUser = action.permission || action.permissionFunction || action.permissionFunctionStrict || action.payloadPreprocessor || action.payloadPostprocessor;

      if (needToLoadUser) {
        user = (await UserController.list({ filters: { token: request.body.token } }))[0];
      }

      if (action.permission && (!user || !user.permissions || !checkUserPermission(user.permissions, action.permission))) {
        throw new ForbiddenAccessError('forbidden access');
      }

      if ( action.permissionFunction && !(await action.permissionFunction(user)) ) {
        throw new ForbiddenAccessError('forbidden access');
      }

      if ( action.permissionFunctionStrict && ( !user || !(await action.permissionFunctionStrict(user)) ) ) {
        throw new ForbiddenAccessError('forbidden access');
      }

      if (action.payloadValidator && !(await action.payloadValidator(payload)) ) {
        throw new InvalidRequestError('payload validation failed');
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

        const data = await action.dataProvider(request, response, user);

        if (action.responsePreprocessor) {
          await action.responsePreprocessor(data, user)
        }

        response.json(data);

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
    default: throw new ServerError('unknown action method type');
  }

}

export function scaffoldResourceRouter<T extends Document>({ resourceActions, controller, relations, resourceProperties, resourceMetas }: { resourceActions?: ResourceAction[], controller: ResourceController<T>, relations: IRouterRelation[], resourceProperties: ResourceProperty[], resourceMetas: ResourcePropertyMeta[] }): Router {

  const resourceRouter = Router();

  injectMetaInformation({
    router: resourceRouter,
    properties: resourceProperties,
    metas: resourceMetas
  });

  for (const action of resourceActions || []) {

    if ('template' in action) {
      injectResourceTemplateOptions(action, controller);
    }

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
