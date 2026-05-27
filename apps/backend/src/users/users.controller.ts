import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  search(@Query('q') q: string) {
    if (!q || q.trim().length < 1) return [];
    return this.service.search(q.trim());
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.service.getProfile(username);
  }
}
