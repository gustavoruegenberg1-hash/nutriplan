import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardService } from './dashboard.service';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService } from '../nutrition/nutrition-calculator.service';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../profile/profile.service';
import { DietsService } from '../diets/diets.service';
import { WorkoutsService } from '../workouts/workouts.service';

describe('DashboardService (Visão Unificada do Sistema)', () => {
  let db: DatabaseService;
  let calc: NutritionCalculatorService;
  let authService: AuthService;
  let profileService: ProfileService;
  let dietsService: DietsService;
  let workoutsService: WorkoutsService;
  let dashboardService: DashboardService;
  let userId: string;

  beforeEach(async () => {
    db = DatabaseService.createInMemory();
    calc = new NutritionCalculatorService();
    authService = new AuthService(db);
    profileService = new ProfileService(db, calc);
    dietsService = new DietsService(db, calc);
    workoutsService = new WorkoutsService(db);
    dashboardService = new DashboardService(db, profileService, dietsService, workoutsService);

    const user = await authService.register({
      name: 'Camila Ferreira',
      email: 'camila@nutriplan.com',
      password: 'SenhaForte123',
    });
    userId = user.user.id;
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-DASH-001: deve gerar resumo completo do dashboard com métricas agregadas', async () => {
    // Configura perfil
    await profileService.updateProfile(userId, {
      age: 26,
      gender: 'FEMALE',
      weight: 62,
      height: 168,
      activityLevel: 'LIGHTLY_ACTIVE',
      goal: 'LOSE_WEIGHT',
    });

    // Cria treino
    await workoutsService.createWorkout(userId, { name: 'Treino Glúteos e Posterior' });

    // Cria dieta
    await dietsService.createDiet(userId, { name: 'Dieta Equilibrada', isActive: true });

    const summary = await dashboardService.getSummary(userId);

    expect(summary.user.name).toBe('Camila Ferreira');
    expect(summary.metrics.currentWeight).toBe(62);
    expect(summary.targets).toBeDefined();
    expect(summary.activeDiet).toBeDefined();
    expect(summary.activeDiet?.name).toBe('Dieta Equilibrada');
    expect(summary.workouts.length).toBe(1);
    expect(summary.legalDisclaimer).toBeDefined();
  });

  it('TEST-DASH-002: deve emitir alertas quando o perfil estiver incompleto', async () => {
    const summary = await dashboardService.getSummary(userId);
    expect(summary.alerts.some((a) => a.includes('Complete seus dados'))).toBe(true);
    expect(summary.alerts.some((a) => a.includes('não cadastrou nenhuma rotina'))).toBe(true);
  });
});
