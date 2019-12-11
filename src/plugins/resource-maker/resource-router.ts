import { Router, Request, Response } from 'express';
import { ResourceController } from './resource-controller';
import { ResourceRelationController } from './resource-relation-controller';
import { plural } from 'pluralize';
import { ResourceAction, ResourceProperty, ResourcePropertyMeta, IResource, ResourceActionBag, ResourceRouterMiddleware, ResourceRouterResponsedMiddleware, ResourceRelation } from './resource-maker-types';
import { InvalidRequestError, ServerError } from '../../global/errors';
import { Merge } from 'type-fest';
import { MAX_LISTING_LIMIT } from './config';
import { ResourceActionMethod, ResourceRelationActionTemplate, ResourceActionTemplate } from './resource-maker-enums';
import sortBy from 'lodash/sortBy'; //TODO: sort with this, sort relation prop metas too

export interface IRouterRelation {
  targetModelName: string;
  relationModelName?: string;
  controller: ResourceRelationController<IResource>;
  actions?: ResourceAction[];
}

export const DISMISS_DATA_PROVIDER = -485698569;

const preProcessors: ResourceRouterMiddleware[] = [];
const preResponseProcessors: ResourceRouterResponsedMiddleware[] = [];
const postProcessors: ResourceRouterResponsedMiddleware[] = [];


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

export function extractSortQueryObject(queryString: string): Record<string, number> {

  const result: Record<string, number> = {};

  const records = extractQueryObject(queryString);

  for (const key in records) {
    result[key] = parseInt(records[key] as string, 10);
  }

  return result;

}

export function extractFilterQueryObject(queryString: string): Record<string, string | boolean> { // TODO: add operator func to filters

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

export function extractIncludeQueryObject(queryString: string): Record<string, string> {
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
  result = sortBy(result, 'order');

  // TODO: restrict access
  applyActionOnRouter(router, {
    path: '/metas',
    method: ResourceActionMethod.GET,
    dataProvider: async () => result
  });

}

function injectRelationsInformation(router: Router, relations: ResourceRelation[]) {

  // tslint:disable-next-line: no-any
  let result: any[] = [];

  result = relations.map(relation => ({
    targetModel: relation.targetModelName,
    relationModelName: relation.relationModelName,
    title: relation.meta?.title,
    order: relation.meta?.order,
    properties: relation.properties?.map(property => ({
      ...(relation.meta?.propertiesMeta?.find(p => p.key === property.key)),
      ...property
    }))
  }));

  for (const row of result) {
    // tslint:disable-next-line: no-any
    row.properties = sortBy(row.properties?.filter((p: any) => !p.hidden), 'order')
  }

  result = sortBy(result, 'order');

  // TODO: restrict access
  applyActionOnRouter(router, {
    path: '/relations',
    method: ResourceActionMethod.GET,
    dataProvider: async () => result
  });

}

function injectResourceRelationActionTemplate(action: ResourceAction, controller: ResourceRelationController<IResource>, pluralTargetName: string) {
  if (action.template === ResourceRelationActionTemplate.LIST) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}`;

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.listForSource(
        request.params.sourceId,
        extractFilterQueryObject(request.query.filters),
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      );
    }

  }
  else if (action.template === ResourceRelationActionTemplate.LIST_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/count`;

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.countListForSource(
        request.params.sourceId,
        extractFilterQueryObject(request.query.filters)
      )
    }

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelation(
        request.params.sourceId,
        request.params.targetId,
        request.query.selects
      );
    }

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelationCount(
        request.params.sourceId,
        request.params.targetId,
        extractFilterQueryObject(request.query.filters)
      );
    }

  }
  else if (action.template === ResourceRelationActionTemplate.CREATE) {

    if (!action.method) action.method = ResourceActionMethod.POST;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    if (!action.dataProvider) action.dataProvider = async ({ request }) => controller.addRelation(request.params.sourceId, request.params.targetId, request.body)

  }
  else if (action.template === ResourceRelationActionTemplate.DELETE) {

    if (!action.method) action.method = ResourceActionMethod.DELETE;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.removeRelation(
        request.params.sourceId,
        request.params.targetId,
        extractFilterQueryObject(request.query.filters)
      )
    }

  }
  else {
    throw new ServerError('unknown relation action template!');
  }
}

function injectResourceTemplateOptions<T extends IResource>(action: ResourceAction, controller: ResourceController<T>) {
  if (action.template === ResourceActionTemplate.LIST) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/';

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.list(
        extractFilterQueryObject(request.query.filters),
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      );
    }

  }
  else if (action.template === ResourceActionTemplate.LIST_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/count';

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.count(
        extractFilterQueryObject(request.query.filters)
      );
    }

  }
  else if (action.template === ResourceActionTemplate.RETRIEVE) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/:resourceId';

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.singleRetrieve(
        request.params.resourceId,
        extractIncludeQueryObject(request.query.includes),
        request.query.selects
      );
    }

  }
  else if (action.template === ResourceActionTemplate.CREATE) {

    if (!action.method) action.method = ResourceActionMethod.POST;
    if (!action.path) action.path = '/';

    if (!action.dataProvider) action.dataProvider = async ({ request }) => controller.createNew(request.body);

  }
  else if (action.template === ResourceActionTemplate.UPDATE) {

    if (!action.method) action.method = ResourceActionMethod.PATCH;
    if (!action.path) action.path = '/:resourceId';

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.editOne(
        request.params.resourceId,
        request.body
      );
    }

  }
  else if (action.template === ResourceActionTemplate.DELETE) {

    if (!action.method) action.method = ResourceActionMethod.DELETE;
    if (!action.path) action.path = '/:resourceId';

    if (!action.dataProvider) action.dataProvider = async ({ request }) => controller.deleteOne(request.params.resourceId);

  }
  else {
    throw new ServerError('unknown action template!');
  }
}

function applyActionOnRouter(router: Router, action: ResourceAction) {

  if (!action.path) throw new ServerError('action path undefined');
  if (!action.dataProvider) throw new ServerError('action data provider undefined');

  const actionHandler = async (request: Request, response: Response, next: Function) => {
    try {

      const bag: ResourceActionBag = {
        action,
        request,
        response
      };

      for (const preProcessor of preProcessors) {
        await preProcessor(bag);
      }

      const data = action.dataProvider && await action.dataProvider(bag);

      for (const preResponseProcessor of preResponseProcessors) {
        await preResponseProcessor({ ...bag, data });
      }

      if (data !== DISMISS_DATA_PROVIDER) {
        response.json(data);
      }

      for (const postProcessor of postProcessors) {
        await postProcessor({ ...bag, data });
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
    case ResourceActionMethod.HEAD: router.head(action.path, actionHandler); break;
    default: throw new ServerError('unknown action method type');
  }

}

export function addResourceRouterPreProcessor(middleware: ResourceRouterMiddleware) {
  preProcessors.push(middleware)
}

export function addResourceRouterPreResponseProcessor(middleware: ResourceRouterResponsedMiddleware) {
  preResponseProcessors.push(middleware)
}

export function addResourceRouterPostProcessor(middleware: ResourceRouterResponsedMiddleware) {
  postProcessors.push(middleware)
}

export function scaffoldResourceRouter<T extends IResource>(resourceActions: ResourceAction[], relations: IRouterRelation[], resourceProperties: ResourceProperty[], resourceMetas: ResourcePropertyMeta[], originalRelations: ResourceRelation[], controller?: ResourceController<T>): Router {

  const resourceRouter = Router();

  injectMetaInformation(
    resourceRouter,
    resourceProperties,
    resourceMetas
  );

  injectRelationsInformation(resourceRouter, originalRelations);

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
