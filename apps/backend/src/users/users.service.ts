import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private repository: UsersRepository) {}

  search(q: string) {
    return this.repository.search(q);
  }

  async getProfile(username: string) {
    const user = await this.repository.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      username: user.username,
      chats: user.memberships.map(({ chat }) => ({
        id: chat.id,
        name: chat.name,
        memberCount: chat._count.members,
      })),
    };
  }
}
