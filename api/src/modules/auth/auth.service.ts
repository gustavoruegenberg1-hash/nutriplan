import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(private readonly db: DatabaseService) {
    this.jwtSecret = process.env.JWT_SECRET || 'nutriplan-super-secret-academic-key-2026';
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // RN01: E-mail deve ser único
    const existing = this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      throw new ConflictException('Este e-mail já está cadastrado no sistema.');
    }

    const userId = randomUUID();
    const profileId = randomUUID();
    const now = new Date().toISOString();
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(dto.password, saltRounds);

    this.db.transaction(() => {
      // 1. Cria usuário
      this.db.run(
        `INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'USER', 'ACTIVE', ?, ?)`,
        [userId, normalizedEmail, passwordHash, dto.name.trim(), now, now]
      );

      // 2. Inicializa perfil antropométrico padrão
      this.db.run(
        `INSERT INTO profiles (id, user_id, age, gender, weight, height, activity_level, goal, dietary_notes, bmr, tdee, created_at, updated_at)
         VALUES (?, ?, NULL, NULL, NULL, NULL, 'SEDENTARY', 'MAINTAIN', NULL, NULL, NULL, ?, ?)`,
        [profileId, userId, now, now]
      );

      // 3. Log de auditoria
      this.db.run(
        `INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details_json, created_at)
         VALUES (?, ?, 'USER_REGISTERED', 'users', ?, ?, ?)`,
        [randomUUID(), userId, userId, JSON.stringify({ email: normalizedEmail }), now]
      );
    });

    const user: AuthUser = {
      id: userId,
      email: normalizedEmail,
      name: dto.name.trim(),
      role: 'USER',
      status: 'ACTIVE',
      createdAt: now,
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const userRecord = this.db.queryOne<{
      id: string;
      email: string;
      password_hash: string;
      name: string;
      role: string;
      status: string;
      created_at: string;
    }>('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!userRecord) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (userRecord.status === 'BANNED' || userRecord.status === 'INACTIVE') {
      throw new UnauthorizedException('Esta conta está inativa ou bloqueada.');
    }

    const passwordMatch = bcrypt.compareSync(dto.password, userRecord.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const user: AuthUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      status: userRecord.status,
      createdAt: userRecord.created_at,
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const userRecord = this.db.queryOne<{
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      created_at: string;
    }>('SELECT id, email, name, role, status, created_at FROM users WHERE id = ?', [userId]);

    if (!userRecord) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      status: userRecord.status,
      createdAt: userRecord.created_at,
    };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }
  }

  private generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}
