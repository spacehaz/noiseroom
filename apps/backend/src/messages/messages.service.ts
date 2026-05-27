import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatsRepository } from '../chats/chats.repository';
import { MessagesRepository } from './messages.repository';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    private repository: MessagesRepository,
    private chatsRepository: ChatsRepository,
  ) {}

  async send(chatId: string, userId: string, dto: SendMessageDto) {
    const member = await this.chatsRepository.isMember(chatId, userId);
    if (!member) throw new ForbiddenException('Not a member of this chat');

    return this.repository.create(chatId, userId, dto.ciphertext);
  }

  async getMessages(chatId: string, query: GetMessagesDto) {
    const { limit, offset, order, since } = query;
    return this.repository.findByChatId(chatId, limit, offset, order, since);
  }
}
