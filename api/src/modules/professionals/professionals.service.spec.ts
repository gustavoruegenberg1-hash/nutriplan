import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfessionalsService } from './professionals.service';
import { DatabaseService } from '../../database/database.service';

describe('ProfessionalsService', () => {
  let db: DatabaseService;
  let service: ProfessionalsService;

  beforeEach(() => {
    db = DatabaseService.createInMemory();
    service = new ProfessionalsService(db);
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-PROF-001: deve registrar profissional com status PENDING e documentos', async () => {
    const res = await service.register({
      name: 'Dr. Roberto Nutricionista',
      email: 'roberto@nutri.com',
      password: 'password123',
      phone: '(11) 99999-8888',
      profession: 'NUTRITIONIST',
      specialty: 'Nutrição Esportiva',
      registryType: 'CRN',
      registryNumber: 'CRN-3 12345',
      experienceYears: 5,
      bio: 'Especialista em hipertrofia.',
      documents: [
        { name: 'diploma.pdf', type: 'application/pdf', size: 1024, url: '/docs/diploma.pdf' },
      ],
    });

    expect(res.status).toBe('PENDING');
    expect(res.userId).toBeDefined();

    const profile = await service.getMe(res.userId);
    expect(profile.status).toBe('PENDING');
    expect(profile.registryNumber).toBe('CRN-3 12345');
    expect(profile.documents.length).toBe(1);
  });

  it('TEST-PROF-002: deve listar apenas profissionais com status APPROVED no catálogo', async () => {
    const list = await service.listApproved();
    expect(list.length).toBeGreaterThanOrEqual(2); // Nutri e Treinador pré-semeados
    expect(list.every((p) => p.status === 'APPROVED')).toBe(true);
  });

  it('TEST-PROF-003: deve vincular cliente e listar na área do profissional', async () => {
    const clients = await service.getClients('user-nutri-01');
    expect(Array.isArray(clients)).toBe(true);

    // Cria um novo cliente
    db.run(
      "INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at) VALUES ('c1', 'cli@teste.com', 'h', 'Cliente Teste', 'USER', 'ACTIVE', '2026-01-01', '2026-01-01')"
    );

    await service.linkClient('user-nutri-01', 'c1', 'Acompanhamento inicial');

    const updatedClients = await service.getClients('user-nutri-01');
    expect(updatedClients.some((c) => c.clientId === 'c1')).toBe(true);
  });
});
