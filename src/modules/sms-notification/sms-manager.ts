import { YEventManager } from '../../plugins/event-manager/event-manager';
import { sendMagfaSms } from '../../plugins/magfa-sms/magfa-agent';
import { Config } from '../../config/config';
import { IApiTicket, IApiTicketMessage, ITicket, ITicketMessage } from '../ticket/ticket-interfaces';
import { TicketController } from '../ticket/ticket-resource';
import { UserController } from '../user/user-resource';
import { ApiTicketController } from '../ticket/api-ticket-resource';
import { IApiRequest } from '../api/api-interfaces';
import { IFactor } from '../payment/payment-interfaces';
import { IConditionDocumentEntry } from '../condition/condition-interfaces';
import { IDataRequest } from '../data/data-interfaces';


YEventManager.on(['Resource', 'Ticket', 'Created'], async (_id: string, ticket: ITicket) => {

  const user = await UserController.retrieve({ resourceId: ticket.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست پشتیبانی شما ثبت شد. لطفا منتظر پاسخ از سمت کارشناسان ما باشید. در صورت پاسخ، با پیامک به شما اطلاع رسانی خواهد شد.

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
`شهروند گرامی، درخواست پشتیبانی شما ثبت شد. لطفا منتظر پاسخ از سمت کارشناسان ما باشید. در صورت پاسخ، با پیامک به شما اطلاع رسانی خواهد شد.

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


YEventManager.on(['Resource', 'ApiRequest', 'Created'], async (_id: string, apiRequest: IApiRequest) => {

  const user = await UserController.retrieve({ resourceId: apiRequest.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست شما ثبت شده است. تغییرات آن از طریق پیامک به اطلاع شما می رسد.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});

YEventManager.on(['Resource', 'ApiRequest', 'Updated'], async (_id: string, apiRequest: IApiRequest) => {

  const user = await UserController.retrieve({ resourceId: apiRequest.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست شما به‌روزرسانی شده است. برای مشاهده آن به پروفایل کاربری خود مراجعه کنید.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});


YEventManager.on(['Resource', 'DataRequest', 'Created'], async (_id: string, dataRequest: IDataRequest) => {

  const user = await UserController.retrieve({ resourceId: dataRequest.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست شما ثبت شده است. تغییرات آن از طریق پیامک به اطلاع شما می رسد.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});

YEventManager.on(['Resource', 'DataRequest', 'Updated'], async (_id: string, dataRequest: IDataRequest) => {

  const user = await UserController.retrieve({ resourceId: dataRequest.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، درخواست شما به‌روزرسانی شده است. برای مشاهده آن به پروفایل کاربری خود مراجعه کنید.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});

YEventManager.on(['Resource', 'Factor', 'Payed'], async (_id: string, factor: IFactor) => {

  if (!factor.user) {
    return;
  }

  const user = await UserController.retrieve({ resourceId: factor.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، پرداخت شما با مبلغ ${factor.amount.toLocaleString()} ریال با موفقیت انجام شد.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});

YEventManager.on(['Resource', 'ConditionDocumentEntry', 'Updated'], async (_id: string, conditionDocumentEntry: IConditionDocumentEntry) => {

  const user = await UserController.retrieve({ resourceId: conditionDocumentEntry.user });

  await sendMagfaSms({
    domain: Config.magfa.domain,
    username: Config.magfa.username,
    password: Config.magfa.password,
    sendNumber: Config.magfa.fromNumber,
    receivers: [user.phoneNumber],
    text: (
`شهروند گرامی، وضعیت مدارک ثبت شده شما تغییر کرد. شما می توانید وضعیت فعلی آن‌ها را در پروفایل کاربری خود مشاهده کنید.

سامانه مدیریت و انتشار داده‌های شهری`
    ),
  });

});
