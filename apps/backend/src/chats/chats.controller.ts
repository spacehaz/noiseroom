import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JoinChatDto } from './dto/join-chat.dto';

@UseGuards(JwtGuard)
@Controller('chats')
export class ChatsController {
  constructor(private service: ChatsService) {}

  @Post()
  create(@Body() dto: CreateChatDto, @CurrentUser('userId') userId: string) {
    return this.service.createChat(dto, userId);
  }

  @Get()
  getMyChats(@CurrentUser('userId') userId: string) {
    return this.service.getMyChats(userId);
  }

  @Get(':id')
  getChat(@Param('id') chatId: string, @CurrentUser('userId') userId: string) {
    return this.service.getChat(chatId, userId);
  }

  @Post(':id/join')
  joinChat(
    @Param('id') chatId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: JoinChatDto,
  ) {
    return this.service.joinChat(chatId, userId, dto);
  }

  @Get(':id/vocabulary')
  getVocabulary(@Param('id') chatId: string, @CurrentUser('userId') userId: string) {
    return this.service.getEncryptedVocabulary(chatId, userId);
  }

  @Delete('memberships')
  leaveAllChats(@CurrentUser('userId') userId: string) {
    return this.service.leaveAllChats(userId);
  }
}
