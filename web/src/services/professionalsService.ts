import { api } from '../api/client';
import {
  Professional,
  Conversation,
  Message,
  ProfessionalFilterOptions,
  SharedProfileContext,
} from '../types/professionals';

// Dados de fallback para desenvolvimento e funcionamento offline
const FALLBACK_PROFESSIONALS: Professional[] = [
  {
    id: 'prof_dra_camila',
    name: 'Dra. Camila Barbosa',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813572-c0e6488d3d95?w=300&auto=format&fit=crop&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&auto=format&fit=crop&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=300&auto=format&fit=crop&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    type: 'NUTRITIONIST',
    specialty: 'Emagrecimento e Controle de Doenças Metabólicas',
    bio: 'Médico nutrólogo e nutricionista clínico com mais de uma década de experiência no tratamento da resistência à insulina, esteatose hepática e obesidade com respeito e suporte contínuo.',
    experienceYears: 12,
    location: 'Rio de Janeiro, RJ',
    registrationNumber: 'CRN-4 38119',
    status: 'UNAVAILABLE',
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

export const professionalsService = {
  // 1. Listar profissionais com filtros
  async fetchProfessionals(filters?: ProfessionalFilterOptions): Promise<Professional[]> {
    try {
      const { data } = await api.get('/professionals', {
        params: {
          type: filters?.type && filters.type !== 'ALL' ? filters.type : undefined,
          search: filters?.search || undefined,
          status: filters?.status || undefined,
        },
      });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback offline
    }

    let list = [...FALLBACK_PROFESSIONALS];
    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter((p) => p.type === filters.type);
    }
    if (filters?.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }
    return list;
  },

  // 2. Buscar detalhes de um profissional
  async fetchProfessionalById(id: string): Promise<Professional> {
    try {
      const { data } = await api.get(`/professionals/${id}`);
      if (data?.id) return data;
    } catch {
      // Fallback
    }

    const found = FALLBACK_PROFESSIONALS.find((p) => p.id === id);
    if (!found) {
      throw new Error('Profissional não encontrado');
    }
    return found;
  },

  // 3. Obter ou Criar Conversa Privada
  async getOrCreateConversation(
    professionalId: string
  ): Promise<{ conversation: Conversation; professional: Professional; isNew: boolean }> {
    try {
      const { data } = await api.post('/professionals/conversations', { professionalId });
      if (data?.conversation) return data;
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback local caso backend esteja offline
    const localKey = 'nutriplan_local_conversations';
    const raw = localStorage.getItem(localKey);
    const convs: Conversation[] = raw ? JSON.parse(raw) : [];

    const prof = await this.fetchProfessionalById(professionalId);
    if (prof.status !== 'ACTIVE') {
      throw new Error('Este profissional está temporariamente indisponível para novas conversas.');
    }

    const existing = convs.find((c) => c.professionalId === professionalId);
    if (existing) {
      return { conversation: existing, professional: prof, isNew: false };
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      userId: 'current_user',
      professionalId,
      professionalName: prof.name,
      professionalAvatar: prof.avatarUrl,
      professionalType: prof.type,
      professionalSpecialty: prof.specialty,
      professionalStatus: prof.status,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    convs.unshift(newConv);
    localStorage.setItem(localKey, JSON.stringify(convs));

    return { conversation: newConv, professional: prof, isNew: true };
  },

  // 4. Listar Conversas
  async fetchConversations(asProfessionalId?: string): Promise<Conversation[]> {
    try {
      const { data } = await api.get('/professionals/chat/conversations', {
        params: { asProfessionalId },
      });
      if (Array.isArray(data)) return data;
    } catch {
      // Fallback
    }

    const raw = localStorage.getItem('nutriplan_local_conversations');
    return raw ? JSON.parse(raw) : [];
  },

  // 5. Obter Mensagens da Conversa
  async fetchMessages(
    conversationId: string,
    asProfessionalId?: string
  ): Promise<{ conversation: Conversation; professional: Professional; messages: Message[] }> {
    try {
      const { data } = await api.get(`/professionals/conversations/${conversationId}/messages`, {
        params: { asProfessionalId },
      });
      if (data?.messages) return data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        throw new Error('Acesso negado: Você não é participante desta conversa.');
      }
    }

    // Fallback local
    const rawConvs = localStorage.getItem('nutriplan_local_conversations');
    const convs: Conversation[] = rawConvs ? JSON.parse(rawConvs) : [];
    const conv = convs.find((c) => c.id === conversationId);
    if (!conv) {
      throw new Error('Conversa não encontrada');
    }

    const prof = await this.fetchProfessionalById(conv.professionalId);

    const rawMsgs = localStorage.getItem(`nutriplan_msgs_${conversationId}`);
    const messages: Message[] = rawMsgs ? JSON.parse(rawMsgs) : [];

    return { conversation: conv, professional: prof, messages };
  },

  // 6. Enviar Mensagem
  async sendMessage(
    conversationId: string,
    content: string,
    senderType: 'USER' | 'PROFESSIONAL' = 'USER',
    asProfessionalId?: string
  ): Promise<{ message: Message; conversation: Conversation }> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error('A mensagem não pode estar vazia.');
    }

    try {
      const { data } = await api.post(`/professionals/conversations/${conversationId}/messages`, {
        content: trimmed,
        senderType,
        asProfessionalId,
      });
      if (data?.message) return data;
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback local
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: senderType === 'USER' ? 'current_user' : (asProfessionalId || 'prof_fallback'),
      senderType,
      content: trimmed,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    const msgKey = `nutriplan_msgs_${conversationId}`;
    const rawMsgs = localStorage.getItem(msgKey);
    const msgs: Message[] = rawMsgs ? JSON.parse(rawMsgs) : [];
    msgs.push(newMsg);
    localStorage.setItem(msgKey, JSON.stringify(msgs));

    // Atualizar conversa
    const convKey = 'nutriplan_local_conversations';
    const rawConvs = localStorage.getItem(convKey);
    const convs: Conversation[] = rawConvs ? JSON.parse(rawConvs) : [];
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageText = trimmed;
      conv.lastMessageAt = new Date().toISOString();
      if (senderType === 'USER') {
        conv.unreadCount += 1;
      }
      localStorage.setItem(convKey, JSON.stringify(convs));
    }

    return { message: newMsg, conversation: conv || ({} as any) };
  },

  // 7. Compartilhar Perfil de Saúde
  async shareProfile(
    conversationId: string,
    profileData: SharedProfileContext
  ): Promise<{ conversation: Conversation; message: Message }> {
    try {
      const { data } = await api.post(
        `/professionals/conversations/${conversationId}/share-profile`,
        profileData
      );
      if (data?.message) return data;
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Fallback local
    const summaryParts = ['📋 [DADOS DE SAÚDE COMPARTILHADOS PELO PACIENTE]'];
    if (profileData.goal) summaryParts.push(`🎯 Objetivo: ${profileData.goal}`);
    if (profileData.weight) summaryParts.push(`⚖️ Peso: ${profileData.weight} kg`);
    if (profileData.height) summaryParts.push(`📏 Altura: ${profileData.height} cm`);
    if (profileData.dietaryRestrictions && profileData.dietaryRestrictions.length > 0) {
      summaryParts.push(`🥗 Restrições: ${profileData.dietaryRestrictions.join(', ')}`);
    }
    if (profileData.trainingExperience) {
      summaryParts.push(`🏋️ Experiência: ${profileData.trainingExperience}`);
    }

    return this.sendMessage(conversationId, summaryParts.join('\n'), 'USER');
  },

  // 8. Marcar como Lido
  async markRead(conversationId: string, asProfessionalId?: string): Promise<void> {
    try {
      await api.post(`/professionals/conversations/${conversationId}/mark-read`, null, {
        params: { asProfessionalId },
      });
    } catch {
      // Fallback local
      const convKey = 'nutriplan_local_conversations';
      const rawConvs = localStorage.getItem(convKey);
      if (rawConvs) {
        const convs: Conversation[] = JSON.parse(rawConvs);
        const conv = convs.find((c) => c.id === conversationId);
        if (conv) {
          conv.unreadCount = 0;
          localStorage.setItem(convKey, JSON.stringify(convs));
        }
      }
    }
  },
};
