import { ITicket, ITicketMessage, ITicketMessageBase } from './ticket-interfaces';
import { ResourceMaker } from '../../plugins/resource-maker/resource-maker';
import { TicketController } from './ticket-resource';
import { InvalidStateError } from '../../global/errors';
import { TicketCategoryUserRelationController } from './ticket-category-resource';


const maker = new ResourceMaker<ITicketMessageBase, ITicketMessage>('TicketMessage');


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
    key: 'ticket',
    type: 'string',
    ref: 'Ticket',
    required: true,
    title: 'تیکت',
    titleable: true
  },
  {
    key: 'body',
    type: 'string',
    required: true,
    title: 'متن',
    longText: true,
    hideInTable: true
  },
  {
    key: 'files',
    type: 'string',
    ref: 'Media',
    isArray: true,
    title: 'فایل‌ها',
    hideInTable: true
  }
]);


export const TicketMessageModel      = maker.getModel();
export const TicketMessageController = maker.getController();


maker.setValidations({
  'body': [
    async (it, e) => it.body.length < 300 || e('متن پیام باید کمتر از ۳۰۰ حرف داشته باشد.')
  ]
});


maker.addActions([
  { template: 'LIST', permissions: ['admin.ticket-message.list'] },
  { template: 'LIST_COUNT', permissions: ['admin.ticket-message.list-count'] },
  { template: 'RETRIEVE', permissions: ['admin.ticket-message.retrieve'] },
  { // create
    template: 'CREATE',
    permissionFunction: async ({ user, hasPermission, payload }) => {
      if (!user) return false;

      const ticket = await TicketController.retrieve({ resourceId: payload.ticket });
      if (ticket.user === String(user._id) && payload.user === String(user._id)) return true;

      if (hasPermission('admin.ticket-message.create')) return true;

      if (hasPermission('admin.ticket.manage')) {

        const permittedTicketCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user._id })).map(it => it.ticketcategory);
        const permittedTicketIds = (await TicketController.list({ filters: { category: { $in: permittedTicketCategoryIds } } })).map(it => it._id);

        return permittedTicketIds.includes(payload.ticket) && payload.user === String(user._id);

      }

      return false;

    },
    stateValidator: async ({ payload, bag }) => {

      bag.ticket = await TicketController.retrieve({ resourceId: payload.ticket });
      if (['archived', 'deleted'].includes(bag.ticket.status)) {
        throw new InvalidStateError('invalid ticket state.', 'تیکت در وضعیت مناسب برای پیام گذاشتن نیست.');
      }

    },
    postprocessor: async ({ user, bag }) => {

      const ticket = bag.ticket as ITicket;
      const isOwn = String(user!!._id) === ticket.user;

      await TicketController.edit({
        resourceId: ticket._id,
        payload: {
          status: isOwn ? 'pending' : 'answered'
        }
      });

    }
  },
  { template: 'UPDATE', permissions: ['admin.ticket-message.update'] },
  { template: 'DELETE', permissions: ['admin.ticket-message.delete'] },
  {
    method: 'GET',
    path: '/ticket/:ticketId',
    signal: ['Route', 'TicketMessage', 'ListForTicket'],
    permissionFunction: async ({ user, hasPermission, params: { ticketId }, bag }) => {
      if (!user) return false;

      bag.ticket = await TicketController.retrieve({
        resourceId: ticketId,
        includes: {
          'category': ''
        }
      });

      if (String(user._id) === bag.ticket.user) return true;

      if (hasPermission('admin.ticket-message.list')) return true;

      if (hasPermission('admin.ticket.manage')) {

        const permittedTicketCategoryIds = (await TicketCategoryUserRelationController.listForTarget({ targetId: user._id })).map(it => it.ticketcategory);
        const permittedTicketIds = (await TicketController.list({ filters: { category: { $in: permittedTicketCategoryIds } } })).map(it => it._id);

        return permittedTicketIds.includes(ticketId);

      }

      return false;

    },
    dataProvider: async ({ params: { ticketId }, bag }) => {
      return {
        ticket: bag.ticket || await TicketController.retrieve({
          resourceId: ticketId,
          includes: {
            'category': ''
          }
        }),
        messages: await TicketMessageController.list({
          filters: {
            ticket: ticketId
          },
          includes: {
            'user': '',
            'user.profile': '',
            'files': ''
          }
        })
      };
    }
  }
]);


export const TicketMessageRouter = maker.getRouter();
