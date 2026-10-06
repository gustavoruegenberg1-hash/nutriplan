import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkoutsService } from './workouts.service';
import { DatabaseService } from '../../database/database.service';
import { AuthService } from '../auth/auth.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('WorkoutsService (Módulo de Treinos, Exercícios e Logs Históricos)', () => {
  let db: DatabaseService;
  let authService: AuthService;
  let workoutsService: WorkoutsService;
  let userAId: string;
  let userBId: string;
  let sampleExerciseId: string;

  beforeEach(async () => {
    db = DatabaseService.createInMemory();
    authService = new AuthService(db);
    workoutsService = new WorkoutsService(db);

    const userA = await authService.register({
      name: 'Marcos Silva',
      email: 'marcos@nutriplan.com',
      password: 'SenhaForte123',
    });
    userAId = userA.user.id;

    const userB = await authService.register({
      name: 'Felipe Santos',
      email: 'felipe@nutriplan.com',
      password: 'SenhaForte123',
    });
    userBId = userB.user.id;

    const ex = db.queryOne<{ id: string }>('SELECT id FROM exercises LIMIT 1');
    sampleExerciseId = ex!.id;
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-EXER-001: deve listar exercícios com filtro por grupo muscular e busca textual', async () => {
    const all = await workoutsService.searchExercises({ limit: 10 });
    expect(all.items.length).toBeGreaterThan(0);
    expect(all.total).toBeGreaterThanOrEqual(100);

    const res = await workoutsService.searchExercises({ muscleGroup: 'CHEST' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((e) => e.muscleGroup === 'CHEST')).toBe(true);
  });

  it('TEST-WORK-001: deve criar rotina de treino vinculada ao usuário (RN14, RN20)', async () => {
    const workout = await workoutsService.createWorkout(userAId, {
      name: 'Treino A — Peito e Tríceps',
      splitName: 'A',
      estimatedDurationMin: 60,
    });

    expect(workout.id).toBeDefined();
    expect(workout.name).toBe('Treino A — Peito e Tríceps');
    expect(workout.userId).toBe(userAId);
    expect(workout.exercises.length).toBe(0);
    expect(workout.totalSets).toBe(0);
  });

  it('TEST-WORK-002: deve adicionar exercícios à rotina e contabilizar total de séries', async () => {
    const workout = await workoutsService.createWorkout(userAId, { name: 'Treino B' });

    const updated = await workoutsService.addExerciseToWorkout(userAId, workout.id, {
      exerciseId: sampleExerciseId,
      sets: 4,
      reps: 12,
      weightKg: 30,
      restSeconds: 90,
      notes: 'Execução controlada',
    });

    expect(updated.exercises.length).toBe(1);
    expect(updated.exercises[0].sets).toBe(4);
    expect(updated.exercises[0].reps).toBe(12);
    expect(updated.exercises[0].weightKg).toBe(30);
    expect(updated.totalSets).toBe(4);
  });

  it('TEST-WORK-003: deve rejeitar séries e repetições inválidas ou exercício inexistente (RN16, RN18)', async () => {
    const workout = await workoutsService.createWorkout(userAId, { name: 'Treino Inválido' });

    // Séries zero
    await expect(
      workoutsService.addExerciseToWorkout(userAId, workout.id, {
        exerciseId: sampleExerciseId,
        sets: 0,
        reps: 10,
      })
    ).rejects.toThrow(BadRequestException);

    // Reps excessivas
    await expect(
      workoutsService.addExerciseToWorkout(userAId, workout.id, {
        exerciseId: sampleExerciseId,
        sets: 3,
        reps: 500,
      })
    ).rejects.toThrow(BadRequestException);

    // Exercício inexistente
    await expect(
      workoutsService.addExerciseToWorkout(userAId, workout.id, {
        exerciseId: 'ex-inexistente-123',
        sets: 3,
        reps: 10,
      })
    ).rejects.toThrow(NotFoundException);
  });

  it('TEST-WORK-004: deve atualizar dados de séries e cargas e permitir remoção de exercício', async () => {
    const workout = await workoutsService.createWorkout(userAId, { name: 'Treino Costas' });
    const w1 = await workoutsService.addExerciseToWorkout(userAId, workout.id, {
      exerciseId: sampleExerciseId,
      sets: 3,
      reps: 10,
      weightKg: 40,
    });

    const weId = w1.exercises[0].id;
    const w2 = await workoutsService.updateWorkoutExercise(userAId, workout.id, weId, {
      sets: 5,
      weightKg: 50,
    });

    expect(w2.exercises[0].sets).toBe(5);
    expect(w2.exercises[0].weightKg).toBe(50);
    expect(w2.totalSets).toBe(5);

    const w3 = await workoutsService.removeWorkoutExercise(userAId, workout.id, weId);
    expect(w3.exercises.length).toBe(0);
    expect(w3.totalSets).toBe(0);
  });

  it('TEST-LOG-001: deve registrar sessão realizada de treino com exercícios e cargas (RN24)', async () => {
    const workout = await workoutsService.createWorkout(userAId, { name: 'Treino Pernas' });
    await workoutsService.addExerciseToWorkout(userAId, workout.id, {
      exerciseId: sampleExerciseId,
      sets: 4,
      reps: 10,
      weightKg: 80,
    });

    const log = await workoutsService.logWorkout(userAId, workout.id, {
      performedDate: '2026-10-06T10:00:00.000Z',
      durationMin: 55,
      notes: 'Treino intenso, excelente rendimento',
      exercises: [
        {
          exerciseId: sampleExerciseId,
          exerciseName: 'Agachamento Livre',
          setsCompleted: 4,
          repsCompleted: 10,
          weightUsedKg: 80,
          notes: 'RPE 8',
        },
      ],
    });

    expect(log.id).toBeDefined();
    expect(log.workoutName).toBe('Treino Pernas');
    expect(log.exercises.length).toBe(1);
    expect(log.exercises[0].weightUsedKg).toBe(80);

    const history = await workoutsService.listWorkoutLogs(userAId);
    expect(history.total).toBe(1);
  });

  it('TEST-LOG-002: REGRA CRÍTICA (RN24): excluir o plano de treino NUNCA apaga o histórico de treinos passados', async () => {
    const workout = await workoutsService.createWorkout(userAId, { name: 'Treino Futuro Temporário' });
    await workoutsService.addExerciseToWorkout(userAId, workout.id, {
      exerciseId: sampleExerciseId,
      sets: 3,
      reps: 12,
    });

    // Registra sessão no histórico
    const log = await workoutsService.logWorkout(userAId, workout.id, {
      performedDate: '2026-10-05T09:00:00.000Z',
      durationMin: 50,
      exercises: [
        {
          exerciseId: sampleExerciseId,
          exerciseName: 'Exercício Histórico',
          setsCompleted: 3,
          repsCompleted: 12,
          weightUsedKg: 25,
        },
      ],
    });

    // Exclui a rotina de treino atual
    await workoutsService.deleteWorkout(userAId, workout.id);

    // Confirma que a rotina foi excluída
    await expect(workoutsService.getWorkoutById(userAId, workout.id)).rejects.toThrow(NotFoundException);

    // Confirma que o histórico de treino REALIZADO permanece 100% INTACTO!
    const savedLog = await workoutsService.getWorkoutLogById(userAId, log.id);
    expect(savedLog).toBeDefined();
    expect(savedLog.workoutName).toBe('Treino Futuro Temporário');
    expect(savedLog.exercises.length).toBe(1);
    expect(savedLog.exercises[0].exerciseName).toBe('Exercício Histórico');
    expect(savedLog.exercises[0].weightUsedKg).toBe(25);
  });

  it('TEST-SEC-004: deve impedir acesso não autorizado a treinos de outros usuários', async () => {
    const workoutA = await workoutsService.createWorkout(userAId, { name: 'Treino Privado de A' });

    await expect(workoutsService.getWorkoutById(userBId, workoutA.id)).rejects.toThrow(ForbiddenException);
    await expect(workoutsService.deleteWorkout(userBId, workoutA.id)).rejects.toThrow(ForbiddenException);
  });
});
