import { YEventManager } from '../../plugins/event-manager/event-manager';
import { sendMagfaSms } from '../../plugins/magfa-sms/magfa-agent';
import { Config } from '../../config/config';
import { IApiTicket, IApiTicketMessage, ITicket, ITicketMessage } from '../ticket/ticket-interfaces';
import { TicketController } from '../ticket/ticket-resource';
import { UserController } from '../user/user-resource';
import { ApiTicketController } from '../ticket/api-ticket-resource';


YEventManager.on(['Resource', 'Ticket', 'Created'], async (_id: string, ticket: ITicket) => {

  const user = await UserController.retrieve({ resourceId: ticket.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست پشتیبانی شما ثبت شد. لطفا مننتشر پاسخ از سمت کارشناسان ما باشید. در صورت پاسخ، با پیامک به شما اطلاع رسانی خواهد شد.

سامانه مدیریت و انتشار داده‌های شهری`
    )
  });

});

YEventManager.on(['Resource', 'TicketMessage', 'Created'], async (_id: string, ticketMessage: ITicketMessage) => {

  const ticket = await TicketController.retrieve({ resourceId: ticketMessage.ticket });
  const user = await UserController.retrieve({ resourceId: ticket.user });

  if (String(ticketMessage.user) === String(ticket.user)) {
    return;
  }


  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`پاسخی برای درخواست پشتیبانی شما ارسال شده است. لطفا به پنل کاربری خود در سامانه مراجعه کنید.

سامانه مدیریت و انتشار داده‌های شهری`
    )
  });

});


YEventManager.on(['Resource', 'ApiTicket', 'Created'], async (_id: string, apiTicket: IApiTicket) => {

  const user = await UserController.retrieve({ resourceId: apiTicket.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست پشتیبانی شما ثبت شد. لطفا مننتشر پاسخ از سمت کارشناسان ما باشید. در صورت پاسخ، با پیامک به شما اطلاع رسانی خواهد شد.

سامانه مدیریت و انتشار داده‌های شهری`
    )
  });

});

YEventManager.on(['Resource', 'ApiTicketMessage', 'Created'], async (_id: string, apiTicketMessage: IApiTicketMessage) => {

  const apiTicket = await ApiTicketController.retrieve({ resourceId: apiTicketMessage.ticket });
  const user = await UserController.retrieve({ resourceId: apiTicket.user });

  if (String(apiTicketMessage.user) === String(apiTicket.user)) {
    return;
  }


  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`پاسخی برای درخواست پشتیبانی شما ارسال شده است. لطفا به پنل کاربری خود در سامانه مراجعه کنید.

سامانه مدیریت و انتشار داده‌های شهری`
    )
  });

});
