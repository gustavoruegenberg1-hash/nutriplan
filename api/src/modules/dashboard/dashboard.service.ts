import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ProfileService } from '../profile/profile.service';
import { DietsService, CalculatedDiet } from '../diets/diets.service';
import { WorkoutsService, DetailedWorkout, WorkoutLogEntity } from '../workouts/workouts.service';

export interface DashboardSummary {
  user: {
    id: string;
    name: string;
    email: string;
  };
  metrics: {
    currentWeight: number | null;
    goal: string;
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
  activeDiet: {
    id: string;
    name: string;
    totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    mealsCount: number;
    warnings: string[];
    targetComparison?: any;
  } | null;
  workouts: Array<{
    id: string;
    name: string;
    splitName: string | null;
    exercisesCount: number;
    estimatedDurationMin: number;
  }>;
  recentWorkoutLogs: WorkoutLogEntity[];
  weightEvolution: Array<{
    id: string;
    weight: number;
    recordedAt: string;
    notes: string | null;
  }>;
  alerts: string[];
  legalDisclaimer: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly db: DatabaseService,
    private readonly profileService: ProfileService,
    private readonly dietsService: DietsService,
    private readonly workoutsService: WorkoutsService,
  ) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const profileData = await this.profileService.getProfile(userId);
    const userDiets = await this.dietsService.listUserDiets(userId);

    let activeDietDetails: CalculatedDiet | null = null;
    const activeDietRef = userDiets.find((d) => d.isActive) || userDiets[0];
    if (activeDietRef) {
      try {
        activeDietDetails = await this.dietsService.getDietById(userId, activeDietRef.id);
      } catch {}
    }

    const userWorkouts = await this.workoutsService.listUserWorkouts(userId);
    const logsResult = await this.workoutsService.listWorkoutLogs(userId, 5, 0);

    const alerts: string[] = [];
    if (!profileData.profile.weight || !profileData.profile.height) {
      alerts.push('Complete seus dados de peso e altura no Perfil para desbloquear estimativas precisas.');
    }

    if (activeDietDetails?.targetComparison?.alerts) {
      alerts.push(...activeDietDetails.targetComparison.alerts);
    }

    if (activeDietDetails?.warnings && activeDietDetails.warnings.length > 0) {
      alerts.push(...activeDietDetails.warnings);
    }

    if (userWorkouts.length === 0) {
      alerts.push('Você ainda não cadastrou nenhuma rotina de treino.');
    }

    return {
      user: {
        id: profileData.user.id,
        name: profileData.user.name,
        email: profileData.user.email,
      },
      metrics: {
        currentWeight: profileData.profile.weight,
        goal: profileData.profile.goal,
        bmr: profileData.profile.bmr,
        tdee: profileData.profile.tdee,
      },
      targets: profileData.targets,
      activeDiet: activeDietDetails
        ? {
            id: activeDietDetails.id,
            name: activeDietDetails.name,
            totals: activeDietDetails.totals,
            mealsCount: activeDietDetails.meals.length,
            warnings: activeDietDetails.warnings,
            targetComparison: activeDietDetails.targetComparison,
          }
        : null,
      workouts: userWorkouts.map((w) => ({
        id: w.id,
        name: w.name,
        splitName: w.splitName,
        exercisesCount: w.exercisesCount,
        estimatedDurationMin: w.estimatedDurationMin,
      })),
      recentWorkoutLogs: logsResult.items,
      weightEvolution: profileData.recentWeightHistory,
      alerts: Array.from(new Set(alerts)),
      legalDisclaimer:
        'Este sistema fornece estimativas e ferramentas de organização de dieta e treino. As informações não substituem avaliação, diagnóstico ou acompanhamento de profissional habilitado.',
    };
  }
}
