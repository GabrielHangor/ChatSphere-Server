import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from './../auth/auth.module';
import { UserModule } from './../user/user.module';

@Module({
  providers: [ChatGateway],
  imports: [AuthModule, UserModule],
})
export class ChatModule {}
