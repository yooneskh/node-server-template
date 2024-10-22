import { YEventManager } from '../../plugins/event-manager/event-manager';
import { IUser } from '../user/user-interfaces';
import { triggerTelegramWebhook } from '../../plugins/telegram-ifttt-sender/telegram-ifttt-sender';

YEventManager.on(['Resource', 'User', 'Created'], async (_userId: string, user: IUser) => {
  triggerTelegramWebhook(
    '---',
    `<p>New User Created</p><pre>${JSON.stringify(user, undefined, '  ')}</pre>`
  );
});
