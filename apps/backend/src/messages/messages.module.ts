import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatsModule } from '../chats/chats.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';

@Module({
  imports: [AuthModule, ChatsModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
  exports: [MessagesRepository],
})
export class MessagesModule {}
