import { IResource, ResourceActionTemplate } from '../../resource-maker/resource-maker-types';
import { ResourceMaker } from '../../resource-maker/resource-maker';

export interface IBook extends IResource {
  name: string;
  page: string;
}

const maker = new ResourceMaker<IBook>('Book');

maker.setProperties([
  {
    key: 'name',
    type: 'string'
  },
  {
    key: 'page',
    type: 'string',
    ref: 'Page'
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

export const { model: BookModel, controller: BookController, router: BookRouter } = maker.getMCR();
