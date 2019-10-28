import { Router, Request, Response } from 'express';
import { ResourceController } from './resource-controller';
import { ResourceRelationController } from './resource-relation-controller';
import { plural } from 'pluralize';
import { ResourceAction, ResourceProperty, ResourcePropertyMeta, IResource, IRouterRelation, ResourceActionMethod, ResourceActionTemplate, ResourceRelationActionTemplate, ResourceActionBag, ResourceRouterMiddleware } from './resource-maker-types';
import { InvalidRequestError, ServerError } from '../global/errors';
import { Merge } from 'type-fest';
import { MAX_LISTING_LIMIT } from './config';

const preProcessors: ResourceRouterMiddleware[] = [];
const postProcessors: ResourceRouterMiddleware[] = [];


function extractQueryObject(queryString: string, nullableValues = false): Record<string, string> {

  const result: Record<string, string> = {};

  if (!queryString) return result;

  const parts = queryString.split(',');

  for (const part of parts) {

    const [key, value] = part.split(':');

    if (!key) throw new InvalidRequestError(`query object invalid key '${key}'`);
    if (!nullableValues && !value) throw new InvalidRequestError(`query object invalid value '${key}':'${value}'`);

    result[key] = value;

  }

  return result;

}

function extractSortQueryObject(queryString: string): Record<string, number> {

  const result: Record<string, number> = {};

  const records = extractQueryObject(queryString);

  for (const key in records) {
    result[key] = parseInt(records[key] as string, 10);
  }

  return result;

}

function extractFilterQueryObject(queryString: string): Record<string, string | boolean> {

  const result: Record<string, string | boolean> = {};

  const records = extractQueryObject(queryString);

  for (const key in records) {
    if (records[key] === 'Xtrue') {
      result[key] = true;
    }
    else if (records[key] === 'Xfalse') {
      result[key] = false;
    }
    else {
      result[key] = records[key];
    }
  }

  return result;

}

function extractIncludeQueryObject(queryString: string): Record<string, string> {
  return extractQueryObject(queryString, true);
}

function injectMetaInformation(router: Router, properties: ResourceProperty[], metas: ResourcePropertyMeta[]) {

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

  applyActionOnRouter(router, {
    path: '/meta',
    method: ResourceActionMethod.GET,
    async action({ request, response }) {
      response.json(result);
    }
  });

}

function injectResourceRelationActionTemplate(action: ResourceAction, controller: ResourceRelationController<IResource>, pluralTargetName: string) {
  if (action.template === ResourceRelationActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}`;

    action.action = async ({ request, response }) => response.json(
      controller.listForSource(
        request.params.sourceId,
        extractFilterQueryObject(request.query.filters), // TODO: add operator func to filters
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      )
    );

  }
  else if (action.template === ResourceRelationActionTemplate.LIST_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/count`;

    action.action = async ({ request, response }) => response.json(
      controller.countListForSource(request.params.sourceId)
    );

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.action = async ({ request, response }) => response.json(
      controller.getSingleRelation(request.params.sourceId, request.params.targetId, request.query.selects)
    );

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;

    action.action = async ({ request, response }) => response.json(
      controller.getSingleRelationCount(request.params.sourceId, request.params.targetId)
    );

  }
  else if (action.template === ResourceRelationActionTemplate.CREATE) {

    action.method = ResourceActionMethod.POST;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.action = async ({ request, response }) => response.json(
      controller.addRelation(request.params.sourceId, request.params.targetId, request.body)
    );

  }
  else if (action.template === ResourceRelationActionTemplate.DELETE) {

    action.method = ResourceActionMethod.DELETE;
    action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    action.action = async ({ request, response }) => response.json(
      controller.removeRelation(request.params.sourceId, request.params.targetId)
    );

  }
  else {
    throw new ServerError('unknown relation action template!');
  }
}

function injectResourceTemplateOptions<T extends IResource>(action: ResourceAction, controller: ResourceController<T>) {
  if (action.template === ResourceActionTemplate.LIST) {

    action.method = ResourceActionMethod.GET;
    action.path = '/';

    action.action = async ({ request, response }) => response.json(
      controller.list(
        extractFilterQueryObject(request.query.filters), // TODO: add operator func to filters
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      )
    );

  }
  else if (action.template === ResourceActionTemplate.LIST_COUNT) {

    action.method = ResourceActionMethod.GET;
    action.path = '/count';

    action.action = async ({ request, response }) => response.json(
      controller.count(
        extractFilterQueryObject(request.query.filters) // TODO: add operator func to filters
      )
    );

  }
  else if (action.template === ResourceActionTemplate.RETRIEVE) {

    action.method = ResourceActionMethod.GET;
    action.path = '/:resourceId';

    action.action = async ({ request, response }) => response.json(
      controller.singleRetrieve(
        request.params.resourceId,
        extractIncludeQueryObject(request.query.includes),
        request.query.selects
      )
    );

  }
  else if (action.template === ResourceActionTemplate.CREATE) {

    action.method = ResourceActionMethod.POST;
    action.path = '/';

    action.action = async ({ request, response }) => response.json(
      controller.createNew(
        request.body
      )
    );

  }
  else if (action.template === ResourceActionTemplate.UPDATE) {

    action.method = ResourceActionMethod.PATCH;
    action.path = '/:resourceId';

    action.action = async ({ request, response }) => response.json(
      controller.editOne(
        request.params.resourceId,
        request.body
      )
    );

  }
  else if (action.template === ResourceActionTemplate.DELETE) {

    action.method = ResourceActionMethod.DELETE;
    action.path = '/:resourceId';

    action.action = async ({ request, response }) => response.json(
      controller.deleteOne(
        request.params.resourceId
      )
    );

  }
  else {
    throw new ServerError('unknown action template!');
  }
}

function applyActionOnRouter(router: Router, action: ResourceAction) {

  if (!action.path) throw new ServerError('action path undefined');
  if (!action.action) throw new ServerError('action function undefined');

  const actionHandler = async (request: Request, response: Response, next: Function) => {
    try {

      const bag: ResourceActionBag = {
        request,
        response
      };

      for (const preProcessor of preProcessors) {
        await preProcessor(bag);
      }

      action.action && await action.action(bag);

      for (const postProcessor of postProcessors) {
        await postProcessor(bag);
      }

    }
    catch (error) {
      next(error);
    }
  };

  switch (action.method) {
    case ResourceActionMethod.GET: router.get(action.path, actionHandler); break;
    case ResourceActionMethod.POST: router.post(action.path, actionHandler); break;
    case ResourceActionMethod.PATCH: router.patch(action.path, actionHandler); break;
    case ResourceActionMethod.PUT: router.put(action.path, actionHandler); break;
    case ResourceActionMethod.DELETE: router.delete(action.path, actionHandler); break;
    default: throw new ServerError('unknown action method type');
  }

}

export function addResourceRouterPreProcessor(middleware: ResourceRouterMiddleware) {
  preProcessors.push(middleware)
}

export function addResourceRouterPostProcessor(middleware: ResourceRouterMiddleware) {
  postProcessors.push(middleware)
}

export function scaffoldResourceRouter<T extends IResource>(resourceActions: ResourceAction[], relations: IRouterRelation[], resourceProperties: ResourceProperty[], resourceMetas: ResourcePropertyMeta[], controller?: ResourceController<T>): Router {

  const resourceRouter = Router();

  injectMetaInformation(
    resourceRouter,
    resourceProperties,
    resourceMetas
  );

  for (const action of resourceActions || []) {

    if ('template' in action) {
      if (controller === undefined) throw new ServerError('resource controller is not defined!');
      injectResourceTemplateOptions(action, controller);
    }

    applyActionOnRouter(resourceRouter, action);

  }

  for (const relation of relations) {

    const pluralTargetName = plural(relation.relationModelName || relation.targetModelName);

    for (const action of relation.actions || []) {

      if ('template' in action) {
        injectResourceRelationActionTemplate(action, relation.controller, pluralTargetName);
      }

      applyActionOnRouter(resourceRouter, action);

    }

  }

  return resourceRouter;

}
