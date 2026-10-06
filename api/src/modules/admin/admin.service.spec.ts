import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminService } from './admin.service';
import { DatabaseService } from '../../database/database.service';

describe('AdminService', () => {
  let db: DatabaseService;
  let service: AdminService;

  beforeEach(() => {
    db = DatabaseService.createInMemory();
    service = new AdminService(db);
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-ADM-001: deve obter visão geral com contadores do sistema', async () => {
    const overview = await service.getOverview();
    expect(overview.metrics.totalProfessionals).toBeGreaterThanOrEqual(3);
    expect(overview.metrics.pendingProfessionals).toBeGreaterThanOrEqual(1);
    expect(overview.metrics.approvedProfessionals).toBeGreaterThanOrEqual(2);
  });

  it('TEST-ADM-002: administrador deve aprovar ou recusar profissional com justificativa', async () => {
    // Atualiza status do profissional pendente
    const res = await service.updateProfessionalStatus(
      'user-admin-01',
      'prof-03',
      'APPROVED',
      'Documentação e registro CRN validados com sucesso.'
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe('APPROVED');

    const profs = await service.listProfessionals('APPROVED');
    const updated = profs.find((p) => p.id === 'prof-03');
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('APPROVED');
    expect(updated?.reviewNotes).toContain('validados com sucesso');
  });

  it('TEST-ADM-003: deve listar todos os usuários do sistema', async () => {
    const users = await service.listUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users.some((u: any) => u.email === 'admin@nutriplan.com')).toBe(true);
  });
});
