import { UserEntity } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  weight!: number | null;
  height!: number | null;
  age!: number | null;
  gender!: string | null;
  activityLevel!: string | null;
  goal!: string | null;
  role!: string;
  bmr!: number | null;
  tdee!: number | null;

  // Alergias e Restrições Alimentares
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
  bodyFatPct?: number;
  avatarAppearance?: Record<string, any>;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.weight = entity.weight;
    dto.height = entity.height;
    dto.age = entity.age;
    dto.gender = entity.gender;
    dto.activityLevel = entity.activityLevel;
    dto.goal = entity.goal;
    dto.role = entity.role;
    dto.bmr = entity.calculateBMR();
    dto.tdee = entity.calculateTDEE();

    dto.hasFoodAllergies = entity.hasFoodAllergies ?? null;
    dto.allergies = entity.allergies || [];
    dto.hasFoodIntolerances = entity.hasFoodIntolerances ?? null;
    dto.intolerances = entity.intolerances || [];
    dto.needsProfessionalSupervision = entity.needsProfessionalSupervision ?? null;
    dto.dietaryRestrictionsNotes = entity.dietaryRestrictionsNotes ?? null;

    dto.experienceLevel = entity.experienceLevel ?? null;
    dto.trainingFrequencyDays = entity.trainingFrequencyDays ?? null;
    dto.weightTrainingExperience = entity.weightTrainingExperience ?? null;
    dto.weightTrainingTimeMonths = entity.weightTrainingTimeMonths ?? null;
    dto.hasPhysicalDisabilities = entity.hasPhysicalDisabilities ?? null;
    dto.affectedBodyRegions = entity.affectedBodyRegions || [];
    dto.physicalDisabilityNotes = entity.physicalDisabilityNotes ?? null;
    dto.hasMuscleInjuries = entity.hasMuscleInjuries ?? null;
    dto.affectedMuscles = entity.affectedMuscles || [];
    dto.hasJointPain = entity.hasJointPain ?? null;
    dto.affectedJoints = entity.affectedJoints || [];
    dto.jointPainNotes = entity.jointPainNotes ?? null;
    dto.hasExercisePain = entity.hasExercisePain ?? null;
    dto.painDetails = entity.painDetails || [];
    dto.difficultMovements = entity.difficultMovements || [];
    dto.exercisesToAvoid = entity.exercisesToAvoid || [];
    dto.availableEquipment = entity.availableEquipment || [];
    dto.readArticles = entity.readArticles || [];
    dto.bodyFatPct = (entity as any).bodyFatPct;
    dto.avatarAppearance = (entity as any).avatarAppearance;

    return dto;
  }
}
