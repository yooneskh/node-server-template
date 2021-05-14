import { ResourceRouterAction } from './resource-router-types';
import { ServerError, InvalidRequestError } from '../../global/errors';
import { ResourceController } from './resource-controller';
import { IResource, IResourceDocument } from './resource-model-types';
import { RESOURCE_ROUTER_LIST_LIMIT_MAX } from './config';
import { ResourceRelationController } from './resource-relation-controller';

// tslint:disable-next-line: no-any
function applyOperatorOnFilter(filter: any, key: string, operator: string, value: any) {
  switch (operator) {
    case '=':
      filter[key] = { $eq: value };
      break;
    case '!=':
      filter[key] = { $ne: value };
      break;
    case '<':
      filter[key] = { $lt: value };
      break;
    case '<=':
      filter[key] = { $lte: value };
      break;
    case '>':
      filter[key] = { $gt: value };
      break;
    case '>=':
      filter[key] = { $gte: value };
      break;
    case '~=':
      filter[key] = { $regex: new RegExp(value, 'i') };
      break;
    case '==':
      filter[key] = value;
      break;
    default: throw new InvalidRequestError(`filter invalid operator '${operator}'`);
  }
}

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
  if (!queryString) return {};

  // tslint:disable-next-line: no-any
  const result: any = {};
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

    applyOperatorOnFilter(result, key, operator, value);

  }

  return result;

}

export function extractIncludeQueryObject(queryString: string): Record<string, string> {
  return extractQueryObject(queryString, true);
}

export function populateAction<T extends IResource, TF extends IResourceDocument>(action: ResourceRouterAction, name: string, controller: ResourceController<T, TF>) {
  if (action.template === 'LIST') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = '/';
    if (!action.signal) action.signal = ['Route', name, 'List']

    if (!action.dataProvider) {
      action.dataProvider = async ({ query }) => {
        if (query.single === 'true') {
          return controller.findOne({
            filters: extractFilterQueryObject(query.filters),
            sorts: extractSortQueryObject(query.sorts),
            includes: extractIncludeQueryObject(query.includes),
            selects: query.selects,
            lean: true
          });
        }
        else {
          return controller.list({
            filters: extractFilterQueryObject(query.filters),
            sorts: extractSortQueryObject(query.sorts),
            includes: extractIncludeQueryObject(query.includes),
            selects: query.selects,
            limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
            skip: parseInt((query.skip) || '0', 10) || 0,
            lean: true
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
      action.dataProvider = async ({ query }) => controller.count({
        filters: extractFilterQueryObject(query.filters)
      });
    }

  }
  else if (action.template === 'RETRIEVE') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Retrieve']

    if (!action.dataProvider) {
      action.dataProvider = async ({ query, resourceId }) => controller.retrieve({
        resourceId,
        includes: extractIncludeQueryObject(query.includes),
        selects: query.selects,
        lean: true
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

export function populateRelationAction(action: ResourceRouterAction, controller: ResourceRelationController<IResource, IResourceDocument>, pluralTargetName: string) {
  if (action.template === 'LIST_ALL') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListAll'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ query }) => controller.listAll({
        filters: extractFilterQueryObject(query.filters),
        sorts: extractSortQueryObject(query.sorts),
        includes: extractIncludeQueryObject(query.includes),
        selects: query.selects,
        limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((query.skip) || '0', 10) || 0,
        lean: true
      });
    }

  }
  else if (action.template === 'LIST_ALL_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListAllCount'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ query }) => controller.countListAll({
        filters: extractFilterQueryObject(query.filters),
        limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((query.skip) || '0', 10) || 0
      });
    }

  }
  else if (action.template === 'LIST') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, query }) => controller.listForSource({
        sourceId: params.sourceId,
        filters: extractFilterQueryObject(query.filters),
        sorts: extractSortQueryObject(query.sorts),
        includes: extractIncludeQueryObject(query.includes),
        selects: query.selects,
        limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt((query.skip) || '0', 10) || 0,
        lean: true
      });
    }

  }
  else if (action.template === 'LIST_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, query }) => controller.countListForSource({
        sourceId: params.sourceId,
        filters: extractFilterQueryObject(query.filters)
      });
    }

  }
  else if (action.template === 'RETRIEVE') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, query }) => controller.getSingleRelation({
        sourceId: params.sourceId,
        targetId: params.targetId,
        selects: query.selects,
        lean: true
      });
    }

  }
  else if (action.template === 'RETRIEVE_COUNT') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, query }) => controller.getSingleRelationCount({
        sourceId: params.sourceId,
        targetId: params.targetId,
        filters: extractFilterQueryObject(query.filters)
      });
    }

  }
  else if (action.template === 'RETRIEVE_BY_ID') {

    if (!action.method) action.method = 'GET';
    if (!action.path) action.path = `/${pluralTargetName}/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelationId'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, query }) => controller.retrieveRelation({
        relationId: params.relationId,
        includes: extractIncludeQueryObject(query.includes),
        selects: query.selects,
        lean: true
      });
    }

  }
  else if (action.template === 'CREATE') {

    if (!action.method) action.method = 'POST';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CreateRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, payload }) => controller.addRelation({
        sourceId: params.sourceId,
        targetId: params.targetId,
        payload
      });
    }

  }
  else if (action.template === 'UPDATE') {

    if (!action.method) action.method = 'PATCH';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'UpdateRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params, payload }) => controller.updateRelation({
        sourceId: params.sourceId,
        targetId: params.targetId,
        relationId: params.relationId,
        payload
      });
    }

  }
  else if (action.template === 'DELETE') {

    if (!action.method) action.method = 'DELETE';
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'DeleteRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ params }) => controller.removeRelation({
        sourceId: params.sourceId,
        targetId: params.targetId,
        relationId: params.relationId
      });
    }

  }
  else {
    throw new ServerError('unknown relation action template!');
  }
}
