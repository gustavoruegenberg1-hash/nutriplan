import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { ListProfessionalsUseCase } from '../../application/use-cases/list-professionals.use-case';
import { GetProfessionalUseCase } from '../../application/use-cases/get-professional.use-case';
import { GetOrCreateConversationUseCase } from '../../application/use-cases/get-or-create-conversation.use-case';
import { ListConversationsUseCase } from '../../application/use-cases/list-conversations.use-case';
import { GetMessagesUseCase } from '../../application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { ShareProfileUseCase } from '../../application/use-cases/share-profile.use-case';
import { MarkReadUseCase } from '../../application/use-cases/mark-read.use-case';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ShareProfileDto } from '../dto/share-profile.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly listProfessionalsUseCase: ListProfessionalsUseCase,
    private readonly getProfessionalUseCase: GetProfessionalUseCase,
    private readonly getOrCreateConversationUseCase: GetOrCreateConversationUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly shareProfileUseCase: ShareProfileUseCase,
    private readonly markReadUseCase: MarkReadUseCase,
  ) {}

  // 1. Listagem pública/autenticada de profissionais com filtros
  @Get()
  async list(
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.listProfessionalsUseCase.execute({ type, search, status });
  }

  // 2. Consulta de detalhes do profissional
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getProfessionalUseCase.execute(id);
  }

  // 3. Obter ou Criar Conversa (Garante unicidade por dupla usuário + profissional)
  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async getOrCreateConversation(
    @CurrentUser() user: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.getOrCreateConversationUseCase.execute(user.id, dto.professionalId);
  }

  // 4. Listar conversas do usuário autenticado ou do profissional
  @Get('chat/conversations')
  @UseGuards(JwtAuthGuard)
  async listConversations(
    @CurrentUser() user: any,
    @Query('asProfessionalId') asProfessionalId?: string,
  ) {
    return this.listConversationsUseCase.execute(user.id, user.role, asProfessionalId);
  }

  // 5. Obter mensagens de uma conversa com verificação de autorização
  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Query('asProfessionalId') asProfessionalId?: string,
  ) {
    return this.getMessagesUseCase.execute(conversationId, user.id, user.role, asProfessionalId);
  }

  // 6. Enviar mensagem na conversa
  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessageUseCase.execute(
      conversationId,
      user.id,
      dto,
      user.role,
      dto.asProfessionalId
    );
  }

  // 7. Compartilhar contexto do perfil de saúde na conversa
  @Post('conversations/:id/share-profile')
  @UseGuards(JwtAuthGuard)
  async shareProfile(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Body() dto: ShareProfileDto,
  ) {
    return this.shareProfileUseCase.execute(conversationId, user.id, dto);
  }

  // 8. Marcar mensagens como lidas
  @Post('conversations/:id/mark-read')
  @UseGuards(JwtAuthGuard)
  async markRead(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
    @Query('asProfessionalId') asProfessionalId?: string,
  ) {
    await this.markReadUseCase.execute(conversationId, user.id, asProfessionalId);
    return { success: true };
  }
}
