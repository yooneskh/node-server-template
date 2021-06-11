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
  { template: 'LIST' },
  { template: 'LIST_COUNT' },
  { template: 'RETRIEVE' },
  { template: 'CREATE' },
  { template: 'UPDATE' },
  { template: 'DELETE' }
]);


export const PageRouter = maker.getRouter();
