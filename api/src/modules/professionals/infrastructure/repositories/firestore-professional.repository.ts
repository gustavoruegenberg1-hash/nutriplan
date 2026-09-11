import { Injectable, Logger } from '@nestjs/common';
import { IProfessionalRepository, ProfessionalFilterOptions } from '../../application/ports/professional-repository.port';
import { ProfessionalEntity } from '../../domain/entities/professional.entity';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { MessageEntity } from '../../domain/entities/message.entity';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import * as fs from 'fs';
import * as path from 'path';

const INITIAL_PROFESSIONALS: Partial<ProfessionalEntity>[] = [
  {
    id: 'prof_dra_camila',
    name: 'Dra. Camila Barbosa',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813572-c0e6488d3d95?w=200&auto=format&fit=crop&q=80',
    type: 'NUTRITIONIST',
    specialty: 'Nutrição Clínica e Esportiva',
    bio: 'Especialista em periodização nutricional para atletas, recomposição corporal e longevidade. Mestre em Ciências da Nutrição pela UNICAMP com mais de 8 anos de prática clínica baseada em evidências.',
    experienceYears: 8,
    location: 'São Paulo, SP (Online & Presencial)',
    registrationNumber: 'CRN-3 45892',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.95,
    reviewCount: 54,
    pricing: 'Consulta sob agendamento',
    services: [
      'Plano Alimentar Individualizado com base na TACO',
      'Avaliação de Exames Bioquímicos e Marcadores Inflamatórios',
      'Suplementação Estratégica Baseada em Evidências',
    ],
    userId: 'user_prof_camila',
  },
  {
    id: 'prof_dr_lucas',
    name: 'Dr. Lucas Mendes',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    type: 'NUTRITIONIST',
    specialty: 'Nutrição Funcional, Hipertrofia e Saúde Digestiva',
    bio: 'Foco em estratégias nutricionais para ganho de massa muscular magra, melhora da microbiota intestinal e otimização do metabolismo energético. Atendimento humanizado e sem dietas restritivas extremas.',
    experienceYears: 6,
    location: 'Campinas, SP (Atendimento Online Nacional)',
    registrationNumber: 'CRN-3 51204',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.88,
    reviewCount: 39,
    pricing: 'Consulta sob agendamento',
    services: [
      'Dieta Hipercalórica Limpa para Hipertrofia',
      'Modulação Intestinal e Sensibilidades Alimentares',
      'Acompanhamento e Ajustes Quinzenais',
    ],
    userId: 'user_prof_lucas',
  },
  {
    id: 'prof_rafael_torres',
    name: 'Prof. Rafael Torres',
    avatarUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&auto=format&fit=crop&q=80',
    type: 'TRAINER',
    specialty: 'Treinamento de Força, Biomecânica e Hipertrofia',
    bio: 'Treinador e pós-graduado em Biomecânica Aplicada ao Exercício. Mais de 10 anos lapidando a técnica de execução, prevenção de lesões articulares e periodização inteligente para praticantes de musculação.',
    experienceYears: 10,
    location: 'São Paulo, SP (Consultoria Online & Presencial)',
    registrationNumber: 'CREF 089412-G/SP',
    status: 'ACTIVE',
    isVerified: true,
    rating: 5.0,
    reviewCount: 62,
    pricing: 'Consultoria mensal ou trimestral',
    services: [
      'Periodização Ondulatória e Bloco de Força',
      'Análise Biomecânica de Execuções por Vídeo',
      'Adaptação de Rotinas para Lombar e Ombros Sensíveis',
    ],
    userId: 'user_prof_rafael',
  },
  {
    id: 'prof_mariana_albuquerque',
    name: 'Profa. Mariana Albuquerque',
    avatarUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=200&auto=format&fit=crop&q=80',
    type: 'TRAINER',
    specialty: 'Condicionamento Metabólico e Hipertrofia Feminina',
    bio: 'Fisiologista do exercício especialista em periodização de volume para o público feminino, fortalecimento de glúteos e postura. Ajudo você a alcançar resultados consistentes com treino eficiente e sem excessos.',
    experienceYears: 7,
    location: 'Curitiba, PR (Consultoria Online Nacional)',
    registrationNumber: 'CREF 072115-G/SP',
    status: 'ACTIVE',
    isVerified: true,
    rating: 4.92,
    reviewCount: 47,
    pricing: 'Consultoria mensal',
    services: [
      'Rotinas Personalizadas com Foco em Cadeia Posterior',
      'Periodização de Cargas Progressivas',
      'Treinos Rápidos e Eficientes para Rotinas Corridas',
    ],
    userId: 'user_prof_mariana',
  },
  {
    id: 'prof_dr_eduardo',
    name: 'Dr. Eduardo Siqueira',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
    type: 'NUTRITIONIST',
    specialty: 'Emagrecimento e Controle de Doenças Metabólicas',
    bio: 'Médico nutrólogo e nutricionista clínico com mais de uma década de experiência no tratamento da resistência à insulina, esteatose hepática e obesidade com respeito e suporte contínuo.',
    experienceYears: 12,
    location: 'Rio de Janeiro, RJ',
    registrationNumber: 'CRN-4 38119',
    status: 'UNAVAILABLE', // Indisponível no momento para novas consultas
    isVerified: true,
    rating: 4.9,
    reviewCount: 88,
    pricing: 'Agenda temporariamente fechada',
    services: [
      'Reeducação Alimentar Estruturada',
      'Manejo Nutricional de Síndrome Metabólica',
    ],
    userId: 'user_prof_eduardo',
  },
];

@Injectable()
export class FirestoreProfessionalRepository implements IProfessionalRepository {
  private readonly logger = new Logger(FirestoreProfessionalRepository.name);
  private professionalsMap: Map<string, ProfessionalEntity> = new Map();
  private conversationsMap: Map<string, ConversationEntity> = new Map();
  private messagesMap: Map<string, MessageEntity> = new Map();

  private profCacheFile: string;
  private convCacheFile: string;
  private msgCacheFile: string;
  public isInMemoryOnly: boolean = false;

  constructor(private readonly firebase: FirebaseService) {
    this.profCacheFile = path.resolve(process.cwd(), 'local-cache', 'professionals.json');
    this.convCacheFile = path.resolve(process.cwd(), 'local-cache', 'conversations.json');
    this.msgCacheFile = path.resolve(process.cwd(), 'local-cache', 'messages.json');

    this.initCache();
  }

  public resetForTest() {
    this.isInMemoryOnly = true;
    this.professionalsMap.clear();
    this.conversationsMap.clear();
    this.messagesMap.clear();
    INITIAL_PROFESSIONALS.forEach((p) => {
      const entity = new ProfessionalEntity(p);
      this.professionalsMap.set(entity.id, entity);
    });
  }

  private initCache() {
    if (this.isInMemoryOnly) {
      this.resetForTest();
      return;
    }

    try {
      const cacheDir = path.resolve(process.cwd(), 'local-cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // 1. Carregar Profissionais
      if (fs.existsSync(this.profCacheFile)) {
        const raw = fs.readFileSync(this.profCacheFile, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((p) => this.professionalsMap.set(p.id, new ProfessionalEntity(p)));
      } else {
        INITIAL_PROFESSIONALS.forEach((p) => {
          const entity = new ProfessionalEntity(p);
          this.professionalsMap.set(entity.id, entity);
        });
        this.persistProfessionals();
      }

      // 2. Carregar Conversas
      if (fs.existsSync(this.convCacheFile)) {
        const raw = fs.readFileSync(this.convCacheFile, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((c) => this.conversationsMap.set(c.id, new ConversationEntity(c)));
      }

      // 3. Carregar Mensagens
      if (fs.existsSync(this.msgCacheFile)) {
        const raw = fs.readFileSync(this.msgCacheFile, 'utf8');
        const list: any[] = JSON.parse(raw);
        list.forEach((m) => this.messagesMap.set(m.id, new MessageEntity(m)));
      }

      this.logger.log(
        `Carregados ${this.professionalsMap.size} profissionais, ${this.conversationsMap.size} conversas e ${this.messagesMap.size} mensagens do cache.`
      );
    } catch (err: any) {
      this.logger.warn(`Erro ao inicializar cache de profissionais: ${err.message}`);
    }
  }

  private persistProfessionals() {
    if (this.isInMemoryOnly) return;
    try {
      const list = Array.from(this.professionalsMap.values());
      fs.writeFileSync(this.profCacheFile, JSON.stringify(list, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao persistir profissionais: ${err.message}`);
    }
  }

  private persistConversations() {
    if (this.isInMemoryOnly) return;
    try {
      const list = Array.from(this.conversationsMap.values());
      fs.writeFileSync(this.convCacheFile, JSON.stringify(list, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao persistir conversas: ${err.message}`);
    }
  }

  private persistMessages() {
    if (this.isInMemoryOnly) return;
    try {
      const list = Array.from(this.messagesMap.values());
      fs.writeFileSync(this.msgCacheFile, JSON.stringify(list, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Erro ao persistir mensagens: ${err.message}`);
    }
  }

  async findAllProfessionals(filters?: ProfessionalFilterOptions): Promise<ProfessionalEntity[]> {
    let result = Array.from(this.professionalsMap.values());

    if (filters?.type) {
      result = result.filter(
        (p) => p.type.toUpperCase() === filters.type!.toUpperCase()
      );
    }

    if (filters?.status) {
      result = result.filter(
        (p) => p.status.toUpperCase() === filters.status!.toUpperCase()
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    return result;
  }

  async findProfessionalById(id: string): Promise<ProfessionalEntity | null> {
    return this.professionalsMap.get(id) || null;
  }

  async findProfessionalByUserId(userId: string): Promise<ProfessionalEntity | null> {
    for (const p of this.professionalsMap.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async saveProfessional(professional: ProfessionalEntity): Promise<ProfessionalEntity> {
    professional.updatedAt = new Date();
    this.professionalsMap.set(professional.id, professional);
    this.persistProfessionals();
    return professional;
  }

  async findConversationById(id: string): Promise<ConversationEntity | null> {
    return this.conversationsMap.get(id) || null;
  }

  async findConversationByUserAndProfessional(
    userId: string,
    professionalId: string
  ): Promise<ConversationEntity | null> {
    for (const c of this.conversationsMap.values()) {
      if (c.userId === userId && c.professionalId === professionalId) {
        return c;
      }
    }
    return null;
  }

  async findConversationsByUserId(userId: string): Promise<ConversationEntity[]> {
    const list = Array.from(this.conversationsMap.values()).filter(
      (c) => c.userId === userId
    );
    return list.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  async findConversationsByProfessionalId(professionalId: string): Promise<ConversationEntity[]> {
    const list = Array.from(this.conversationsMap.values()).filter(
      (c) => c.professionalId === professionalId
    );
    return list.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  async saveConversation(conversation: ConversationEntity): Promise<ConversationEntity> {
    conversation.updatedAt = new Date();
    this.conversationsMap.set(conversation.id, conversation);
    this.persistConversations();
    return conversation;
  }

  async findMessagesByConversationId(conversationId: string): Promise<MessageEntity[]> {
    const list = Array.from(this.messagesMap.values()).filter(
      (m) => m.conversationId === conversationId
    );
    return list.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async saveMessage(message: MessageEntity): Promise<MessageEntity> {
    this.messagesMap.set(message.id, message);
    this.persistMessages();
    return message;
  }

  async markMessagesAsRead(conversationId: string, readerType: 'USER' | 'PROFESSIONAL'): Promise<void> {
    const now = new Date();
    let updated = false;

    for (const msg of this.messagesMap.values()) {
      if (msg.conversationId === conversationId && !msg.readAt) {
        // Se quem está lendo for USER, marca mensagens de PROFESSIONAL como lidas
        if (readerType === 'USER' && msg.senderType === 'PROFESSIONAL') {
          msg.readAt = now;
          updated = true;
        }
        // Se quem está lendo for PROFESSIONAL, marca mensagens de USER como lidas
        if (readerType === 'PROFESSIONAL' && msg.senderType === 'USER') {
          msg.readAt = now;
          updated = true;
        }
      }
    }

    if (updated) {
      this.persistMessages();
    }

    // Zera contadores na conversa
    const conv = this.conversationsMap.get(conversationId);
    if (conv) {
      if (readerType === 'USER') {
        conv.userUnreadCount = 0;
      } else {
        conv.professionalUnreadCount = 0;
      }
      this.saveConversation(conv);
    }
  }
}
