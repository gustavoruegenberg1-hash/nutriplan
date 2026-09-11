import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ProfessionalEntity } from '../../domain/entities/professional.entity';

export interface ConversationHistoryResponse {
  conversation: ConversationEntity;
  professional: ProfessionalEntity;
  messages: MessageEntity[];
}

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(
    conversationId: string,
    requesterId: string,
    requesterRole?: string,
    asProfessionalId?: string
  ): Promise<ConversationHistoryResponse> {
    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa com ID ${conversationId} não foi encontrada.`);
    }

    const professional = await this.repository.findProfessionalById(conversation.professionalId);
    if (!professional) {
      throw new NotFoundException(`Profissional da conversa não foi encontrado.`);
    }

    // Validação Estrita de Segurança e Autorização
    const isUserParticipant = conversation.userId === requesterId;
    const isProfessionalParticipant =
      asProfessionalId === conversation.professionalId ||
      professional.userId === requesterId ||
      requesterRole === 'PROFESSIONAL';
    const isAdmin = requesterRole === 'ADMIN';

    if (!isUserParticipant && !isProfessionalParticipant && !isAdmin) {
      throw new ForbiddenException(
        'Acesso negado: Você não possui autorização para visualizar as mensagens desta conversa privada.'
      );
    }

    // Marcar como lido para quem está abrindo a conversa
    const readerType = isUserParticipant ? 'USER' : 'PROFESSIONAL';
    await this.repository.markMessagesAsRead(conversationId, readerType);

    const messages = await this.repository.findMessagesByConversationId(conversationId);

    return {
      conversation,
      professional,
      messages,
    };
  }
}
