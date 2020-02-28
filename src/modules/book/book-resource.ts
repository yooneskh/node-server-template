import { IResource } from '../../plugins/resource-maker-next/resource-model-types';
import { ResourceMaker } from '../../plugins/resource-maker-next/resource-maker';
import { ResourceActionMethod, ResourceActionTemplate } from '../../plugins/resource-maker-next/resource-maker-router-enums';
import { YEventManager } from '../../plugins/event-manager/event-manager';

export interface IBook extends IResource {
  name: string;
  page: string;
}

const maker = new ResourceMaker<IBook>('Book');

maker.addProperties([
  {
    key: 'name',
    type: 'string',
    title: 'نام',
    titleable: true
  }
]);

export const BookModel      = maker.getModel();
export const BookController = maker.getController();

maker.addAction({
  path: '/test',
  method: ResourceActionMethod.GET,
  signal: ['Route', 'Book', 'Test'],
  dataProvider: async () => 'test'
});

YEventManager.on(['Route', 'Book', 'Metas'], (context) => {
  console.log('custom metas handler', context.request.path);
});

maker.addActions([
  { template: ResourceActionTemplate.LIST },
  { template: ResourceActionTemplate.LIST_COUNT },
  { template: ResourceActionTemplate.RETRIEVE },
  { template: ResourceActionTemplate.CREATE },
  { template: ResourceActionTemplate.UPDATE },
  { template: ResourceActionTemplate.DELETE }
]);

export const BookRouter = maker.getRouter();
