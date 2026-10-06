import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async listConversations(@CurrentUser() user: CurrentUserPayload) {
    return this.messagesService.listConversations(user.userId);
  }

  @Get(':contactId')
  async getConversation(
    @CurrentUser() user: CurrentUserPayload,
    @Param('contactId') contactId: string,
  ) {
    return this.messagesService.getConversation(user.userId, contactId);
  }

  @Post(':contactId')
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('contactId') contactId: string,
    @Body() body: { content: string },
  ) {
    return this.messagesService.sendMessage(user.userId, contactId, body.content);
  }
}
