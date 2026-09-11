import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ProfessionalEntity } from '../../domain/entities/professional.entity';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationWithDetails {
  conversation: ConversationEntity;
  professional: ProfessionalEntity;
  isNew: boolean;
}

@Injectable()
export class GetOrCreateConversationUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository
  ) {}

  async execute(userId: string, professionalId: string): Promise<ConversationWithDetails> {
    const professional = await this.repository.findProfessionalById(professionalId);
    if (!professional) {
      throw new NotFoundException(`Profissional com ID ${professionalId} não foi encontrado.`);
    }

    // Verifica se conversa já existe entre o par (userId, professionalId)
    const existing = await this.repository.findConversationByUserAndProfessional(userId, professionalId);
    if (existing) {
      return {
        conversation: existing,
        professional,
        isNew: false,
      };
    }

    // Se não existir, verifica se o profissional está ativo
    if (!professional.isAvailableForNewConversations()) {
      throw new BadRequestException(
        `O profissional ${professional.name} está temporariamente indisponível para iniciar novas conversas.`
      );
    }

    // Cria nova conversa persistida
    const newConv = new ConversationEntity({
      id: uuidv4(),
      userId,
      professionalId,
      userUnreadCount: 0,
      professionalUnreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.repository.saveConversation(newConv);

    return {
      conversation: saved,
      professional,
      isNew: true,
    };
  }
}
