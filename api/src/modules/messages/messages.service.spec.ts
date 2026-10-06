import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessagesService } from './messages.service';
import { DatabaseService } from '../../database/database.service';

describe('MessagesService', () => {
  let db: DatabaseService;
  let service: MessagesService;

  beforeEach(() => {
    db = DatabaseService.createInMemory();
    service = new MessagesService(db);
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-MSG-001: deve enviar e recuperar mensagem entre usuário e profissional', async () => {
    // Cria um usuário cliente
    db.run(
      "INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at) VALUES ('cli-01', 'cli@teste.com', 'h', 'Lucas Cliente', 'USER', 'ACTIVE', '2026-01-01', '2026-01-01')"
    );

    // Cliente envia mensagem para nutricionista pré-semeada ('user-nutri-01')
    const msg = await service.sendMessage('cli-01', 'user-nutri-01', 'Olá Dra. Camila, gostaria de tirar uma dúvida sobre a dieta!');

    expect(msg.id).toBeDefined();
    expect(msg.content).toContain('dúvida sobre a dieta');

    // Recupera conversa
    const conversation = await service.getConversation('user-nutri-01', 'cli-01');
    expect(conversation.length).toBe(1);
    expect(conversation[0].content).toContain('dúvida sobre a dieta');

    // Nutricionista responde
    await service.sendMessage('user-nutri-01', 'cli-01', 'Olá Lucas! Claro, em que posso ajudar?');

    const updated = await service.getConversation('cli-01', 'user-nutri-01');
    expect(updated.length).toBe(2);
  });

  it('TEST-MSG-002: deve listar conversas recentes com contagem de não-lidas', async () => {
    db.run(
      "INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at) VALUES ('cli-02', 'cli2@teste.com', 'h', 'Ana Cliente', 'USER', 'ACTIVE', '2026-01-01', '2026-01-01')"
    );

    await service.sendMessage('cli-02', 'user-nutri-01', 'Oi doutora!');

    const conversations = await service.listConversations('user-nutri-01');
    expect(conversations.length).toBeGreaterThanOrEqual(1);
    const found = conversations.find((c) => c.contactId === 'cli-02');
    expect(found).toBeDefined();
    expect(found?.unreadCount).toBe(1);
  });
});
