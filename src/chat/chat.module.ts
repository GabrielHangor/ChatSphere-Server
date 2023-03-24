import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from './../auth/auth.module';
import { UserModule } from './../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from './room.service';
import { Room } from './model/room.entity';

@Module({
  providers: [ChatGateway, RoomService],
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([Room])],
})
export class ChatModule {}
