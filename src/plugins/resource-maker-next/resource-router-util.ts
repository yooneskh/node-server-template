import { ResourceRouterAction } from './resource-router-types';
import { ResourceActionTemplate, ResourceActionMethod } from './resource-maker-router-enums';
import { ServerError, InvalidRequestError } from '../../global/errors';
import { ResourceController } from './resource-controller';
import { IResource } from './resource-model-types';
import { RESOURCE_ROUTER_LIST_LIMIT_MAX } from './config';

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

    if (!action.dataProvider) action.dataProvider = async ({ request }) => controller.create({ payload: request.body });

  }
  else if (action.template === ResourceActionTemplate.UPDATE) {

    if (!action.method) action.method = ResourceActionMethod.PATCH;
    if (!action.path) action.path = '/:resourceId';
    if (!action.signal) action.signal = ['Route', name, 'Update']

    if (!action.dataProvider) {
      action.dataProvider = async ({ request }) => controller.edit({
        resourceId: request.params.resourceId,
        payload: request.body
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
