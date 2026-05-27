import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  search(q: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: q, mode: 'insensitive' } },
      select: { id: true, username: true },
      take: 20,
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        memberships: {
          select: {
            chat: {
              select: {
                id: true,
                name: true,
                _count: { select: { members: true } },
              },
            },
          },
        },
      },
    });
  }
}
