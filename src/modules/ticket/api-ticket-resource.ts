import { IApiTicket, IApiTicketBase, ITicketMessage } from './ticket-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { InvalidRequestError, InvalidStateError } from '../../global/errors';
import { TicketCategoryUserRelationController } from './ticket-category-resource';
import { extractFilterQueryObject, extractIncludeQueryObject, extractSortQueryObject } from '../../plugins/resource-maker/resource-router-util';
import { RESOURCE_ROUTER_LIST_LIMIT_MAX } from '../../plugins/resource-maker/config';
import { YEventManager } from '../../plugins/event-manager/event-manager';


const maker = new ResourceMaker<IApiTicketBase, IApiTicket>('ApiTicket');


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
    ref: 'ApiTicketCategory',
    required: true,
    title: 'دسته‌بندی'
  },
  {
    key: 'apiPermit',
    type: 'string',
    ref: 'ApiPermit',
    required: true,
    title: 'مجوز Api'
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
]);


export const ApiTicketModel      = maker.getModel();
export const ApiTicketController = maker.getController();


maker.setValidations({
  'title': [
    async (it, e) => it.title.length < 100 || e('عنوان باید کمتر از ۱۰۰ حرف داشته باشد.')
  ]
});


maker.addActions([
  { // list
    template: 'LIST',
    anyPermissions: ['admin.api-ticket.list', 'admin.api-ticket.manage'],
    dataProvider: async ({ user, hasPermission, query }) => {
      if (hasPermission('admin.api-ticket.list')) {
        return ApiTicketController.list({
          filters: extractFilterQueryObject(query.filters),
          sorts: extractSortQueryObject(query.sorts),
          includes: extractIncludeQueryObject(query.includes),
          selects: query.selects,
          limit: Math.min(parseInt((query.limit) || '0', 10) || 10, RESOURCE_ROUTER_LIST_LIMIT_MAX),
          skip: parseInt((query.skip) || '0', 10) || 0,
          lean: true
        });
      }
      else if (hasPermission('admin.api-ticket.manage')) {

        const permittedCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user!!._id })).map(it => it.ticketcategory);

        return ApiTicketController.list({
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
  { // list count
    template: 'LIST_COUNT',
    anyPermissions: ['admin.api-ticket.list-count', 'admin.api-ticket.manage'],
    dataProvider: async ({ user, hasPermission, query }) => {
      if (hasPermission('admin.api-ticket.list-count')) {
        return ApiTicketController.count({
          filters: extractFilterQueryObject(query.filters)
        })
      }
      else if (hasPermission('admin.api-ticket.manage')) {

        const permittedCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user!!._id })).map(it => it.ticketcategory);

        return ApiTicketController.count({
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
  { template: 'RETRIEVE', permissions: ['admin.api-ticket.retrieve'] },
  { template: 'CREATE', permissions: ['admin.api-ticket.create'] },
  { template: 'UPDATE', permissions: ['admin.api-ticket.update'] },
  { template: 'DELETE', permissions: ['admin.api-ticket.delete'] },
  {
    method: 'GET',
    path: '/mine/list',
    signal: ['Route', 'ApiTicket', 'GetMine'],
    permissionFunction: async ({ user }) => {
      return !!user;
    },
    dataProvider: async ({ user }) => {
      return ApiTicketController.list({
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
    signal: ['Route', 'ApiTicket', 'CreateMine'],
    permissionFunction: async ({ user }) => {
      return !!user;
    },
    payloadValidator: async ({ payload }) => {
      if (['category', 'apiPermit', 'title'].some(key => !payload[key])) {
        throw new InvalidRequestError('invalid payload.', 'داده ارسال شده کامل نیست.');
      }
    },
    dataProvider: async ({ user, payload }) => {

      return ApiTicketController.create({
        payload: {
          user: user!!._id,
          category: payload.category,
          apiPermit: payload.apiPermit,
          title: payload.title,
          status: 'pending',
        }
      });

    }
  },
  {
    method: 'PATCH',
    path: '/mine/:resourceId',
    signal: ['Route', 'ApiTicket', 'UpdateMine'],
    permissionFunction: async ({ user, resourceId, bag }) => {
      if (!user) return false;

      bag.ticket = await ApiTicketController.retrieve({ resourceId });
      return String(user?._id) === bag.ticket.user;

    },
    stateValidator: async ({ bag }) => {
      if (['archived', 'deleted'].includes(bag.ticket.status)) {
        throw new InvalidStateError('invalid status for update', 'تیکت حذف شده یا بایگانی شده قابل تغییر نیست.');
      }
    },
    payloadValidator: async ({ payload }) => {

      if (Object.keys(payload).some(key => key !== 'status')) {
        throw new InvalidRequestError('other than status supplied.', 'فقط وضعیت قابل تغییر است.');
      }

      if (!['archived', 'deleted', 'closed'].includes(payload.status)) {
        throw new InvalidRequestError('only archived and deleted is accepted as status.', 'فقط وضعیت های بسته شده، بایگانی شده و حذف شده مجاز هستند.');
      }

    },
    dataProvider: async ({ resourceId, payload }) => {
      return ApiTicketController.edit({
        resourceId,
        payload: {
          status: payload.status
        }
      });
    }
  }
]);


export const ApiTicketRouter = maker.getRouter();


YEventManager.on(['Resource', 'ApiTicketMessage', 'Created'], async (_ticketMessageId: string, ticketMessage: ITicketMessage) => {

  const ticket = await ApiTicketController.retrieve({ resourceId: ticketMessage.ticket });

  await ApiTicketController.edit({
    resourceId: ticket._id,
    payload: {
      status: (ticketMessage.user === ticket.user) ? ('pending') : ('answered'),
    },
  });

});