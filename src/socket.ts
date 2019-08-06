import { Socket } from 'socket.io';

export default async function(socket: Socket) {

  console.log('socket connected: ' + JSON.stringify(socket.id));

  socket.on('test', (data) => {
    console.log(`socket room test: ${data}`);
  });

}
