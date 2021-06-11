import { IPage, IPageBase } from './book-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IPageBase, IPage>('Page');


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
    required: true,
    index: true,
    title: 'کتاب'
  }
]);


export const PageModel      = maker.getModel();
export const PageController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST', permissions: ['admin.page.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.page.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.page.retrieve'] },
  { template: 'CREATE', permissions: ['admin.page.create'] },
  { template: 'UPDATE', permissions: ['admin.page.update'] },
  { template: 'DELETE', permissions: ['admin.page.delete'] }
]);


export const PageRouter = maker.getRouter();
