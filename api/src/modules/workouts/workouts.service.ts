import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateWorkoutDto,
  AddWorkoutExerciseDto,
  UpdateWorkoutExerciseDto,
  CreateWorkoutLogDto,
} from './dto/workout.dtos';
import { randomUUID } from 'node:crypto';

export interface ExerciseEntity {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  difficultyLevel: string;
  instructions: string | null;
  isActive: boolean;
}

export interface DetailedWorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  orderIndex: number;
  sets: number;
  reps: number;
  weightKg: number;
  restSeconds: number;
  notes: string | null;
}

export interface DetailedWorkout {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  splitName: string | null;
  estimatedDurationMin: number;
  isActive: boolean;
  exercises: DetailedWorkoutExercise[];
  totalSets: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutLogEntity {
  id: string;
  userId: string;
  workoutId: string | null;
  workoutName: string;
  performedDate: string;
  durationMin: number;
  notes: string | null;
  exercises: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    setsCompleted: number;
    repsCompleted: number;
    weightUsedKg: number;
    notes: string | null;
  }>;
  createdAt: string;
}

@Injectable()
export class WorkoutsService {
  constructor(private readonly db: DatabaseService) {}

  // 1. Catálogo de Exercícios
  async searchExercises(params: {
    query?: string;
    muscleGroup?: string;
    equipment?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ExerciseEntity[]; total: number }> {
    const limit = Math.min(Math.max(params.limit || 50, 1), 200);
    const offset = Math.max(params.offset || 0, 0);

    const conditions: string[] = ['is_active = 1'];
    const sqlParams: any[] = [];

    if (params.query && params.query.trim()) {
      const q = `%${params.query.trim().toLowerCase()}%`;
      conditions.push('(LOWER(name) LIKE ? OR LOWER(equipment) LIKE ?)');
      sqlParams.push(q, q);
    }

    if (params.muscleGroup && params.muscleGroup !== 'ALL') {
      conditions.push('muscle_group = ?');
      sqlParams.push(params.muscleGroup.toUpperCase());
    }

    if (params.equipment && params.equipment !== 'ALL') {
      conditions.push('equipment = ?');
      sqlParams.push(params.equipment);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM exercises ${whereClause}`,
      sqlParams
    );
    const total = countRes ? countRes.count : 0;

    const rows = this.db.query(
      `SELECT * FROM exercises ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...sqlParams, limit, offset]
    );

    const items: ExerciseEntity[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      muscleGroup: r.muscle_group,
      equipment: r.equipment,
      difficultyLevel: r.difficulty_level,
      instructions: r.instructions,
      isActive: Boolean(r.is_active),
    }));

    return { items, total };
  }

  async getExerciseById(id: string): Promise<ExerciseEntity> {
    const row = this.db.queryOne('SELECT * FROM exercises WHERE id = ?', [id]);
    if (!row) {
      throw new NotFoundException(`Exercício com id "${id}" não encontrado.`);
    }
    return {
      id: row.id,
      name: row.name,
      muscleGroup: row.muscle_group,
      equipment: row.equipment,
      difficultyLevel: row.difficulty_level,
      instructions: row.instructions,
      isActive: Boolean(row.is_active),
    };
  }

  // 2. Rotinas de Treino do Usuário
  async listUserWorkouts(userId: string): Promise<Array<{
    id: string;
    name: string;
    description: string | null;
    splitName: string | null;
    estimatedDurationMin: number;
    exercisesCount: number;
    isActive: boolean;
  }>> {
    const rows = this.db.query(
      `SELECT w.id, w.name, w.description, w.split_name, w.estimated_duration_min, w.is_active,
              COUNT(we.id) as exercises_count
       FROM workouts w
       LEFT JOIN workout_exercises we ON w.id = we.workout_id
       WHERE w.user_id = ?
       GROUP BY w.id
       ORDER BY w.is_active DESC, w.created_at DESC`,
      [userId]
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      splitName: r.split_name,
      estimatedDurationMin: r.estimated_duration_min,
      exercisesCount: Number(r.exercises_count) || 0,
      isActive: Boolean(r.is_active),
    }));
  }

  async createWorkout(userId: string, dto: CreateWorkoutDto): Promise<DetailedWorkout> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO workouts (id, user_id, name, description, split_name, estimated_duration_min, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, userId, dto.name.trim(), dto.description || null, dto.splitName || null, dto.estimatedDurationMin || 45, now, now]
    );

    return this.getWorkoutById(userId, id);
  }

  async getWorkoutById(userId: string, workoutId: string): Promise<DetailedWorkout> {
    const workout = this.db.queryOne<{
      id: string;
      user_id: string;
      name: string;
      description: string | null;
      split_name: string | null;
      estimated_duration_min: number;
      is_active: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM workouts WHERE id = ?', [workoutId]);

    if (!workout) {
      throw new NotFoundException('Treino não encontrado.');
    }

    // RN14 / RN20: Isolamento multiusuário
    if (workout.user_id !== userId) {
      throw new ForbiddenException('Acesso negado: este treino pertence a outro usuário.');
    }

    const exerciseRows = this.db.query(
      `SELECT we.id, we.exercise_id, we.order_index, we.sets, we.reps, we.weight_kg, we.rest_seconds, we.notes,
              e.name, e.muscle_group, e.equipment
       FROM workout_exercises we
       INNER JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?
       ORDER BY we.order_index ASC`,
      [workoutId]
    );

    let totalSets = 0;
    const exercises: DetailedWorkoutExercise[] = exerciseRows.map((r) => {
      totalSets += r.sets;
      return {
        id: r.id,
        exerciseId: r.exercise_id,
        name: r.name,
        muscleGroup: r.muscle_group,
        equipment: r.equipment,
        orderIndex: r.order_index,
        sets: r.sets,
        reps: r.reps,
        weightKg: r.weight_kg,
        restSeconds: r.rest_seconds,
        notes: r.notes,
      };
    });

    return {
      id: workout.id,
      userId: workout.user_id,
      name: workout.name,
      description: workout.description,
      splitName: workout.split_name,
      estimatedDurationMin: workout.estimated_duration_min,
      isActive: Boolean(workout.is_active),
      exercises,
      totalSets,
      createdAt: workout.created_at,
      updatedAt: workout.updated_at,
    };
  }

  async updateWorkout(userId: string, workoutId: string, dto: CreateWorkoutDto): Promise<DetailedWorkout> {
    await this.getWorkoutById(userId, workoutId);
    const now = new Date().toISOString();

    this.db.run(
      `UPDATE workouts
       SET name = ?, description = ?, split_name = ?, estimated_duration_min = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [dto.name.trim(), dto.description || null, dto.splitName || null, dto.estimatedDurationMin || 45, now, workoutId, userId]
    );

    return this.getWorkoutById(userId, workoutId);
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<{ success: boolean; message: string }> {
    await this.getWorkoutById(userId, workoutId);

    // RN24: Exclui o plano de treino. Graças a FOREIGN KEY ON DELETE SET NULL em workout_logs, o histórico fica preservado!
    this.db.run('DELETE FROM workouts WHERE id = ? AND user_id = ?', [workoutId, userId]);
    return { success: true, message: 'Treino excluído com sucesso.' };
  }

  async addExerciseToWorkout(userId: string, workoutId: string, dto: AddWorkoutExerciseDto): Promise<DetailedWorkout> {
    await this.getWorkoutById(userId, workoutId);

    // RN15 / RN21: Exercício deve existir
    const ex = this.db.queryOne('SELECT id FROM exercises WHERE id = ?', [dto.exerciseId]);
    if (!ex) {
      throw new NotFoundException('Exercício não encontrado no catálogo.');
    }

    // RN16 / RN22: Séries e repetições válidas
    if (dto.sets < 1 || dto.sets > 20 || dto.reps < 1 || dto.reps > 100) {
      throw new BadRequestException('Configuração de séries (1-20) ou repetições (1-100) inválida.');
    }

    const id = randomUUID();
    const maxOrder = this.db.queryOne<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM workout_exercises WHERE workout_id = ?',
      [workoutId]
    );
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    this.db.run(
      `INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, weight_kg, rest_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        workoutId,
        dto.exerciseId,
        dto.orderIndex ?? nextOrder,
        dto.sets,
        dto.reps,
        dto.weightKg ?? 0,
        dto.restSeconds ?? 60,
        dto.notes || null,
      ]
    );

    this.db.run('UPDATE workouts SET updated_at = ? WHERE id = ?', [new Date().toISOString(), workoutId]);
    return this.getWorkoutById(userId, workoutId);
  }

  async updateWorkoutExercise(
    userId: string,
    workoutId: string,
    workoutExerciseId: string,
    dto: UpdateWorkoutExerciseDto
  ): Promise<DetailedWorkout> {
    await this.getWorkoutById(userId, workoutId);

    const we = this.db.queryOne('SELECT * FROM workout_exercises WHERE id = ? AND workout_id = ?', [
      workoutExerciseId,
      workoutId,
    ]);
    if (!we) {
      throw new NotFoundException('Exercício não encontrado neste treino.');
    }

    const sets = dto.sets !== undefined ? dto.sets : we.sets;
    const reps = dto.reps !== undefined ? dto.reps : we.reps;
    const weight = dto.weightKg !== undefined ? dto.weightKg : we.weight_kg;
    const rest = dto.restSeconds !== undefined ? dto.restSeconds : we.rest_seconds;
    const order = dto.orderIndex !== undefined ? dto.orderIndex : we.order_index;
    const notes = dto.notes !== undefined ? dto.notes : we.notes;

    this.db.run(
      `UPDATE workout_exercises
       SET sets = ?, reps = ?, weight_kg = ?, rest_seconds = ?, order_index = ?, notes = ?
       WHERE id = ?`,
      [sets, reps, weight, rest, order, notes, workoutExerciseId]
    );

    this.db.run('UPDATE workouts SET updated_at = ? WHERE id = ?', [new Date().toISOString(), workoutId]);
    return this.getWorkoutById(userId, workoutId);
  }

  async removeWorkoutExercise(userId: string, workoutId: string, workoutExerciseId: string): Promise<DetailedWorkout> {
    await this.getWorkoutById(userId, workoutId);

    this.db.run('DELETE FROM workout_exercises WHERE id = ? AND workout_id = ?', [workoutExerciseId, workoutId]);
    this.db.run('UPDATE workouts SET updated_at = ? WHERE id = ?', [new Date().toISOString(), workoutId]);
    return this.getWorkoutById(userId, workoutId);
  }

  async reorderWorkoutExercises(userId: string, workoutId: string, exerciseIds: string[]): Promise<DetailedWorkout> {
    await this.getWorkoutById(userId, workoutId);

    if (Array.isArray(exerciseIds) && exerciseIds.length > 0) {
      this.db.transaction(() => {
        exerciseIds.forEach((id, idx) => {
          this.db.run(
            'UPDATE workout_exercises SET order_index = ? WHERE id = ? AND workout_id = ?',
            [idx, id, workoutId]
          );
        });
      });
      this.db.run('UPDATE workouts SET updated_at = ? WHERE id = ?', [new Date().toISOString(), workoutId]);
    }

    return this.getWorkoutById(userId, workoutId);
  }

  // 3. Registro e Histórico de Treino Executado (RN24)
  async logWorkout(userId: string, workoutId: string, dto: CreateWorkoutLogDto): Promise<WorkoutLogEntity> {
    const workout = await this.getWorkoutById(userId, workoutId);

    if (!dto.exercises || dto.exercises.length === 0) {
      throw new BadRequestException('Não é possível registrar treino sem exercícios executados.');
    }

    const logId = randomUUID();
    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.db.run(
        `INSERT INTO workout_logs (id, user_id, workout_id, workout_name, performed_date, duration_min, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, userId, workout.id, workout.name, dto.performedDate, dto.durationMin || 45, dto.notes || null, now]
      );

      for (const ex of dto.exercises) {
        this.db.run(
          `INSERT INTO workout_log_exercises (id, log_id, exercise_id, exercise_name, sets_completed, reps_completed, weight_used_kg, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            logId,
            ex.exerciseId,
            ex.exerciseName,
            ex.setsCompleted,
            ex.repsCompleted,
            ex.weightUsedKg,
            ex.notes || null,
          ]
        );
      }

      // Log de auditoria
      this.db.run(
        `INSERT INTO audit_logs (id, user_id, action, entity_name, entity_id, details_json, created_at)
         VALUES (?, ?, 'WORKOUT_COMPLETED', 'workout_logs', ?, ?, ?)`,
        [randomUUID(), userId, logId, JSON.stringify({ workout: workout.name, exercises: dto.exercises.length }), now]
      );
    });

    return this.getWorkoutLogById(userId, logId);
  }

  async listWorkoutLogs(userId: string, limit: number = 20, offset: number = 0): Promise<{ items: WorkoutLogEntity[]; total: number }> {
    const countRes = this.db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ?',
      [userId]
    );
    const total = countRes ? countRes.count : 0;

    const logs = this.db.query(
      'SELECT * FROM workout_logs WHERE user_id = ? ORDER BY performed_date DESC, created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const items: WorkoutLogEntity[] = [];
    for (const log of logs) {
      const exercises = this.db.query(
        'SELECT * FROM workout_log_exercises WHERE log_id = ? ORDER BY rowid ASC',
        [log.id]
      ).map((e) => ({
        id: e.id,
        exerciseId: e.exercise_id,
        exerciseName: e.exercise_name,
        setsCompleted: e.sets_completed,
        repsCompleted: e.reps_completed,
        weightUsedKg: e.weight_used_kg,
        notes: e.notes,
      }));

      items.push({
        id: log.id,
        userId: log.user_id,
        workoutId: log.workout_id,
        workoutName: log.workout_name,
        performedDate: log.performed_date,
        durationMin: log.duration_min,
        notes: log.notes,
        exercises,
        createdAt: log.created_at,
      });
    }

    return { items, total };
  }

  async getWorkoutLogById(userId: string, logId: string): Promise<WorkoutLogEntity> {
    const log = this.db.queryOne('SELECT * FROM workout_logs WHERE id = ?', [logId]);
    if (!log) {
      throw new NotFoundException('Registro de treino não encontrado.');
    }
    if (log.user_id !== userId) {
      throw new ForbiddenException('Acesso negado: registro pertence a outro usuário.');
    }

    const exercises = this.db.query(
      'SELECT * FROM workout_log_exercises WHERE log_id = ? ORDER BY rowid ASC',
      [logId]
    ).map((e) => ({
      id: e.id,
      exerciseId: e.exercise_id,
      exerciseName: e.exercise_name,
      setsCompleted: e.sets_completed,
      repsCompleted: e.reps_completed,
      weightUsedKg: e.weight_used_kg,
      notes: e.notes,
    }));

    return {
      id: log.id,
      userId: log.user_id,
      workoutId: log.workout_id,
      workoutName: log.workout_name,
      performedDate: log.performed_date,
      durationMin: log.duration_min,
      notes: log.notes,
      exercises,
      createdAt: log.created_at,
    };
  }

  async generateSuggestion(
    userId: string,
    dto: {
      goal: string;
      level?: string;
      daysPerWeek: number;
      availableTimeMin?: number;
      equipment?: string;
    },
  ): Promise<DetailedWorkout> {
    const days = Math.max(1, Math.min(7, Number(dto.daysPerWeek) || 3));
    const duration = dto.availableTimeMin || 60;

    let routineName = 'Treino A - Peito e Tríceps';
    let splitName = 'Treino A';
    let targetMuscles = ['Peito', 'Tríceps', 'Ombros'];

    if (days === 1) {
      routineName = 'Treino Full Body (Corpo Inteiro)';
      splitName = 'Full Body';
      targetMuscles = ['Peito', 'Costas', 'Quadríceps', 'Ombros'];
    } else if (days === 2) {
      routineName = 'Treino A - Membros Superiores';
      splitName = 'Superior';
      targetMuscles = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'];
    } else if (days >= 4) {
      routineName = 'Treino A - Push (Peito, Ombros e Tríceps)';
      splitName = 'Push';
      targetMuscles = ['Peito', 'Ombros', 'Tríceps'];
    }

    // Busca exercícios correspondentes no banco
    const exercisesFound: any[] = [];
    for (const muscle of targetMuscles) {
      const ex = this.db.query(
        'SELECT * FROM exercises WHERE muscle_group LIKE ? AND is_active = 1 LIMIT 2',
        [`%${muscle}%`]
      );
      exercisesFound.push(...ex);
    }

    // Cria a rotina no banco
    const workout = await this.createWorkout(userId, {
      name: routineName,
      splitName,
      estimatedDurationMin: duration,
      description: `Rotina gerada pelo Assistente Inteligente para o objetivo de ${dto.goal} (${days}x por semana).`,
    });

    // Insere os exercícios encontrados
    const setsByLevel = dto.level === 'ADVANCED' ? 4 : 3;
    const repsByGoal = dto.goal === 'Força' ? 6 : dto.goal === 'Resistência' ? 15 : 10;

    for (let i = 0; i < exercisesFound.length; i++) {
      const ex = exercisesFound[i];
      await this.addExerciseToWorkout(userId, workout.id, {
        exerciseId: ex.id,
        orderIndex: i,
        sets: setsByLevel,
        reps: repsByGoal,
        weightKg: dto.level === 'BEGINNER' ? 10 : 25,
        restSeconds: dto.goal === 'Força' ? 90 : 60,
        notes: `Foco em execução controlada.`,
      });
    }

    return this.getWorkoutById(userId, workout.id);
  }
}
