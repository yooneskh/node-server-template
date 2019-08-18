import { Router } from 'express';
import { ResourceController } from './resource-controller';
import { Document } from 'mongoose';
import { sanitizeRequestFormat } from '../global/sanitizers';
import { ResourceRelationController } from './resource-relation-controller';
import { plural } from 'pluralize';

interface IRouterRelation {
  targetModelName: string,
  relationModelName?: string;
  controller: ResourceRelationController
}

function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
}

function extractQueryObject(queryString: string, nullableValues = false): Record<string, string | number> {

  const result: Record<string, string | number> = {};

  if (!queryString) return result;

  const parts = queryString.split(',');

  for (const part of parts) {

    const [key, value] = part.split(':');

    if (!key) throw new Error(`query object invalid key '${key}'`);
    if (!nullableValues && !value) throw new Error(`query object invalid value '${key}':'${value}'`);

    if (isNumeric(value)) {
      result[key] = parseFloat(value);
    }
    else {
      result[key] = value;
    }

  }

  return result;

}

function applyRelationController(router: Router, relation: IRouterRelation) {

  const pluralTargetName = plural(relation.relationModelName || relation.targetModelName);

  router.get(`/:sourceId/${pluralTargetName}`, async (request, response) => {
    response.json(await relation.controller.listForSource(request.params.sourceId));
  });

  router.get(`/:sourceId/${pluralTargetName}/:targetId`, async (request, response) => {
    response.json(await relation.controller.getSingleRelation(request.params.sourceId, request.params.targetId));
  });

  router.post(`/:sourceId/${pluralTargetName}/:targetId`, async (request, response) => {
    response.json(await relation.controller.addRelation(request.params.sourceId, request.params.targetId, request.body.payload));
  });

  router.delete(`/:sourceId/${pluralTargetName}/:targetId`, async (request, response) => {
    response.json(await relation.controller.removeRelation(request.params.sourceId, request.params.targetId));
  });

}

export function makeResourceRouter<T extends Document>(
  {
    resourceName,
    controller,
    relations
  }: {
    resourceName: string,
    controller: ResourceController<T>,
    relations: IRouterRelation[]
  }
): Router {

  const ResourceRouter = Router();

  ResourceRouter.get('/', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.list({
        filters: extractQueryObject(request.query.filters), // TODO: add operator func to filters
        sorts: extractQueryObject(request.query.sorts),
        includes: extractQueryObject(request.query.includes, true)
      }));
    });
  });

  ResourceRouter.post('/', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.createNew({
        payload: request.body.payload
      }));
    });
  });

  ResourceRouter.put('/:resourceId', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.editOne({
        id: request.params.resourceId,
        payload: request.body.payload
      }));
    });
  });

  ResourceRouter.delete('/:resourceId', (request, response, next) => {
    sanitizeRequestFormat(request, response, next, undefined, async () => {
      response.json(await controller.deleteOne({
        id: request.params.resourceId
      }));
    });
  });

  for (const relation of relations) {
    applyRelationController(ResourceRouter, relation)
  }

  return ResourceRouter;

}
