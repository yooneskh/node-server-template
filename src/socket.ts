import { Socket } from 'socket.io';
import { YEventManager, EventListener } from './plugins/event-manager/event-manager';
import { IUser } from './modules/modules-interfaces';
import { getUserByToken } from './modules/auth/auth-resource';

declare module 'socket.io' {
  interface Socket {
    user?: IUser;
    subscriptions: { room: string, handler: EventListener }[]
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

  socket.on('subscribe', (resource, action) => {

    if (resource.includes('*') || action.includes('*')) {
      socket.disconnect(true);
      console.log('wildcard subscription disallowed');
      return;
    }

    if (!socket.user) {
      socket.disconnect(true);
      console.log('unauthenticated socket subscription');
      return;
    }

    const room = `Resource.${resource}.${action}`;

    socket.subscriptions.push({
      room,
      handler: async (...data) => {
        socket.emit(room, ...data);
      }
    });

    YEventManager.on(room.split('.'), socket.subscriptions[socket.subscriptions.length - 1].handler);

  });

  socket.on('disconnect', () => {
    for (const sub of socket.subscriptions) {
      YEventManager.off(sub.room.split('.'), sub.handler);
    }
  });

}
