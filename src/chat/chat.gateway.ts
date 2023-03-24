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
import { RoomService } from './room.service';
import { Room } from './model/room.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roomService: RoomService
  ) {}

  async handleConnection(client: Socket) {
    console.log('user connected');

    try {
      const decodedToken = await this.authService.verifyJwt(client.handshake.headers.authorization);
      const user = await this.userService.findOne(decodedToken.user.id);

      client.data.user = user;

      const rooms = await this.roomService.getRoomsListForUser(user.id, { page: 1, limit: 10 });
      this.server.to(client.id).emit('rooms', rooms);
    } catch (e) {
      this.disconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    this.server.emit('message', `hello from server, ur msg is:${payload}`);
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(client: Socket, room: Room) {
    return this.roomService.createRoom(room, client.data.user);
  }

  private disconnect(client: Socket) {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }
}
