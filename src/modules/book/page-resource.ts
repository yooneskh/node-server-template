import { IResource } from '../../plugins/resource-maker/resource-maker-types';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-enums';
import { PermittedResourceController } from '../../plugins/resource-access-control/resource-access-controller';
import { createResourcePermitResource } from '../../plugins/resource-access-control/resource-access-control-model';

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

maker.setMetas([
  {
    key: 'content',
    title: 'محتوی',
    titleAble: true,
    order: 1
  },
  {
    key: 'book',
    title: 'کتاب',
    order: 2
  }
]);

export const { model: PageModel, controller: PageController } = maker.getMC();

export const PagePermittedController = new PermittedResourceController<IPage>(maker.getName(), PageModel, maker.getProperties(), false);
export const { model: PagePermitModel, controller: PagePermitController, router: PagePermitRouter } = createResourcePermitResource(maker.getName());

maker.addActions([
  // { ...makePermittedRouteFromTemplate(ResourceActionTemplate.LIST, PagePermittedController, PagePermitController) },
  // { ...makePermittedRouteFromTemplate(ResourceActionTemplate.LIST_COUNT, PagePermittedController, PagePermitController) },
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const PageRouter = maker.getRouter();
