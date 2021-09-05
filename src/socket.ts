import { Socket } from 'socket.io';
import { ServerError } from './global/errors';

declare module 'socket.io' {
  interface Socket {

  }
}

type SocketInitializer = (socket: Socket) => void;

interface SocketHandler {
  room: string,
  handler(socket: Socket, ...args: any[]): Promise<void>; // tslint:disable-line: no-any
}

const socketInitializers: SocketInitializer[] = [];
const socketHandlers: SocketHandler[] = [];

export function registerSocketInitializer(socketInitializer: SocketInitializer) {
  socketInitializers.push(socketInitializer);
}

export function registerSocketHandler(socketHandler: SocketHandler) {
  if (socketHandlers.find(sh => sh.room === socketHandler.room)) throw new ServerError('socket room already handled');

  socketHandlers.push(socketHandler);

}

export default async function(socket: Socket) {
  console.log('socket connected: ' + socket.id);

  const initializations = await Promise.allSettled(
    socketInitializers.map(init => init(socket))
  );

  for (const init of initializations) {
    if (init.status === 'rejected') {
      console.error('socket initialization failed: ', init.reason);
    }
  }

  for (const handler of socketHandlers) {
    socket.on(handler.room, async (...args) => {
      try {
        await handler.handler(socket, ...args)
        console.log(new Date(), 'socket', handler.room, socket.id);
      }
      catch (error: any) {
        console.error('socket handler error', handler.room, error.responseMessage || error.message);
        socket.disconnect(true);
      }
    });
  }

}
