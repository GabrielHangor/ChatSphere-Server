import { UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from './../auth/auth.service';
import { User } from './../user/model/user.entity';
import { UserService } from './../user/user.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async handleConnection(client: Socket) {
    console.log('user connected');

    try {
      const decodedToken = await this.authService.verifyJwt(client.handshake.headers.authorization);
      await this.userService.findOne(decodedToken.user.id);
    } catch (e) {
      ChatGateway.disconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    this.server.emit('message', `hello from server, ur msg is:${payload}`);
  }

  private static disconnect(client: Socket) {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }
}
