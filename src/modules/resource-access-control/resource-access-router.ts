import { ResourceActionTemplate } from '../../resource-maker/resource-maker-enums';
import { ResourceAction, IResource } from '../../resource-maker/resource-maker-types';
import { ServerError } from '../../global/errors';
import { PermittedResourceController } from './resource-access-controller';
import { extractFilterQueryObject, extractSortQueryObject, extractIncludeQueryObject } from '../../resource-maker/resource-router';
import { MAX_LISTING_LIMIT } from '../../resource-maker/config';
import { Request } from 'express';
import { getUserByToken } from '../auth/auth-resource';
import { ResourceController } from '../../resource-maker/resource-controller';
import { IPermit } from './resource-access-control-model';

async function getCurrentUserId(request: Request): Promise<string | undefined> {

  const token = request.headers.authorization;

  const user = await getUserByToken(token);

  return user?._id;

}

export function makePermittedRouteFromTemplate(template: ResourceActionTemplate, controller: PermittedResourceController<IResource>, permitController: ResourceController<IPermit>): ResourceAction {
  switch (template) {
    case ResourceActionTemplate.LIST: return {
      template,
      dataProvider: async ({ request }) => controller.listPermitted(
        await getCurrentUserId(request),
        permitController,
        extractFilterQueryObject(request.query.filters),
        extractSortQueryObject(request.query.sorts),
        extractIncludeQueryObject(request.query.includes),
        request.query.selects,
        Math.min(parseInt(request.query.limit || '0', 10) || 10, MAX_LISTING_LIMIT),
        parseInt(request.query.skip || '0', 10) || 0
      )
    }
    case ResourceActionTemplate.LIST_COUNT: return {
      template,
      dataProvider: async ({ request }) => controller.countPermitted(
        extractFilterQueryObject(request.query.filters)
      )
    }
    case ResourceActionTemplate.RETRIEVE: return {
      template,
      dataProvider: async ({ request }) => controller.singleRetrievePermitted(
        request.params.resourceId,
        extractIncludeQueryObject(request.query.includes),
        request.query.selects
      )
    }
    case ResourceActionTemplate.CREATE: return {
      template,
      dataProvider: async ({ request }) => controller.createNewPermitted(request.body)
    }
    case ResourceActionTemplate.UPDATE: return {
      template,
      dataProvider: async ({ request }) => controller.editOnePermitted(request.params.resourceId, request.body)
    }
    case ResourceActionTemplate.DELETE: return {
      template,
      dataProvider: async ({ request }) => controller.deleteOnePermitted(request.params.resourceId)
    }
    default: throw new ServerError('invalid resource action template');
  }
}
