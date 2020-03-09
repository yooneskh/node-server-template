import { Socket } from 'socket.io';
import { YEventManager } from './plugins/event-manager/event-manager';
import { Listener } from 'eventemitter2';
import { IUser } from './modules/modules-interfaces';
import { getUserByToken } from './modules/auth/auth-resource';

declare module 'socket.io' {
  interface Socket {
    user?: IUser;
    subscriptions: { room: string, handler: Listener }[]
  }
}

export default async function(socket: Socket) {

  console.log('socket connected: ' + socket.id);
  socket.subscriptions = [];

  socket.on('authenticate', async (data) => {
    socket.user = await getUserByToken(data.token); // TODO: rate limit
    if (socket.user) {
      socket.emit('authenticated');
    }
  });

  socket.on('subscribe', (room) => {

    if (!socket.user) {
      socket.disconnect(true);
      console.log('unauthenticated socket subscription');
      return;
    }

    socket.subscriptions.push({
      room,
      handler: (...data) => {
        socket.emit(room, ...data);
      }
    });

    YEventManager.on(room.split('.'), socket.subscriptions.slice(-1)[0].handler);

  });

  socket.on('disconnect', () => {
    for (const sub of socket.subscriptions) {
      YEventManager.off(sub.room.split('.'), sub.handler);
    }
  });

}
