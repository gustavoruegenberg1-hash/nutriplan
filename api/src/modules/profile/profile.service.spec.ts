import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileService } from './profile.service';
import { DatabaseService } from '../../database/database.service';
import { NutritionCalculatorService } from '../nutrition/nutrition-calculator.service';
import { AuthService } from '../auth/auth.service';

describe('ProfileService (Gestão de Perfil e Antropometria)', () => {
  let db: DatabaseService;
  let nutritionCalc: NutritionCalculatorService;
  let authService: AuthService;
  let profileService: ProfileService;
  let testUserId: string;

  beforeEach(async () => {
    db = DatabaseService.createInMemory();
    nutritionCalc = new NutritionCalculatorService();
    authService = new AuthService(db);
    profileService = new ProfileService(db, nutritionCalc);

    const user = await authService.register({
      name: 'Lucas Teste',
      email: 'lucas@nutriplan.com',
      password: 'SenhaForte123',
    });
    testUserId = user.user.id;
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('TEST-PROF-001: deve obter perfil inicial do usuário após registro', async () => {
    const prof = await profileService.getProfile(testUserId);
    expect(prof).toBeDefined();
    expect(prof.user.name).toBe('Lucas Teste');
    expect(prof.profile.activityLevel).toBe('SEDENTARY');
    expect(prof.profile.goal).toBe('MAINTAIN');
    expect(prof.profile.weight).toBeNull();
  });

  it('TEST-PROF-002: deve atualizar perfil e calcular automaticamente TMB e TDEE (RN06, RN07)', async () => {
    const updated = await profileService.updateProfile(testUserId, {
      age: 28,
      gender: 'MALE',
      weight: 78,
      height: 178,
      activityLevel: 'MODERATELY_ACTIVE',
      goal: 'LOSE_WEIGHT',
    });

    expect(updated.profile.age).toBe(28);
    expect(updated.profile.weight).toBe(78);
    expect(updated.profile.bmr).toBeGreaterThan(1600);
    expect(updated.profile.tdee).toBeGreaterThan(2500);

    // Deve ter metas de macronutrientes geradas
    expect(updated.targets).toBeDefined();
    expect(updated.targets!.proteinGrams).toBe(Math.round(78 * 2.0));
  });

  it('TEST-PROF-003: deve registrar mudança de peso no histórico temporal', async () => {
    await profileService.updateProfile(testUserId, { weight: 80, height: 180, age: 30, gender: 'MALE' });
    await profileService.addWeightRecord(testUserId, 79.5, 'Pesagem em jejum');

    const history = (await profileService.getProfile(testUserId)).recentWeightHistory;
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].weight).toBe(79.5);
    expect(history[0].notes).toBe('Pesagem em jejum');
  });

  it('TEST-PROF-004: deve vincular restrições alimentares ao perfil do usuário', async () => {
    const restrictions = await profileService.getAllAvailableRestrictions();
    expect(restrictions.length).toBeGreaterThan(0);

    const lactose = restrictions.find((r) => r.id === 'res-lactose')!;
    const updated = await profileService.updateProfile(testUserId, {
      restrictionIds: [lactose.id],
    });

    expect(updated.restrictions.some((r) => r.id === 'res-lactose')).toBe(true);
  });
});
