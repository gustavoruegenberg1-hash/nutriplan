export type Gender = 'male' | 'female' | 'MALE' | 'FEMALE';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active'
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';

export type Goal =
  | 'lose_weight'
  | 'maintain'
  | 'gain_weight'
  | 'LOSE_WEIGHT'
  | 'MAINTAIN'
  | 'GAIN_WEIGHT';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface PainDetail {
  region: string;
  movement: string;
  intensity: number; // 0-10
}

export interface User {
  id: string;
  email: string;
  name: string;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  role: 'USER' | 'ADMIN';
  isEmailVerified?: boolean;
  provider?: string;
  avatarUrl?: string | null;
  bmr?: number | null;
  tdee?: number | null;

  // Alergias e Restrições Alimentares
  hasFoodAllergies?: boolean | null;
  allergies?: string[];
  hasFoodIntolerances?: boolean | null;
  intolerances?: string[];
  needsProfessionalSupervision?: 'YES' | 'NO' | 'UNSURE' | string | null;
  dietaryRestrictionsNotes?: string | null;

  // Avaliação Física e Limitações para Exercícios
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'RETURNING' | string | null;
  trainingFrequencyDays?: number | null;
  weightTrainingExperience?: 'NEVER' | 'CURRENTLY' | 'PREVIOUSLY' | string | null;
  weightTrainingTimeMonths?: number | null;
  hasPhysicalDisabilities?: 'YES' | 'NO' | 'UNSURE' | string | null;
  affectedBodyRegions?: string[];
  physicalDisabilityNotes?: string | null;
  hasMuscleInjuries?: 'YES' | 'NO' | 'UNSURE' | string | null;
  affectedMuscles?: string[];
  hasJointPain?: 'YES' | 'NO' | 'UNSURE' | string | null;
  affectedJoints?: string[];
  jointPainNotes?: string | null;
  hasExercisePain?: 'YES' | 'NO' | 'SOMETIMES' | string | null;
  painDetails?: PainDetail[];
  difficultMovements?: string[];
  exercisesToAvoid?: string[];
  availableEquipment?: string[];
  readArticles?: string[];
  bodyFatPct?: number | null;
  avatarAppearance?: any;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  id: string;
  name: string;
  source: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export interface MealItem {
  id?: string;
  foodItemId: string;
  quantityGrams: number;
  foodItem?: FoodItem;
}

export interface Meal {
  id?: string;
  name: string;
  orderIndex?: number;
  items: MealItem[];
}

export interface DayPlan {
  id?: string;
  dayOfWeek: DayOfWeek;
  orderIndex?: number;
  meals: Meal[];
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  days: DayPlan[];
  createdAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string | null;
  joints?: string[];
  movementPatterns?: string[];
  difficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutSet {
  id?: string;
  orderIndex: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  restSeconds?: number;
  technique?: string;
}

export interface WorkoutExercise {
  id?: string;
  exerciseId: string;
  orderIndex: number;
  exerciseName?: string;
  muscleGroup?: string;
  equipment?: string;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutDay {
  id?: string;
  dayOfWeek: DayOfWeek;
  workoutName?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  days: WorkoutDay[];
  createdAt?: string;
}

export type Routine = WorkoutRoutine;
