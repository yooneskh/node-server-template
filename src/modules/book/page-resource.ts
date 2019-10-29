import { IResource, ResourceActionTemplate } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';

export interface IPage extends IResource {
  content: string;
}

const maker = new ResourceMaker<IPage>('Page');

maker.setProperties([
  {
    key: 'content',
    type: 'string'
  },
  {
    key: 'book',
    type: 'string',
    ref: 'Book'
  }
]);

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: PageModel, controller: PageController, router: PageRouter } = maker.getMCR();

