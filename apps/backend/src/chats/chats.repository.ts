import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsRepository {
  constructor(private prisma: PrismaService) {}

  createChat(name: string, userId: string, encryptedVocabulary: string) {
    return this.prisma.chat.create({
      data: {
        name,
        members: {
          create: { userId, role: Role.OWNER, encryptedVocabulary },
        },
      },
      include: { members: true },
    });
  }

  findMyChats(userId: string) {
    return this.prisma.chat.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: { select: { id: true, username: true } } } } },
    });
  }

  findById(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: { include: { user: { select: { id: true, username: true } } } } },
    });
  }

  isMember(chatId: string, userId: string) {
    return this.prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
  }

  addMember(chatId: string, userId: string, encryptedVocabulary?: string) {
    return this.prisma.chatMember.create({
      data: { chatId, userId, role: Role.MEMBER, encryptedVocabulary },
    });
  }

  getEncryptedVocabulary(chatId: string, userId: string) {
    return this.prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } },
      select: { encryptedVocabulary: true },
    });
  }
}
