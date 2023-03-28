import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from './../auth/auth.module';
import { UserModule } from './../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './model/room.entity';
import { ConnectedUserService } from './connected-user.service';
import { ConnectedUser } from './model/connected-user.entity';

@Module({
  providers: [ChatGateway, RoomService, ConnectedUserService],
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([Room, ConnectedUser])],
})
export class ChatModule {}
