import { IBookBase } from './book-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { YEventManager } from '../../plugins/event-manager/event-manager';


const maker = new ResourceMaker<IBookBase>('Book');

maker.addProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    title: 'نام',
    titleable: true
  }
]);

export const BookModel      = maker.getModel();
export const BookController = maker.getController();

maker.setValidations({
  'name': [
    async (it, e) => it.name?.includes('Book') || e('name must have "Book"'),
    async (it, e) => it.name !== 'Test Book' || e('name must not be "Test Book"')
  ]
});

maker.addAction({
  path: '/test',
  method: 'GET',
  signal: ['Route', 'Book', 'Test'],
  dataProvider: async () => 'test'
});

YEventManager.on(['Route', 'Book', 'Metas'], async (_context) => {
  // a custom additional route handler
});

maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
  { template: 'RETRIEVE' },
  { template: 'CREATE' },
  { template: 'UPDATE' },
  { template: 'DELETE' }
]);

export const BookRouter = maker.getRouter();
