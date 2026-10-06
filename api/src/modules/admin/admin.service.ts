import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  async getOverview() {
    const totalUsers = this.db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'USER'");
    const totalProfessionals = this.db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM professional_profiles");
    const pendingProfessionals = this.db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM professional_profiles WHERE status = 'PENDING'");
    const approvedProfessionals = this.db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM professional_profiles WHERE status = 'APPROVED'");
    const totalDiets = this.db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM diets');
    const totalWorkouts = this.db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM workouts');

    const recentUsers = this.db.query<any>(
      "SELECT id, name, email, role, status, created_at as createdAt FROM users ORDER BY created_at DESC LIMIT 5"
    );

    return {
      metrics: {
        totalUsers: totalUsers ? totalUsers.count : 0,
        totalProfessionals: totalProfessionals ? totalProfessionals.count : 0,
        pendingProfessionals: pendingProfessionals ? pendingProfessionals.count : 0,
        approvedProfessionals: approvedProfessionals ? approvedProfessionals.count : 0,
        totalDiets: totalDiets ? totalDiets.count : 0,
        totalWorkouts: totalWorkouts ? totalWorkouts.count : 0,
      },
      recentUsers,
    };
  }

  async listProfessionals(statusFilter?: string) {
    let sql = `
      SELECT p.*, u.name, u.email
      FROM professional_profiles p
      JOIN users u ON u.id = p.user_id
    `;
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'ALL') {
      sql += ' WHERE p.status = ?';
      params.push(statusFilter.toUpperCase());
    }

    sql += ' ORDER BY p.created_at DESC';

    const rows = this.db.query<any>(sql, params);

    return rows.map((r) => {
      let documents = [];
      try {
        documents = r.documents_json ? JSON.parse(r.documents_json) : [];
      } catch {
        documents = [];
      }
      return {
        id: r.id,
        userId: r.user_id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        profession: r.profession,
        specialty: r.specialty,
        registryType: r.registry_type,
        registryNumber: r.registry_number,
        experienceYears: r.experience_years,
        bio: r.bio,
        status: r.status,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        reviewNotes: r.review_notes,
        documents,
        createdAt: r.created_at,
      };
    });
  }

  async updateProfessionalStatus(
    adminUserId: string,
    profId: string,
    status: string,
    reviewNotes?: string,
  ) {
    const validStatuses = ['APPROVED', 'REJECTED', 'CORRECTION_REQUESTED', 'PENDING'];
    const upperStatus = status.toUpperCase();

    if (!validStatuses.includes(upperStatus)) {
      throw new BadRequestException(`Status inválido. Escolha um entre: ${validStatuses.join(', ')}`);
    }

    const prof = this.db.queryOne<{ id: string; user_id: string }>(
      'SELECT id, user_id FROM professional_profiles WHERE id = ?',
      [profId]
    );

    if (!prof) {
      throw new NotFoundException('Perfil profissional não encontrado.');
    }

    const now = new Date().toISOString();

    this.db.run(
      `UPDATE professional_profiles
       SET status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, updated_at = ?
       WHERE id = ?`,
      [upperStatus, adminUserId, now, reviewNotes || null, now, profId]
    );

    // Registra auditoria
    this.db.run(
      `INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details_json, created_at)
       VALUES (?, ?, ?, 'PROFESSIONAL_PROFILE', ?, ?, ?)`,
      [
        randomUUID(),
        adminUserId,
        `UPDATE_STATUS_TO_${upperStatus}`,
        profId,
        JSON.stringify({ newStatus: upperStatus, reviewNotes }),
        now,
      ]
    );

    return {
      success: true,
      message: `Status do profissional atualizado para ${upperStatus}.`,
      status: upperStatus,
    };
  }

  async listUsers() {
    const rows = this.db.query<any>(`
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at as createdAt,
             p.weight, p.height, p.goal, p.activity_level as activityLevel
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }
}
