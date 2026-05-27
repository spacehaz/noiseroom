import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsRepository } from './chats.repository';

@Module({
  imports: [AuthModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsRepository],
  exports: [ChatsRepository],
})
export class ChatsModule {}
