import { ResourceMaker } from '../../resource-maker/resource-maker';
import { ResourceActionTemplate } from '../../resource-maker/resource-router';
import { IResource } from '../../resource-maker/resource-maker-types';

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

maker.setActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: BookModel, controller: BookController, router: BookRouter } = maker.getMCR();
