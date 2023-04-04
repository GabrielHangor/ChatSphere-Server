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
import { ChatEvent, IMessage, IRoom } from './model/chat.types';
import { ConnectedUserService } from './connected-user.service';
import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces/hooks';
import { JoinedRoomService } from './joined-room.service';
import { MessageService } from './message.service';
import { TPage } from '../common/model/common.types';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly joinedRoomService: JoinedRoomService,
    private readonly messageService: MessageService
  ) {}

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  // CONNECTION
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
    await this.joinedRoomService.deleteBySocketId(client.id);
    client.disconnect();
  }

  // ROOMS
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

  @SubscribeMessage(ChatEvent.JOIN_ROOM)
  async onJoinRoom(client: Socket, room: IRoom) {
    const messages = await this.messageService.findByRoom(room, { limit: 100, page: 1 });
    await this.joinedRoomService.create({ socketId: client.id, room, user: client.data.user });
    this.server.to(client.id).emit(ChatEvent.MESSAGES, messages);
  }

  @SubscribeMessage(ChatEvent.LEAVE_ROOM)
  async onLeaveRoom(client: Socket) {
    await this.joinedRoomService.deleteBySocketId(client.id);
  }

  @SubscribeMessage(ChatEvent.PAGINATE_ROOM)
  async onPaginateRoom(client: Socket, page: TPage) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    const rooms = await this.roomService.getRoomsListForUser(client.data.user.id, page);
    this.server.to(client.id).emit(ChatEvent.PAGINATE_ROOM, rooms);
  }

  @SubscribeMessage(ChatEvent.ADD_MESSAGE)
  async onAddMessage(client: Socket, message: IMessage) {
    const createdMessage = await this.messageService.create({ ...message, user: client.data.user });

    const room = await this.roomService.getRoomById(createdMessage.room.id);

    const joinedUsers = await this.joinedRoomService.findByRoom(room);

    for (const user of joinedUsers) {
      this.server.to(user.socketId).emit(ChatEvent.ADD_MESSAGE, createdMessage);
    }
  }

  private disconnect(client: Socket) {
    client.emit(ChatEvent.ERROR, new UnauthorizedException());
    client.disconnect();
  }
}
