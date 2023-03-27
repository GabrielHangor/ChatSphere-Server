import { UnauthorizedException } from '@nestjs/common';
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
import { Room } from './model/room.entity';
import { TPage } from 'src/common/model/common.types';
import { ChatEvent } from './model/chat.types';

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
    } catch (e) {
      this.disconnect(client);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected');
  }

  @SubscribeMessage(ChatEvent.MESSAGE)
  handleMessage(client: Socket, payload: any) {
    this.server.emit(ChatEvent.MESSAGE, `hello from server, ur msg is:${payload}`);
  }

  @SubscribeMessage(ChatEvent.CREATE_ROOM)
  async onCreateRoom(client: Socket, room: Room) {
    await this.roomService.createRoom(room, client.data.user);

    const connectedClients = await this.server.fetchSockets();

    for (const connectedClient of connectedClients) {
      const rooms = await this.roomService.getRoomsListForUser(connectedClient.data.user.id, {
        limit: 10,
        page: 1,
      });
      this.server.to(connectedClient.id).emit(ChatEvent.PAGINATE_ROOM, rooms);
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
