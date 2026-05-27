import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatsRepository } from './chats.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { JoinChatDto } from './dto/join-chat.dto';

@Injectable()
export class ChatsService {
  constructor(private repository: ChatsRepository) {}

  createChat(dto: CreateChatDto, userId: string) {
    return this.repository.createChat(dto.name, userId, dto.encryptedVocabulary);
  }

  getMyChats(userId: string) {
    return this.repository.findMyChats(userId);
  }

  async getChat(chatId: string) {
    const chat = await this.repository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async joinChat(chatId: string, userId: string, dto: JoinChatDto) {
    const chat = await this.repository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');

    const existing = await this.repository.isMember(chatId, userId);
    if (existing) return chat;

    await this.repository.addMember(chatId, userId, dto.encryptedVocabulary);
    return this.repository.findById(chatId);
  }

  async getEncryptedVocabulary(chatId: string, userId: string) {
    const member = await this.repository.isMember(chatId, userId);
    if (!member) throw new ForbiddenException('Not a member of this chat');

    return this.repository.getEncryptedVocabulary(chatId, userId);
  }

  leaveAllChats(userId: string) {
    return this.repository.leaveAllChats(userId);
  }
}
