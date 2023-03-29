import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from './../auth/auth.module';
import { UserModule } from './../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './model/room.entity';
import { ConnectedUserService } from './connected-user.service';
import { ConnectedUser } from './model/connected-user.entity';
import { JoinedRoom } from './model/joined-room.entity';
import { Message } from './model/message.entity';
import { JoinedRoomService } from './joined-room.service';
import { MessageService } from './message.service';

@Module({
  providers: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, MessageService],
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([Room, ConnectedUser, Message, JoinedRoom]),
  ],
})
export class ChatModule {}
