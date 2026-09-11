import { ProfessionalEntity } from '../../domain/entities/professional.entity';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { MessageEntity } from '../../domain/entities/message.entity';

export interface ProfessionalFilterOptions {
  type?: string;
  search?: string;
  status?: string;
}

export interface IProfessionalRepository {
  findAllProfessionals(filters?: ProfessionalFilterOptions): Promise<ProfessionalEntity[]>;
  findProfessionalById(id: string): Promise<ProfessionalEntity | null>;
  findProfessionalByUserId(userId: string): Promise<ProfessionalEntity | null>;
  saveProfessional(professional: ProfessionalEntity): Promise<ProfessionalEntity>;

  findConversationById(id: string): Promise<ConversationEntity | null>;
  findConversationByUserAndProfessional(userId: string, professionalId: string): Promise<ConversationEntity | null>;
  findConversationsByUserId(userId: string): Promise<ConversationEntity[]>;
  findConversationsByProfessionalId(professionalId: string): Promise<ConversationEntity[]>;
  saveConversation(conversation: ConversationEntity): Promise<ConversationEntity>;

  findMessagesByConversationId(conversationId: string): Promise<MessageEntity[]>;
  saveMessage(message: MessageEntity): Promise<MessageEntity>;
  markMessagesAsRead(conversationId: string, readerType: 'USER' | 'PROFESSIONAL'): Promise<void>;
}
