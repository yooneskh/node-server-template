import { ResourceActionTemplate } from '../../resource-maker/resource-maker-enums';
import { ResourceAction, IResource } from '../../resource-maker/resource-maker-types';
import { ServerError } from '../../global/errors';
import { PermittedResourceController } from './resource-access-controller';
import { extractFilterQueryObject, extractSortQueryObject, extractIncludeQueryObject } from '../../resource-maker/resource-router';
import { MAX_LISTING_LIMIT } from '../../resource-maker/config';

export function makePermittedRouteFromTemplate(template: ResourceActionTemplate, controller: PermittedResourceController<IResource>): ResourceAction {
  switch (template) {
    case ResourceActionTemplate.LIST: return {
      dataProvider: async ({ request }) => controller.list(
        extractFilterQueryObject(request.query.filters),
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      )
    }
    case ResourceActionTemplate.LIST_COUNT: return {
      dataProvider: async ({ request }) => controller.count(
        extractFilterQueryObject(request.query.filters)
      )
    }
    case ResourceActionTemplate.RETRIEVE: return {
      dataProvider: async ({ request }) => controller.singleRetrieve(
        request.params.resourceId,
        extractIncludeQueryObject(request.query.includes),
        request.query.selects
      )
    }
    case ResourceActionTemplate.CREATE: return {
      dataProvider: async ({ request }) => controller.createNew(request.body)
    }
    case ResourceActionTemplate.UPDATE: return {
      dataProvider: async ({ request }) => controller.editOne(request.params.resourceId, request.body)
    }
    case ResourceActionTemplate.DELETE: return {
      dataProvider: async ({ request }) => controller.deleteOne(request.params.resourceId)
    }
    default: throw new ServerError('invalid resource action template');
  }
}
