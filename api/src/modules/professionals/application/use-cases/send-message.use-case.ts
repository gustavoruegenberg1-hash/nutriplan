import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { MessageEntity, MessageSenderType } from '../../domain/entities/message.entity';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { v4 as uuidv4 } from 'uuid';

export interface SendMessageDto {
  content: string;
  senderType?: MessageSenderType;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
    senderRole?: string,
    asProfessionalId?: string
  ): Promise<{ message: MessageEntity; conversation: ConversationEntity }> {
    const rawContent = dto?.content?.trim();
    if (!rawContent) {
      throw new BadRequestException('O conteúdo da mensagem não pode estar vazio.');
    }

    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa com ID ${conversationId} não foi encontrada.`);
    }

    const professional = await this.repository.findProfessionalById(conversation.professionalId);
    if (!professional) {
      throw new NotFoundException(`Profissional da conversa não foi encontrado.`);
    }

    // Determinar senderType e validar autorização
    let senderType: MessageSenderType = 'USER';

    const isUserSender = conversation.userId === senderId;
    const isProfessionalSender =
      asProfessionalId === conversation.professionalId ||
      dto.senderType === 'PROFESSIONAL' ||
      professional.userId === senderId ||
      senderRole === 'PROFESSIONAL';

    if (isProfessionalSender) {
      senderType = 'PROFESSIONAL';
    } else if (isUserSender) {
      senderType = 'USER';
    } else if (senderRole === 'ADMIN') {
      senderType = dto.senderType || 'USER';
    } else {
      throw new ForbiddenException(
        'Acesso negado: Você não é participante desta conversa e não pode enviar mensagens nela.'
      );
    }

    const message = new MessageEntity({
      id: uuidv4(),
      conversationId,
      senderId,
      senderType,
      content: rawContent,
      createdAt: new Date(),
    });

    const savedMessage = await this.repository.saveMessage(message);

    // Atualiza conversa
    conversation.lastMessageText = rawContent.length > 90 ? rawContent.substring(0, 87) + '...' : rawContent;
    conversation.lastMessageAt = new Date();
    if (senderType === 'USER') {
      conversation.professionalUnreadCount = (conversation.professionalUnreadCount || 0) + 1;
      conversation.userUnreadCount = 0; // O próprio usuário já viu
    } else {
      conversation.userUnreadCount = (conversation.userUnreadCount || 0) + 1;
      conversation.professionalUnreadCount = 0; // O profissional já viu
    }

    const updatedConversation = await this.repository.saveConversation(conversation);

    return {
      message: savedMessage,
      conversation: updatedConversation,
    };
  }
}
