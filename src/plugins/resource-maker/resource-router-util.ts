import { ResourceRouterAction } from './resource-router-types';
import { ServerError, InvalidRequestError } from '../../global/errors';
import { ResourceController } from './resource-controller';
import { IResource } from './resource-model-types';
import { RESOURCE_ROUTER_LIST_LIMIT_MAX } from './config';
import { ResourceRelationController } from './resource-relation-controller';

const FILTER_OPERATORS: Record<string, string> = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '>': '$gt',
  '~=': '$regex'
};

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

export function extractFilterQueryObject(queryString: string) {

  // tslint:disable-next-line: no-any
  const result: any = {};

  if (!queryString) return result;

  const filtersParts = queryString.split(',');

  for (const part of filtersParts) {

    // tslint:disable-next-line: no-any prefer-const
    let [key, operator, value]: any = part.split(':');

    if (key === undefined) throw new InvalidRequestError(`filter invalid key '${key}'`);
    if (operator === undefined) throw new InvalidRequestError(`filter invalid operator '${operator}'`);
    if (value === undefined) throw new InvalidRequestError(`filter invalid value '${value}'`);

    if (value === 'Xtrue') value = true;
    if (value === 'Xfalse') value = false;
    if (value === 'Xnull') value = undefined;

    const filterOperator = FILTER_OPERATORS[operator];
    if (!filterOperator) throw new InvalidRequestError(`filter invalid operator '${operator}'`);

    if (filterOperator === '$regex') value = new RegExp(value, 'i');

    result[key] = { [FILTER_OPERATORS[operator]]: value };

  }

  return result;

}

export function extractIncludeQueryObject(queryString: string): Record<string, string> {
  return extractQueryObject(queryString, true);
}

export function populateAction<T extends IResource>(action: ResourceRouterAction, name: string, controller: ResourceController<T>) {
  if (action.template === 'LIST') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = '/';
    if (!action.signal) action.signal = ['Route', name, 'List']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => {
        if (request.query.single === 'true') {
          return controller.findOne({
            filters: extractFilterQueryObject(request.query.filters as string),
            sorts: extractSortQueryObject(request.query.sorts as string),
            includes: extractIncludeQueryObject(request.query.includes as string),
            selects: request.query.selects as string
          });
        }
        else {
          return controller.list({
            filters: extractFilterQueryObject(request.query.filters as string),
            sorts: extractSortQueryObject(request.query.sorts as string),
            includes: extractIncludeQueryObject(request.query.includes as string),
            selects: request.query.selects as string,
            limit: Math.min(parseInt((request.query.limit as string) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
            skip: parseInt((request.query.skip as string) || '0', 10) || 0
          });
        }
      };
    }

  }
  else if (action.template === 'LIST_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = '/count';
    if (!action.signal) action.signal = ['Route', name, 'Count']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.count({
        filters: extractFilterQueryObject(request.query.filters as string)
      });
    }

  }
  else if (action.template === 'RETRIEVE') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Retrieve']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request, resourceId }) => controller.retrieve({
        resourceId,
        includes: extractIncludeQueryObject(request.query.includes as string),
        selects: request.query.selects as string
      });
    }

  }
  else if (action.template === 'CREATE') {

    if (!action.method) action.method = 'POST';
    if (!action.path) action.path = '/';
    if (!action.signal) action.signal = ['Route', name, 'Create']

    if (!action.dataProvider) action.dataProvider = async ({ payload }) => controller.create({ payload });

  }
  else if (action.template === 'UPDATE') {

    if (!action.method) action.method = 'PATCH';
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Update']

    if (!action.dataProvider) {
      action.dataProvider = async ({ resourceId, payload }) => controller.edit({
        resourceId,
        payload
      });
    }

  }
  else if (action.template === 'DELETE') {

    if (!action.method) action.method = 'DELETE';
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Delete']

    if (!action.dataProvider) action.dataProvider = async ({ resourceId }) => controller.delete({ resourceId });

  }
  else {
    throw new ServerError('unknown action template!');
  }
}

export function populateRelationAction(action: ResourceRouterAction, controller: ResourceRelationController<IResource>, pluralTargetName: string) {
  if (action.template === 'LIST_ALL') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListAll'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.listAll({
        filters: extractFilterQueryObject(request.query.filters as string),
        sorts: extractSortQueryObject(request.query.sorts as string),
        includes: extractIncludeQueryObject(request.query.includes as string),
        selects: request.query.selects as string,
        limit: Math.min(parseInt((request.query.limit as string) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((request.query.skip as string) || '0', 10) || 0
      });
    }

  }
  else if (action.template === 'LIST_ALL_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListAllCount'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.countListAll({
        filters: extractFilterQueryObject(request.query.filters as string),
        limit: Math.min(parseInt((request.query.limit as string) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((request.query.skip as string) || '0', 10) || 0
      });
    }
  }
  else if (action.template === 'LIST') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.listForSource({
        sourceId: request.params.sourceId,
        filters: extractFilterQueryObject(request.query.filters as string),
        sorts: extractSortQueryObject(request.query.sorts as string),
        includes: extractIncludeQueryObject(request.query.includes as string),
        selects: request.query.selects as string,
        limit: Math.min(parseInt((request.query.limit as string) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((request.query.skip as string) || '0', 10) || 0
      });
    }

  }
  else if (action.template === 'LIST_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.countListForSource({
        sourceId: request.params.sourceId,
        filters: extractFilterQueryObject(request.query.filters as string)
      });
    }

  }
  else if (action.template === 'RETRIEVE') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelation({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        selects: request.query.selects as string
      });
    }

  }
  else if (action.template === 'RETRIEVE_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelationCount({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        filters: extractFilterQueryObject(request.query.filters as string)
      });
    }

  }
  else if (action.template === 'RETRIEVE_BY_ID') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelationId'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.retrieveRelation({
        relationId: request.params.relationId,
        includes: extractIncludeQueryObject(request.query.includes as string),
        selects: request.query.selects as string
      });
    }

  }
  else if (action.template === 'CREATE') {

    if (!action.method) action.method = 'POST';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CreateRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.addRelation({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        payload: request.body
      });
    }

  }
  else if (action.template === 'UPDATE') {

    if (!action.method) action.method = 'PATCH';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'UpdateRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request, payload }) => controller.updateRelation({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        relationId: request.params.relationId,
        payload: payload
      });
    }

  }
  else if (action.template === 'DELETE') {

    if (!action.method) action.method = 'DELETE';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'DeleteRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.removeRelation({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        relationId: request.params.relationId
      });
    }

  }
  else {
    throw new ServerError('unknown relation action template!');
  }
}
