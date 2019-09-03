import { ResourceMaker } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceActionTemplate } from '../../resource-maker/resource-router';

export interface IBook extends Document {
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
