import { IBook, IBookBase } from './book-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { YEventManager } from '../../plugins/event-manager/event-manager';


const maker = new ResourceMaker<IBookBase, IBook>('Book');


maker.addProperties([
  {
    key: 'name',
    type: 'string',
    required: true,
    enum: ['My Book', 'Your Book'],
    title: 'نام',
    titleable: true,
    items: [
      { value: 'My Book', text: 'Book that is mine' },
      { value: 'Your Book', text: 'Book that is yours' }
    ]
  }
]);


maker.setCompoundIndexes([
  { 'name': 1, 'book': -1 },
  {
    indexes: { 'book': 1, 'name': -1 },
    options: { unique: true }
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


maker.addActions([
  { template: 'LIST', permissions: ['admin.book.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.book.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.book.retrieve'] },
  { template: 'CREATE', permissions: ['admin.book.create'] },
  { template: 'UPDATE', permissions: ['admin.book.update'] },
  { template: 'DELETE', permissions: ['admin.book.delete'] }
]);


export const BookRouter = maker.getRouter();


YEventManager.on(['Route', 'Book', 'Metas'], async (_context) => {
  // a custom additional route handler
});
