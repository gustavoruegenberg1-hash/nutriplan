
export class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: string | null;
  activityLevel: string | null;
  goal: string | null;
  role: string;
  isEmailVerified: boolean = false;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: Date | string | null;
  provider?: 'local' | 'google' | string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Avaliação de Alergias e Restrições Alimentares
  hasFoodAllergies?: boolean | null;
  allergies?: string[];
  hasFoodIntolerances?: boolean | null;
  intolerances?: string[];
  needsProfessionalSupervision?: string | null;
  dietaryRestrictionsNotes?: string | null;

  // Avaliação Física e Limitações para Exercícios
  experienceLevel?: string | null;
  trainingFrequencyDays?: number | null;
  weightTrainingExperience?: string | null;
  weightTrainingTimeMonths?: number | null;
  hasPhysicalDisabilities?: string | null;
  affectedBodyRegions?: string[];
  physicalDisabilityNotes?: string | null;
  hasMuscleInjuries?: string | null;
  affectedMuscles?: string[];
  hasJointPain?: string | null;
  affectedJoints?: string[];
  jointPainNotes?: string | null;
  hasExercisePain?: string | null;
  painDetails?: { region: string; movement: string; intensity: number }[];
  difficultMovements?: string[];
  exercisesToAvoid?: string[];
  availableEquipment?: string[];
  readArticles?: string[];
  bodyFatPct?: number | null;
  avatarAppearance?: any;

  constructor(props: Partial<UserEntity>) {
    Object.assign(this, props);
  }

  // Equação de Mifflin-St Jeor (Padrão Ouro para Taxa Metabólica Basal)
  calculateBMR(): number | null {
    if (!this.weight || !this.height || !this.age || !this.gender) {
      return null;
    }

    const weightKg = Number(this.weight);
    const heightCm = Number(this.height);
    const ageYears = Number(this.age);

    if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return null;

    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    const g = this.gender.toLowerCase().trim();

    if (g === 'male' || g === 'masculino' || g === 'm') {
      bmr += 5;
    } else if (g === 'female' || g === 'feminino' || g === 'f') {
      bmr -= 161;
    } else {
      return null;
    }

    return Math.round(bmr);
  }

  // Gasto Energético Total Diário (TDEE / GET)
  calculateTDEE(): number | null {
    const bmr = this.calculateBMR();
    if (!bmr) return null;

    const level = (this.activityLevel || 'moderately_active').toLowerCase().trim();

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      sedentario: 1.2,
      lightly_active: 1.375,
      light: 1.375,
      leve: 1.375,
      moderately_active: 1.55,
      moderate: 1.55,
      moderado: 1.55,
      very_active: 1.725,
      very: 1.725,
      intenso: 1.725,
      extra_active: 1.9,
      extra: 1.9,
      extremo: 1.9,
    };

    const multiplier = multipliers[level] || 1.55;
    return Math.round(bmr * multiplier);
  }


}
