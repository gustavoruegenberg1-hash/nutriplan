import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';

@Injectable()
export class MarkReadUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(conversationId: string, requesterId: string, asProfessionalId?: string): Promise<void> {
    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa com ID ${conversationId} não foi encontrada.`);
    }

    const isUser = conversation.userId === requesterId;
    const isProfessional = asProfessionalId === conversation.professionalId;

    if (!isUser && !isProfessional) {
      throw new ForbiddenException('Acesso negado para marcar mensagens desta conversa.');
    }

    const readerType = isUser ? 'USER' : 'PROFESSIONAL';
    await this.repository.markMessagesAsRead(conversationId, readerType);
  }
}
