import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private prisma: PrismaService) {}

  create(chatId: string, senderId: string, ciphertext: string) {
    return this.prisma.message.create({
      data: { chatId, senderId, ciphertext },
      include: { sender: { select: { id: true, username: true } } },
    });
  }

  findByChatId(
    chatId: string,
    limit: number,
    offset: number,
    order: 'asc' | 'desc',
    since?: string,
  ) {
    return this.prisma.message.findMany({
      where: {
        chatId,
        ...(since && { createdAt: { gte: new Date(since) } }),
      },
      orderBy: { createdAt: order },
      take: limit,
      skip: offset,
      include: { sender: { select: { id: true, username: true } } },
    });
  }
}
