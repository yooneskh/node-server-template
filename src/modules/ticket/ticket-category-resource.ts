import { ITicketCategory, ITicketCategoryBase, ITicketCategoryUser, ITicketCategoryUserBase } from './ticket-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';


const maker = new ResourceMaker<ITicketCategoryBase, ITicketCategory>('TicketCategory');


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


export const TicketCategoryModel      = maker.getModel();
export const TicketCategoryController = maker.getController();


maker.setValidations({ });


maker.addActions([
  { template: 'LIST' },
  { template: 'LIST_COUNT', permissions: ['admin.ticket-category.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.ticket-category.retrieve'] },
  { template: 'CREATE', permissions: ['admin.ticket-category.create'] },
  { template: 'UPDATE', permissions: ['admin.ticket-category.update'] },
  { template: 'DELETE', permissions: ['admin.ticket-category.delete'] }
]);


export const { model: TicketCategoryUserRelationModel, controller: TicketCategoryUserRelationController } = maker.addRelation<ITicketCategoryUserBase, ITicketCategoryUser>({
  targetModelName: 'User',
  title: 'دسترسی کاربران',
  sourcePropertyTitle: 'دسته‌بندی',
  targetPropertyTitle: 'کاربر',
  properties: [ ],
  actions: [
    { template: 'LIST_ALL' },
    { template: 'LIST_ALL_COUNT' },
    { template: 'RETRIEVE_BY_ID' },
    { template: 'LIST' },
    { template: 'LIST_COUNT' },
    { template: 'RETRIEVE' },
    { template: 'RETRIEVE_COUNT' },
    { template: 'CREATE' },
    { template: 'UPDATE' },
    { template: 'DELETE' }
  ]
});


export const TicketCategoryRouter = maker.getRouter();
