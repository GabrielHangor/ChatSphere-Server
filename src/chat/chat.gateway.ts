import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from './../auth/auth.service';
import { UserService } from './../user/user.service';
import { RoomService } from './room.service';

import { TPage } from 'src/common/model/common.types';
import { ChatEvent, IRoom } from './model/chat.types';
import { ConnectedUserService } from './connected-user.service';
import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces/hooks';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
  }

  async handleConnection(client: Socket) {
    console.log('user connected');

    try {
      const decodedToken = await this.authService.verifyJwt(client.handshake.headers.authorization);
      const user = await this.userService.findOne(decodedToken.user.id);
      client.data.user = user;
      await this.connectedUserService.saveConnection({ socketId: client.id, user });
    } catch (e) {
      this.disconnect(client);
    }
  }

  async handleDisconnect(client: Socket) {
    console.log('user disconnected');
    await this.connectedUserService.deleteBySocketId(client.id);
    client.disconnect();
  }

  @SubscribeMessage(ChatEvent.MESSAGE)
  handleMessage(client: Socket, payload: any) {
    this.server.emit(ChatEvent.MESSAGE, `hello from server, ur msg is:${payload}`);
  }

  @SubscribeMessage(ChatEvent.CREATE_ROOM)
  async onCreateRoom(client: Socket, room: IRoom) {
    try {
      await this.roomService.createRoom(room, client.data.user);
      const users = room.users;

      const [connections, rooms] = await Promise.all([
        Promise.all(users.map((user) => this.connectedUserService.findByUser(user))),
        Promise.all(
          users.map((user) => this.roomService.getRoomsListForUser(user.id, { page: 1, limit: 10 }))
        ),
      ]);

      connections.forEach((connection, index) => {
        connection.forEach((connectedUser) => {
          this.server.to(connectedUser.socketId).emit(ChatEvent.PAGINATE_ROOM, rooms[index]);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  @SubscribeMessage(ChatEvent.PAGINATE_ROOM)
  async onPaginateRoom(client: Socket, page: TPage) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    const rooms = await this.roomService.getRoomsListForUser(client.data.user.id, page);
    this.server.to(client.id).emit(ChatEvent.PAGINATE_ROOM, rooms);
  }

  private disconnect(client: Socket) {
    client.emit(ChatEvent.ERROR, new UnauthorizedException());
    client.disconnect();
  }
}
