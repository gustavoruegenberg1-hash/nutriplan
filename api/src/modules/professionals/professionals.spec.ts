import { describe, it, expect, beforeEach } from 'vitest';
import { FirestoreProfessionalRepository } from './infrastructure/repositories/firestore-professional.repository';
import { ListProfessionalsUseCase } from './application/use-cases/list-professionals.use-case';
import { GetProfessionalUseCase } from './application/use-cases/get-professional.use-case';
import { GetOrCreateConversationUseCase } from './application/use-cases/get-or-create-conversation.use-case';
import { ListConversationsUseCase } from './application/use-cases/list-conversations.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ShareProfileUseCase } from './application/use-cases/share-profile.use-case';
import { MarkReadUseCase } from './application/use-cases/mark-read.use-case';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Professionals & Private Chat System', () => {
  let repository: FirestoreProfessionalRepository;
  let mockFirebase: any;
  let mockUserRepo: any;

  let listProfessionalsUseCase: ListProfessionalsUseCase;
  let getProfessionalUseCase: GetProfessionalUseCase;
  let getOrCreateConvUseCase: GetOrCreateConversationUseCase;
  let listConversationsUseCase: ListConversationsUseCase;
  let getMessagesUseCase: GetMessagesUseCase;
  let sendMessageUseCase: SendMessageUseCase;
  let shareProfileUseCase: ShareProfileUseCase;
  let markReadUseCase: MarkReadUseCase;

  beforeEach(() => {
    mockFirebase = { getDb: () => null };
    mockUserRepo = {
      findById: async (id: string) => ({
        id,
        name: 'Usuário Teste NutriPlan',
        email: 'usuario@teste.com',
      }),
    };

    repository = new FirestoreProfessionalRepository(mockFirebase);
    repository.resetForTest();
    listProfessionalsUseCase = new ListProfessionalsUseCase(repository);
    getProfessionalUseCase = new GetProfessionalUseCase(repository);
    getOrCreateConvUseCase = new GetOrCreateConversationUseCase(repository);
    listConversationsUseCase = new ListConversationsUseCase(repository, mockUserRepo);
    getMessagesUseCase = new GetMessagesUseCase(repository);
    sendMessageUseCase = new SendMessageUseCase(repository);
    shareProfileUseCase = new ShareProfileUseCase(repository);
    markReadUseCase = new MarkReadUseCase(repository);
  });

  it('1. Deve listar profissionais e filtrar por tipo (NUTRICIONISTA vs TREINADOR)', async () => {
    const all = await listProfessionalsUseCase.execute();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const nutritionists = await listProfessionalsUseCase.execute({ type: 'NUTRITIONIST' });
    expect(nutritionists.every((p) => p.type === 'NUTRITIONIST')).toBe(true);
    expect(nutritionists.some((p) => p.registrationNumber.startsWith('CRN'))).toBe(true);

    const trainers = await listProfessionalsUseCase.execute({ type: 'TRAINER' });
    expect(trainers.every((p) => p.type === 'TRAINER')).toBe(true);
    expect(trainers.some((p) => p.registrationNumber.startsWith('CREF'))).toBe(true);
  });

  it('2. Deve buscar profissionais por texto (nome ou especialidade)', async () => {
    const searchRes = await listProfessionalsUseCase.execute({ search: 'Camila' });
    expect(searchRes.length).toBe(1);
    expect(searchRes[0].name).toContain('Camila');

    const searchBiomec = await listProfessionalsUseCase.execute({ search: 'Biomecânica' });
    expect(searchBiomec.length).toBeGreaterThanOrEqual(1);
    expect(searchBiomec[0].specialty).toContain('Biomecânica');
  });

  it('3. Deve obter detalhes de um profissional ou lançar NotFoundException', async () => {
    const prof = await getProfessionalUseCase.execute('prof_dra_camila');
    expect(prof.id).toBe('prof_dra_camila');
    expect(prof.registrationNumber).toBe('CRN-3 45892');

    await expect(getProfessionalUseCase.execute('id_inexistente')).rejects.toThrow(
      NotFoundException
    );
  });

  it('4. Deve criar conversa garantindo unicidade por usuário e profissional', async () => {
    const res1 = await getOrCreateConvUseCase.execute('user_123', 'prof_dra_camila');
    expect(res1.conversation.id).toBeDefined();
    expect(res1.isNew).toBe(true);

    // Segunda chamada para a mesma dupla deve retornar a mesma conversa (sem duplicar!)
    const res2 = await getOrCreateConvUseCase.execute('user_123', 'prof_dra_camila');
    expect(res2.conversation.id).toBe(res1.conversation.id);
    expect(res2.isNew).toBe(false);
  });

  it('5. Não deve permitir iniciar nova conversa com profissional indisponível', async () => {
    await expect(
      getOrCreateConvUseCase.execute('user_123', 'prof_dr_eduardo')
    ).rejects.toThrow(BadRequestException);
  });

  it('6. Deve enviar mensagem, atualizar contadores e bloquear mensagens vazias', async () => {
    const { conversation } = await getOrCreateConvUseCase.execute('user_456', 'prof_rafael_torres');

    // Mensagem vazia deve ser rejeitada
    await expect(
      sendMessageUseCase.execute(conversation.id, 'user_456', { content: '   ' })
    ).rejects.toThrow(BadRequestException);

    // Mensagem válida do usuário
    const sendRes = await sendMessageUseCase.execute(conversation.id, 'user_456', {
      content: 'Olá professor Rafael, gostaria de tirar uma dúvida sobre treino.',
    });
    expect(sendRes.message.id).toBeDefined();
    expect(sendRes.message.senderType).toBe('USER');
    expect(sendRes.conversation.lastMessageText).toContain('Olá professor');
    expect(sendRes.conversation.professionalUnreadCount).toBe(1);
  });

  it('7. Segurança: Usuário não participante não pode visualizar mensagens de terceiros', async () => {
    const { conversation } = await getOrCreateConvUseCase.execute('user_dono', 'prof_dra_camila');

    // user_invasor tenta ler mensagens da conversa de user_dono
    await expect(
      getMessagesUseCase.execute(conversation.id, 'user_invasor')
    ).rejects.toThrow(ForbiddenException);

    // user_dono consegue ler normalmente
    const history = await getMessagesUseCase.execute(conversation.id, 'user_dono');
    expect(history.conversation.id).toBe(conversation.id);
  });

  it('8. Deve permitir ao usuário compartilhar dados contextuais de saúde', async () => {
    const { conversation } = await getOrCreateConvUseCase.execute('user_saude', 'prof_dra_camila');

    const shareRes = await shareProfileUseCase.execute(conversation.id, 'user_saude', {
      goal: 'Hipertrofia Limpa',
      weight: 78,
      height: 180,
      dietaryRestrictions: ['Intolerância a lactose'],
      trainingExperience: '3 anos de musculação',
    });

    expect(shareRes.conversation.sharedProfile?.goal).toBe('Hipertrofia Limpa');
    expect(shareRes.message.content).toContain('DADOS DE SAÚDE COMPARTILHADOS');
    expect(shareRes.message.content).toContain('78 kg');
  });
});
