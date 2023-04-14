import { IApiTicketCategory, IApiTicketCategoryBase } from './ticket-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<IApiTicketCategoryBase, IApiTicketCategory>('ApiTicketCategory');


maker.addProperties([
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'عنوان',
    titleable: true
  },
  {
    key: 'fields',
    type: 'string',
    isArray: true,
    title: 'فیلدها',
    items: [
      { value: 'nationalCode', text: 'کد ملی' },
      { value: 'postalCode', text: 'کد پستی' }
    ]
  }
]);


export const ApiTicketCategoryModel      = maker.getModel();
export const ApiTicketCategoryController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT', permissions: ['admin.api-ticket-category.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.api-ticket-category.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-ticket-category.create'] },
  { template: 'UPDATE', permissions: ['admin.api-ticket-category.update'] },
  { template: 'DELETE', permissions: ['admin.api-ticket-category.delete'] }
]);


export const ApiTicketCategoryRouter = maker.getRouter();
