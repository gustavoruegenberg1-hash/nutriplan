import { Injectable, Inject } from '@nestjs/common';
import { IProfessionalRepository } from '../ports/professional-repository.port';
import { IUserRepository } from '../../../auth/application/ports/user-repository.port';

export interface EnrichedConversationDto {
  id: string;
  userId: string;
  userName?: string;
  professionalId: string;
  professionalName?: string;
  professionalAvatar?: string;
  professionalType?: string;
  professionalSpecialty?: string;
  professionalStatus?: string;
  lastMessageText?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  sharedProfile?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject('PROFESSIONAL_REPOSITORY')
    private readonly repository: IProfessionalRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(requesterId: string, role?: string, asProfessionalId?: string): Promise<EnrichedConversationDto[]> {
    let conversations: any[] = [];
    const isProfessionalView = role === 'PROFESSIONAL' || !!asProfessionalId;

    if (isProfessionalView) {
      // Se for visão do profissional, busca conversas onde ele é o profissional
      const profId = asProfessionalId || (await this.repository.findProfessionalByUserId(requesterId))?.id;
      if (profId) {
        conversations = await this.repository.findConversationsByProfessionalId(profId);
      }
    } else {
      // Caso padrão: usuário buscando suas conversas com profissionais
      conversations = await this.repository.findConversationsByUserId(requesterId);
    }

    const enriched: EnrichedConversationDto[] = [];

    for (const c of conversations) {
      const prof = await this.repository.findProfessionalById(c.professionalId);
      const user = await this.userRepository.findById(c.userId);

      enriched.push({
        id: c.id,
        userId: c.userId,
        userName: user?.name || 'Paciente NutriPlan',
        professionalId: c.professionalId,
        professionalName: prof?.name || 'Profissional',
        professionalAvatar: prof?.avatarUrl || '',
        professionalType: prof?.type || 'NUTRITIONIST',
        professionalSpecialty: prof?.specialty || '',
        professionalStatus: prof?.status || 'ACTIVE',
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        unreadCount: isProfessionalView ? c.professionalUnreadCount : c.userUnreadCount,
        sharedProfile: c.sharedProfile,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
    }

    return enriched;
  }
}
