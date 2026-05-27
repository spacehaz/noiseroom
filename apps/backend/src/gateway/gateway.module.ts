import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatsModule } from '../chats/chats.module';
import { MessagesModule } from '../messages/messages.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [AuthModule, ChatsModule, MessagesModule],
  providers: [AppGateway],
})
export class GatewayModule {}
