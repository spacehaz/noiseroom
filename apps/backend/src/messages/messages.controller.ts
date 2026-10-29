import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@UseGuards(JwtGuard)
@Controller('chats/:chatId/messages')
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  send(
    @Param('chatId') chatId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.service.send(chatId, userId, dto);
  }

  @Get()
  getMessages(@Param('chatId') chatId: string, @Query() query: GetMessagesDto) {
    return this.service.getMessages(chatId, query);
  }
}
