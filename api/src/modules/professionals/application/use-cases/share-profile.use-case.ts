import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { ConversationEntity, SharedProfileContext } from '../../domain/entities/conversation.entity';
import { MessageEntity } from '../../domain/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';

export interface ShareProfileDto {
  goal?: string;
  weight?: number;
  height?: number;
  dietaryRestrictions?: string[];
  trainingExperience?: string;
}

@Injectable()
export class ShareProfileUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    dto: ShareProfileDto
  ): Promise<{ conversation: ConversationEntity; message: MessageEntity }> {
    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversa com ID ${conversationId} não foi encontrada.`);
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Apenas o paciente pode compartilhar seu perfil de saúde nesta conversa.');
    }

    const sharedContext: SharedProfileContext = {
      goal: dto.goal,
      weight: dto.weight,
      height: dto.height,
      dietaryRestrictions: dto.dietaryRestrictions || [],
      trainingExperience: dto.trainingExperience,
      sharedAt: new Date(),
    };

    conversation.sharedProfile = sharedContext;

    // Formata mensagem automática clara para o profissional
    const parts: string[] = ['📋 [DADOS DE SAÚDE COMPARTILHADOS PELO USUÁRIO]'];
    if (dto.goal) parts.push(`🎯 Objetivo: ${dto.goal}`);
    if (dto.weight) parts.push(`⚖️ Peso: ${dto.weight} kg`);
    if (dto.height) parts.push(`📏 Altura: ${dto.height} cm`);
    if (dto.dietaryRestrictions && dto.dietaryRestrictions.length > 0) {
      parts.push(`🥗 Restrições Alimentares: ${dto.dietaryRestrictions.join(', ')}`);
    }
    if (dto.trainingExperience) {
      parts.push(`🏋️ Experiência de Treino: ${dto.trainingExperience}`);
    }

    const messageContent = parts.join('\n');

    const message = new MessageEntity({
      id: uuidv4(),
      conversationId,
      senderId: userId,
      senderType: 'USER',
      content: messageContent,
      createdAt: new Date(),
    });

    await this.repository.saveMessage(message);

    conversation.lastMessageText = '📋 Dados de saúde compartilhados pelo paciente';
    conversation.lastMessageAt = new Date();
    conversation.professionalUnreadCount = (conversation.professionalUnreadCount || 0) + 1;

    const savedConv = await this.repository.saveConversation(conversation);

    return {
      conversation: savedConv,
      message,
    };
  }
}
