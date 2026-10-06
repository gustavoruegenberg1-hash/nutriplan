import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  NutritionCalculatorService,
  BiologicalGender,
  ActivityLevel,
  NutritionalGoal,
  MacroTargets,
} from '../nutrition/nutrition-calculator.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { randomUUID } from 'node:crypto';

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  profile: {
    age: number | null;
    gender: string | null;
    weight: number | null;
    height: number | null;
    activityLevel: string;
    goal: string;
    dietaryNotes: string | null;
    bmr: number | null;
    tdee: number | null;
  };
  targets: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams: number;
  } | null;
  restrictions: Array<{
    id: string;
    name: string;
    category: string;
    severity: string;
  }>;
  recentWeightHistory: Array<{
    id: string;
    weight: number;
    recordedAt: string;
    notes: string | null;
  }>;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: DatabaseService,
    private readonly nutritionCalc: NutritionCalculatorService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = this.db.queryOne<{ id: string; email: string; name: string; role: string }>(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let profile = this.db.queryOne<{
      id: string;
      age: number | null;
      gender: string | null;
      weight: number | null;
      height: number | null;
      activity_level: string;
      goal: string;
      dietary_notes: string | null;
      bmr: number | null;
      tdee: number | null;
    }>('SELECT * FROM profiles WHERE user_id = ?', [userId]);

    if (!profile) {
      const now = new Date().toISOString();
      const profileId = randomUUID();
      this.db.run(
        `INSERT INTO profiles (id, user_id, age, gender, weight, height, activity_level, goal, dietary_notes, bmr, tdee, created_at, updated_at)
         VALUES (?, ?, NULL, NULL, NULL, NULL, 'SEDENTARY', 'MAINTAIN', NULL, NULL, NULL, ?, ?)`,
        [profileId, userId, now, now]
      );
      profile = {
        id: profileId,
        age: null,
        gender: null,
        weight: null,
        height: null,
        activity_level: 'SEDENTARY',
        goal: 'MAINTAIN',
        dietary_notes: null,
        bmr: null,
        tdee: null,
      };
    }

    // Calcula metas se os dados antropométricos estiverem presentes
    let targets: MacroTargets | null = null;
    if (profile.weight && profile.height && profile.age && profile.gender && profile.tdee) {
      targets = this.nutritionCalc.calculateTargets(
        profile.tdee,
        profile.goal as NutritionalGoal,
        profile.weight,
        profile.gender as BiologicalGender
      );
    }

    // Restrições ativas do usuário
    const restrictions = this.db.query<{
      id: string;
      name: string;
      category: string;
      severity: string;
    }>(
      `SELECT r.id, r.name, r.category, ur.severity
       FROM user_restrictions ur
       INNER JOIN restrictions r ON ur.restriction_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );

    // Histórico recente de peso
    const recentWeightHistory = this.db.query<{
      id: string;
      weight: number;
      recorded_at: string;
      notes: string | null;
    }>(
      'SELECT id, weight, recorded_at, notes FROM weight_history WHERE user_id = ? ORDER BY recorded_at DESC, rowid DESC LIMIT 10',
      [userId]
    ).map((w) => ({
      id: w.id,
      weight: w.weight,
      recordedAt: w.recorded_at,
      notes: w.notes,
    }));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      profile: {
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        activityLevel: profile.activity_level,
        goal: profile.goal,
        dietaryNotes: profile.dietary_notes,
        bmr: profile.bmr,
        tdee: profile.tdee,
      },
      targets,
      restrictions,
      recentWeightHistory,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponse> {
    const current = await this.getProfile(userId);
    const now = new Date().toISOString();

    const newAge = dto.age !== undefined ? dto.age : current.profile.age;
    const newGender = dto.gender !== undefined ? dto.gender.toUpperCase() : current.profile.gender;
    const newWeight = dto.weight !== undefined ? dto.weight : current.profile.weight;
    const newHeight = dto.height !== undefined ? dto.height : current.profile.height;
    const normalizeActivity = (act?: string): string => {
      if (!act) return 'SEDENTARY';
      const upper = act.toUpperCase();
      if (upper === 'LIGHT') return 'LIGHTLY_ACTIVE';
      if (upper === 'MODERATE') return 'MODERATELY_ACTIVE';
      if (upper === 'INTENSE') return 'VERY_ACTIVE';
      if (upper === 'VERY_INTENSE') return 'EXTRA_ACTIVE';
      return upper;
    };

    const newActivity = dto.activityLevel !== undefined ? normalizeActivity(dto.activityLevel) : current.profile.activityLevel;
    const newGoal = dto.goal !== undefined ? dto.goal.toUpperCase() : current.profile.goal;
    const newNotes = dto.dietaryNotes !== undefined ? dto.dietaryNotes : current.profile.dietaryNotes;

    // Recalcula BMR e TDEE se os dados essenciais estiverem preenchidos
    let computedBmr: number | null = null;
    let computedTdee: number | null = null;

    if (newWeight && newHeight && newAge && newGender) {
      computedBmr = this.nutritionCalc.calculateBMR(newWeight, newHeight, newAge, newGender as BiologicalGender);
      computedTdee = this.nutritionCalc.calculateTDEE(computedBmr, newActivity as ActivityLevel);
    }

    this.db.transaction(() => {
      // 1. Atualiza nome do usuário se fornecido
      if (dto.name && dto.name.trim()) {
        this.db.run('UPDATE users SET name = ?, updated_at = ? WHERE id = ?', [dto.name.trim(), now, userId]);
      }

      // 2. Atualiza perfil
      this.db.run(
        `UPDATE profiles
         SET age = ?, gender = ?, weight = ?, height = ?, activity_level = ?, goal = ?, dietary_notes = ?, bmr = ?, tdee = ?, updated_at = ?
         WHERE user_id = ?`,
        [newAge, newGender, newWeight, newHeight, newActivity, newGoal, newNotes, computedBmr, computedTdee, now, userId]
      );

      // 3. Se o peso mudou e é válido, registra no histórico de peso
      if (dto.weight !== undefined && dto.weight !== current.profile.weight) {
        this.db.run(
          `INSERT INTO weight_history (id, user_id, weight, recorded_at, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [randomUUID(), userId, dto.weight, now, 'Atualização de perfil']
        );
      }

      // 4. Se restrições foram informadas, atualiza N:M
      if (dto.restrictionIds !== undefined) {
        this.db.run('DELETE FROM user_restrictions WHERE user_id = ?', [userId]);
        for (const resId of dto.restrictionIds) {
          const exists = this.db.queryOne('SELECT id FROM restrictions WHERE id = ?', [resId]);
          if (exists) {
            this.db.run(
              `INSERT INTO user_restrictions (id, user_id, restriction_id, severity, created_at)
               VALUES (?, ?, ?, 'ALLERGY', ?)`,
              [randomUUID(), userId, resId, now]
            );
          }
        }
      }

      // 5. Auditoria
      this.db.run(
        `INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details_json, created_at)
         VALUES (?, ?, 'PROFILE_UPDATED', 'profiles', ?, ?, ?)`,
        [randomUUID(), userId, userId, JSON.stringify({ age: newAge, weight: newWeight, goal: newGoal }), now]
      );
    });

    return this.getProfile(userId);
  }

  async getAllAvailableRestrictions(): Promise<Array<{ id: string; name: string; category: string; description: string }>> {
    return this.db.query('SELECT id, name, category, description FROM restrictions WHERE is_active = 1 ORDER BY name');
  }

  async addWeightRecord(userId: string, weight: number, notes?: string): Promise<{ id: string; weight: number; recordedAt: string }> {
    if (!weight || weight < 20 || weight > 350) {
      throw new BadRequestException('Peso deve estar entre 20 e 350 kg.');
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.db.run(
        `INSERT INTO weight_history (id, user_id, weight, recorded_at, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [id, userId, weight, now, notes || null]
      );

      // Atualiza peso no perfil e recalcula TMB/TDEE
      this.db.run('UPDATE profiles SET weight = ?, updated_at = ? WHERE user_id = ?', [weight, now, userId]);

      const profile = this.db.queryOne<{ age: number; height: number; gender: string; activity_level: string }>(
        'SELECT age, height, gender, activity_level FROM profiles WHERE user_id = ?',
        [userId]
      );

      if (profile && profile.age && profile.height && profile.gender) {
        const bmr = this.nutritionCalc.calculateBMR(weight, profile.height, profile.age, profile.gender as BiologicalGender);
        const tdee = this.nutritionCalc.calculateTDEE(bmr, profile.activity_level as ActivityLevel);
        this.db.run('UPDATE profiles SET bmr = ?, tdee = ? WHERE user_id = ?', [bmr, tdee, userId]);
      }
    });

    return { id, weight, recordedAt: now };
  }
}
