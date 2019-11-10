import { IResource } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../resource-maker/resource-maker-enums';
import { makePermittedRouteFromTemplate } from '../resource-access-control/resource-access-router';
import { PermittedResourceController } from '../resource-access-control/resource-access-controller';

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

export const PagePermittedController = new PermittedResourceController<IPage>(maker.getName(), PageModel, maker.getProperties());

maker.addActions([
  { ...makePermittedRouteFromTemplate(ResourceActionTemplate.LIST, PagePermittedController) },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const PageRouter = maker.getRouter();
