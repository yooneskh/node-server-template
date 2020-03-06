import { IPageBase } from '../modules-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../plugins/resource-maker/resource-maker-router-enums';


const maker = new ResourceMaker<IPageBase>('Page');

maker.addProperties([
  {
    key: 'content',
    type: 'string',
    required: true,
    title: 'محتوی',
    titleable: true,
  },
  {
    key: 'book',
    type: 'string',
    ref: 'Book',
    title: 'کتاب'
  }
]);

export const PageModel      = maker.getModel();
export const PageController = maker.getController();


maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const PageRouter = maker.getRouter();
