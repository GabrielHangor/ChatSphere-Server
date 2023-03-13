import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, data): void {
    console.log(client);

    this.server.emit('message', data);
  }

  @SubscribeMessage('message2')
  handleMessage2(client: Socket, data): void {
    this.server.emit('message2', data);
  }
}
