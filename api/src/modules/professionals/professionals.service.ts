import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegisterProfessionalDto } from './dto/professional.dtos';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

export interface ProfessionalListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  profession: string;
  specialty: string | null;
  registryType: string | null;
  registryNumber: string | null;
  experienceYears: number;
  bio: string | null;
  status: string;
  createdAt: string;
}

@Injectable()
export class ProfessionalsService {
  constructor(private readonly db: DatabaseService) {}

  async register(dto: RegisterProfessionalDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const userId = randomUUID();
    const profProfileId = randomUUID();
    const now = new Date().toISOString();
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(dto.password, saltRounds);

    const documentsJson = dto.documents && dto.documents.length > 0 ? JSON.stringify(dto.documents) : '[]';

    this.db.transaction(() => {
      // 1. Cria usuário com papel 'PROFESSIONAL'
      this.db.run(
        `INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'PROFESSIONAL', 'ACTIVE', ?, ?)`,
        [userId, normalizedEmail, passwordHash, dto.name.trim(), now, now]
      );

      // 2. Cria perfil pessoal básico
      this.db.run(
        `INSERT INTO profiles (id, user_id, activity_level, goal, created_at, updated_at)
         VALUES (?, ?, 'MODERATELY_ACTIVE', 'MAINTAIN', ?, ?)`,
        [randomUUID(), userId, now, now]
      );

      // 3. Cria perfil profissional com status PENDING (Em análise)
      this.db.run(
        `INSERT INTO professional_profiles (
           id, user_id, profession, specialty, registry_type, registry_number,
           experience_years, bio, phone, status, documents_json, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
        [
          profProfileId,
          userId,
          dto.profession.toUpperCase(),
          dto.specialty || null,
          dto.registryType ? dto.registryType.toUpperCase() : null,
          dto.registryNumber || null,
          dto.experienceYears || 0,
          dto.bio || null,
          dto.phone || null,
          documentsJson,
          now,
          now,
        ]
      );
    });

    return {
      message: 'Cadastro profissional enviado com sucesso! Seus dados e documentos estão em análise.',
      status: 'PENDING',
      userId,
    };
  }

  async listApproved(): Promise<ProfessionalListItem[]> {
    const rows = this.db.query<any>(
      `SELECT p.id, p.user_id as userId, u.name, u.email, p.phone, p.profession,
              p.specialty, p.registry_type as registryType, p.registry_number as registryNumber,
              p.experience_years as experienceYears, p.bio, p.status, p.created_at as createdAt
       FROM professional_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'APPROVED'
       ORDER BY u.name ASC`
    );
    return rows;
  }

  async getMe(userId: string) {
    const profile = this.db.queryOne<any>(
      `SELECT p.*, u.name, u.email, u.role
       FROM professional_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?`,
      [userId]
    );

    if (!profile) {
      throw new NotFoundException('Perfil profissional não encontrado.');
    }

    let documents = [];
    try {
      documents = profile.documents_json ? JSON.parse(profile.documents_json) : [];
    } catch {
      documents = [];
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      name: profile.name,
      email: profile.email,
      profession: profile.profession,
      specialty: profile.specialty,
      registryType: profile.registry_type,
      registryNumber: profile.registry_number,
      experienceYears: profile.experience_years,
      bio: profile.bio,
      phone: profile.phone,
      status: profile.status,
      reviewedBy: profile.reviewed_by,
      reviewedAt: profile.reviewed_at,
      reviewNotes: profile.review_notes,
      documents,
      createdAt: profile.created_at,
    };
  }

  async getClients(professionalUserId: string) {
    const rows = this.db.query<any>(
      `SELECT pc.id as connectionId, pc.status as connectionStatus, pc.created_at as linkedAt,
              u.id as clientId, u.name as clientName, u.email as clientEmail,
              pr.weight, pr.height, pr.goal, pr.activity_level as activityLevel
       FROM professional_clients pc
       JOIN users u ON u.id = pc.client_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       WHERE pc.professional_id = ?
       ORDER BY pc.created_at DESC`,
      [professionalUserId]
    );

    // Complementa com resumos de dietas ativas e treinos
    const clientsWithDetails = rows.map((client) => {
      const activeDiet = this.db.queryOne<{ id: string; name: string }>(
        'SELECT id, name FROM diets WHERE user_id = ? AND is_active = 1 LIMIT 1',
        [client.clientId]
      );
      const workoutCount = this.db.queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM workouts WHERE user_id = ?',
        [client.clientId]
      );

      return {
        ...client,
        activeDiet: activeDiet ? activeDiet.name : 'Nenhuma dieta ativa',
        totalWorkouts: workoutCount ? workoutCount.count : 0,
      };
    });

    return clientsWithDetails;
  }

  async linkClient(professionalUserId: string, clientId: string, notes?: string) {
    const client = this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE id = ?', [clientId]);
    if (!client) {
      throw new NotFoundException('Usuário cliente não encontrado.');
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO professional_clients (id, professional_id, client_id, status, notes, created_at)
       VALUES (?, ?, ?, 'ACTIVE', ?, ?)
       ON CONFLICT(professional_id, client_id) DO UPDATE SET status = 'ACTIVE'`,
      [id, professionalUserId, clientId, notes || null, now]
    );

    return { success: true, message: 'Cliente vinculado com sucesso!' };
  }
}
