import { ITicket, ITicketBase, ITicketCategory } from './ticket-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError, InvalidStateError } from '../../global/errors';
import { TicketCategoryController, TicketCategoryUserRelationController } from './ticket-category-resource';
import { extractFilterQueryObject, extractIncludeQueryObject, extractSortQueryObject } from '../../plugins/resource-maker/resource-router-util';
import { RESOURCE_ROUTER_LIST_LIMIT_MAX } from '../../plugins/resource-maker/config';


const maker = new ResourceMaker<ITicketBase, ITicket>('Ticket');


maker.addProperties([
  {
    key: 'user',
    type: 'string',
    ref: 'User',
    required: true,
    title: 'کاربر',
    titleable: true
  },
  {
    key: 'category',
    type: 'string',
    ref: 'TicketCategory',
    required: true,
    title: 'دسته‌بندی'
  },
  {
    key: 'title',
    type: 'string',
    required: true,
    title: 'موضوع',
    titleable: true
  },
  {
    key: 'status',
    type: 'string',
    enum: ['pending', 'answered', 'closed', 'archived', 'deleted'],
    required: true,
    title: 'وضعیت',
    items: [
      { value: 'pending', text: 'در انتظار پاسخ' },
      { value: 'answered', text: 'پاسخ داده شده' },
      { value: 'closed', text: 'بسته شده' },
      { value: 'archived', text: 'بایگانی' },
      { value: 'deleted', text: 'حذف شده' }
    ]
  },
  {
    key: 'informations',
    type: 'series',
    serieBase: {},
    serieSchema: [
      {
        key: 'type',
        type: 'string',
        enum: ['nationalCode', 'postalCode'],
        required: true,
        title: 'نوع',
        items: [
          { value: 'nationalCode', text: 'کد ملی' },
          { value: 'postalCode', text: 'کد پستی' }
        ],
        width: 6
      },
      {
        key: 'value',
        type: 'string',
        required: true,
        title: 'مقدار',
        width: 6
      }
    ],
    title: 'اطلاعات',
    hideInTable: true
  }
]);


export const TicketModel      = maker.getModel();
export const TicketController = maker.getController();


maker.setValidations({
  'title': [
    async (it, e) => it.title.length < 100 || e('عنوان باید کمتر از ۱۰۰ حرف داشته باشد.')
  ]
});


maker.addActions([
  { // list
    template: 'LIST',
    anyPermissions: ['admin.ticket.list', 'admin.ticket.manage'],
    dataProvider: async ({ user, userHasAllPermissions, query }) => {
      if (userHasAllPermissions(['admin.ticket.list'])) {
        return TicketController.list({
          filters: extractFilterQueryObject(query.filters),
          sorts: extractSortQueryObject(query.sorts),
          includes: extractIncludeQueryObject(query.includes),
          selects: query.selects,
          limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
          skip: parseInt((query.skip) || '0', 10) || 0,
          lean: true
        })
      }
      else if (userHasAllPermissions(['admin.ticket.manage'])) {

        const permittedCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user!!._id })).map(it => it.ticketcategory);

        return TicketController.list({
          filters: {
            ...extractFilterQueryObject(query.filters),
            category: { $in: permittedCategoryIds }
          },
          sorts: extractSortQueryObject(query.sorts),
          includes: extractIncludeQueryObject(query.includes),
          selects: query.selects,
          limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
          skip: parseInt((query.skip) || '0', 10) || 0,
          lean: true
        });

      }
      else {
        throw new InvalidRequestError('دسترسی شما اشکال دارد.');
      }
    }
  },
  { // list
    template: 'LIST_COUNT',
    anyPermissions: ['admin.ticket.list-count', 'admin.ticket.manage'],
    dataProvider: async ({ user, userHasAllPermissions, query }) => {
      if (userHasAllPermissions(['admin.ticket.list-count'])) {
        return TicketController.count({
          filters: extractFilterQueryObject(query.filters)
        })
      }
      else if (userHasAllPermissions(['admin.ticket.manage'])) {

        const permittedCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user!!._id })).map(it => it.ticketcategory);

        return TicketController.count({
          filters: {
            ...extractFilterQueryObject(query.filters),
            category: { $in: permittedCategoryIds }
          }
        });

      }
      else {
        throw new InvalidRequestError('دسترسی شما اشکال دارد.');
      }
    }
  },
  { template: 'RETRIEVE', permissions: ['admin.ticket.retrieve'] },
  { template: 'CREATE', permissions: ['admin.ticket.create'] },
  { template: 'UPDATE', permissions: ['admin.ticket.update'] },
  { template: 'DELETE', permissions: ['admin.ticket.delete'] },
  {
    method: 'GET',
    path: '/mine/list',
    signal: ['Route', 'Ticket', 'GetMine'],
    permissions: ['user.ticket.list'],
    dataProvider: async ({ user }) => {
      return TicketController.list({
        filters: {
          user: user!!._id
        },
        includes: {
          'user': '',
          'category': ''
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/mine',
    signal: ['Route', 'Ticket', 'CreateMine'],
    permissions: ['user.ticket.create'],
    payloadValidator: async ({ payload, bag }) => {

      if (['category', 'title', 'informations'].some(key => !payload[key])) {
        throw new InvalidRequestError('invalid payload.', 'داده ارسال شده کامل نیست.');
      }

      const category = await TicketCategoryController.retrieve({ resourceId: payload.category });

      if (category.fields.some(field => !payload.informations.find?.((info: { type: string }) => info.type === field)?.value)) {
        throw new InvalidRequestError('invalid informations', 'اطلاعات شامل همه قسمت ها نیست.');
      }

      bag.category = category;

    },
    dataProvider: async ({ user, payload, bag }) => {

      const category = bag.category as ITicketCategory;

      return TicketController.create({
        payload: {
          user: user!!._id,
          category: payload.category,
          title: payload.title,
          status: 'pending',
          informations: payload.informations.filter((info: { type: string }) => category.fields.includes(info.type))
        }
      });

    }
  },
  {
    method: 'PATCH',
    path: '/mine/:resourceId',
    signal: ['Route', 'Ticket', 'UpdateMine'],
    permissions: ['user.ticket.update'],
    permissionFunction: async ({ user, resourceId, bag }) => {
      bag.ticket = await TicketController.retrieve({ resourceId });
      return String(user?._id) === bag.ticket.user;
    },
    stateValidator: async ({ bag }) => {
      if (['archived', 'deleted'].includes(bag.ticket.status)) {
        throw new InvalidStateError('invalid status for update', 'وضعیت برای تغییر مناسب نیست.');
      }
    },
    payloadValidator: async ({ payload }) => {

      if (Object.keys(payload).some(key => key !== 'status')) {
        throw new InvalidRequestError('other than status supplied.', 'فقط وضعیت قابل تغییر است.');
      }

      if (!['archived', 'deleted'].includes(payload.status)) {
        throw new InvalidRequestError('only archived and deleted is accepted as status.', 'وضعیت ارسال شده غیر مجاز است.');
      }

    },
    dataProvider: async ({ resourceId, payload }) => {
      return TicketController.edit({
        resourceId,
        payload: {
          status: payload.status
        }
      });
    }
  }
]);


export const TicketRouter = maker.getRouter();
