import { ResourceRouterAction } from './resource-router-types';
import { ResourceActionTemplate, ResourceActionMethod, ResourceRelationActionTemplate } from './resource-maker-router-enums';
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

function extractSortQueryObject(queryString: string): Record<string, number> {

  const result: Record<string, number> = {};

  const records = extractQueryObject(queryString);

  for (const key in records) {
    result[key] = parseInt(records[key] as string, 10);
  }

  return result;

}

function extractFilterQueryObject(queryString: string) {

  // tslint:disable-next-line: no-any
  const result: any = {};

  if (!queryString) return result;

  const filtersParts = queryString.split(',');

  for (const part of filtersParts) {

    // tslint:disable-next-line: no-any prefer-const
    let [key, operator, value]: any = part.split(':');

    // tslint:disable-next-line: strict-type-predicates
    if (key === undefined) throw new InvalidRequestError(`filter invalid key '${key}'`);
    // tslint:disable-next-line: strict-type-predicates
    if (operator === undefined) throw new InvalidRequestError(`filter invalid operator '${operator}'`);
    // tslint:disable-next-line: strict-type-predicates
    if (value === undefined) throw new InvalidRequestError(`filter invalid value '${value}'`);

    if (value === 'Xtrue') value = true;
    if (value === 'Xfalse') value = false;

    const filterOperator = FILTER_OPERATORS[operator];

    if (!filterOperator) throw new InvalidRequestError(`filter invalid operator '${operator}'`);

    if (filterOperator === '$regex') value = new RegExp(value, 'i');

    result[key] = { [FILTER_OPERATORS[operator]]: value };

  }

  return result;

}

function extractIncludeQueryObject(queryString: string): Record<string, string> {
  return extractQueryObject(queryString, true);
}

export function populateAction<T extends IResource>(action: ResourceRouterAction, name: string, controller: ResourceController<T>) {
  if (action.template === ResourceActionTemplate.LIST) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/';
    if (!action.signal) action.signal = ['Route', name, 'List']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.list({
        filters: extractFilterQueryObject(request.query.filters),
        sorts: extractSortQueryObject(request.query.sorts),
        includes: extractIncludeQueryObject(request.query.includes),
        selects: request.query.selects,
        limit: Math.min(parseInt(request.query.limit || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt(request.query.skip || '0', 10) || 0
      });
    }

  }
  else if (action.template === ResourceActionTemplate.LIST_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/count';
    if (!action.signal) action.signal = ['Route', name, 'Count']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.count({
        filters: extractFilterQueryObject(request.query.filters)
      });
    }

  }
  else if (action.template === ResourceActionTemplate.RETRIEVE) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Retrieve']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.retrieve({
        resourceId: request.params.resourceId,
        includes: extractIncludeQueryObject(request.query.includes),
        selects: request.query.selects
      });
    }

  }
  else if (action.template === ResourceActionTemplate.CREATE) {

    if (!action.method) action.method = ResourceActionMethod.POST;
    if (!action.path) action.path = '/';
    if (!action.signal) action.signal = ['Route', name, 'Create']

    if (!action.dataProvider) action.dataProvider = async ({ request, payload }) => controller.create({ payload });

  }
  else if (action.template === ResourceActionTemplate.UPDATE) {

    if (!action.method) action.method = ResourceActionMethod.PATCH;
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Update']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request, payload }) => controller.edit({
        resourceId: request.params.resourceId,
        payload
      });
    }

  }
  else if (action.template === ResourceActionTemplate.DELETE) {

    if (!action.method) action.method = ResourceActionMethod.DELETE;
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Delete']

    if (!action.dataProvider) action.dataProvider = async ({ request }) => controller.delete({ resourceId: request.params.resourceId });

  }
  else {
    throw new ServerError('unknown action template!');
  }
}

export function populateRelationAction(action: ResourceRouterAction, controller: ResourceRelationController<IResource>, pluralTargetName: string) {
  if (action.template === ResourceRelationActionTemplate.LIST_ALL) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListAll'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.listAll({
        filters: extractFilterQueryObject(request.query.filters),
        sorts: extractSortQueryObject(request.query.sorts),
        includes: extractIncludeQueryObject(request.query.includes),
        selects: request.query.selects,
        limit: Math.min(parseInt(request.query.limit || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt(request.query.skip || '0', 10) || 0
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.LIST) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'ListSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.listForSource({
        sourceId: request.params.sourceId,
        filters: extractFilterQueryObject(request.query.filters),
        sorts: extractSortQueryObject(request.query.sorts),
        includes: extractIncludeQueryObject(request.query.includes),
        selects: request.query.selects,
        limit: Math.min(parseInt(request.query.limit || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
        skip: parseInt(request.query.skip || '0', 10) || 0
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.LIST_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountSource'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.countListForSource({
        sourceId: request.params.sourceId,
        filters: extractFilterQueryObject(request.query.filters)
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelation({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        selects: request.query.selects
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE_COUNT) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/:sourceId/${pluralTargetName}/:targetId/count`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'CountRelation'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.getSingleRelationCount({
        sourceId: request.params.sourceId,
        targetId: request.params.targetId,
        filters: extractFilterQueryObject(request.query.filters)
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.RETRIEVE_BY_ID) {

    if (!action.method) action.method = ResourceActionMethod.GET;
    if (!action.path) action.path = `/${pluralTargetName}/:relationId`;
    if (!action.signal) action.signal = ['Route', pluralTargetName, 'RetrieveRelationId'];

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.retrieveRelation({
        relationId: request.params.relationId,
        includes: extractIncludeQueryObject(request.query.includes),
        selects: request.query.selects
      });
    }

  }
  else if (action.template === ResourceRelationActionTemplate.CREATE) {

    if (!action.method) action.method = ResourceActionMethod.POST;
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
  else if (action.template === ResourceRelationActionTemplate.UPDATE) {

    if (!action.method) action.method = ResourceActionMethod.PATCH;
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
  else if (action.template === ResourceRelationActionTemplate.DELETE) {

    if (!action.method) action.method = ResourceActionMethod.DELETE;
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
