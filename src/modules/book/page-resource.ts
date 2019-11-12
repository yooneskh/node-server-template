import { IResource } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../resource-maker/resource-maker-enums';
import { makePermittedRouteFromTemplate } from '../resource-access-control/resource-access-router';
import { PermittedResourceController } from '../resource-access-control/resource-access-controller';
import { createResourcePermitResource } from '../resource-access-control/resource-access-control-model';

export interface IPage extends IResource {
  content: string;
}

const maker = new ResourceMaker<IPage>('Page');

maker.setProperties([
  {
    key: 'content',
    type: 'string',
    required: true
  },
  {
    key: 'book',
    type: 'string',
    ref: 'Book'
  }
]);

export const { model: PageModel, controller: PageController } = maker.getMC();

export const PagePermittedController = new PermittedResourceController<IPage>(maker.getName(), PageModel, maker.getProperties(), false);
export const { model: PagePermitModel, controller: PagePermitController, router: PagePermitRouter } = createResourcePermitResource(maker.getName());

maker.addActions([
  { ...makePermittedRouteFromTemplate(ResourceActionTemplate.LIST, PagePermittedController, PagePermitController) },
  { ...makePermittedRouteFromTemplate(ResourceActionTemplate.LIST_COUNT, PagePermittedController, PagePermitController) },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const PageRouter = maker.getRouter();
