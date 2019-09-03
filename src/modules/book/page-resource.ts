import { ResourceMaker } from '../../resource-maker/resource-maker';
import { Document } from 'mongoose';
import { ResourceActionTemplate } from '../../resource-maker/resource-router';

export interface IPage extends Document {
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

maker.setActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const { model: PageModel, controller: PageController, router: PageRouter } = maker.getMCR();

