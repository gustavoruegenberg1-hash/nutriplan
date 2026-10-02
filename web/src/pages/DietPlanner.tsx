import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { FoodItem, DayOfWeek } from '../types';
import { MacroCard } from '../components/MacroCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputDialog } from '../components/InputDialog';
import { DietaryRestrictionsModal } from '../components/diet/DietaryRestrictionsModal';
import { checkFoodAllergens, getAllergyBannerInfo } from '../utils/allergySafety';
import { restricoesAlimentaresPreenchidas } from '../utils/formValidation';
import { calibrateDietMeals } from '../utils/unitClassification';
import { calcularDeficitCaloricoSustentavel, calcularMetaFibras } from '../utils/dietOptimizer';
import { gamificationService } from '../services/gamificationService';
import { idleGameService } from '../services/idleGameService';
import { foodService } from '../services/foodService';
import { triggerHapticFeedback } from '../utils/mobile';
import { HydrationTrackerCard } from '../components/water/HydrationTrackerCard';
import {
  Utensils,
  Search,
  Plus,
  Trash2,
  Download,
  Check,
  AlertCircle,
  Copy,
  GripVertical,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  X,
  CheckCircle2,
  RefreshCw,
  Star,
  Dumbbell,
  Flame,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Layers,
  Info,
  HeartPulse,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Play,
  Lightbulb,
} from 'lucide-react';

export type PortionUnit = 'g' | 'ml' | 'un' | 'scoop' | 'colher' | 'fatia' | 'copo' | 'lata' | 'file';



export const QUICK_DIET_COMBOS = [
  {
    label: 'Café Tradicional',
    icon: '🍳',
    calories: 380,
    items: [
      { foodName: 'Ovo de galinha inteiro cozido', quantityValue: 2, unit: 'un' as PortionUnit, quantityGrams: 100, caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
      { foodName: 'Pão de forma 100% integral', quantityValue: 2, unit: 'fatia' as PortionUnit, quantityGrams: 50, caloriesPer100g: 245, proteinPer100g: 9.5, carbsPer100g: 45.0, fatPer100g: 2.8, fiberPer100g: 7.0 },
      { foodName: 'Banana prata', quantityValue: 1, unit: 'un' as PortionUnit, quantityGrams: 100, caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
    ],
  },
  {
    label: 'Almoço Fit Clássico',
    icon: '🍗',
    calories: 540,
    items: [
      { foodName: 'Frango filé de peito grelhado sem pele', quantityValue: 180, unit: 'g' as PortionUnit, quantityGrams: 180, caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
      { foodName: 'Arroz branco cozido', quantityValue: 180, unit: 'g' as PortionUnit, quantityGrams: 180, caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
      { foodName: 'Feijão carioca cozido (50% grão/caldo)', quantityValue: 100, unit: 'g' as PortionUnit, quantityGrams: 100, caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5 },
      { foodName: 'Azeite de oliva extravirgem', quantityValue: 1, unit: 'colher' as PortionUnit, quantityGrams: 10, caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
    ],
  },
  {
    label: 'Almoço Carne & Batata',
    icon: '🥩',
    calories: 520,
    items: [
      { foodName: 'Carne bovina patinho grelhado / moído', quantityValue: 160, unit: 'g' as PortionUnit, quantityGrams: 160, caloriesPer100g: 219, proteinPer100g: 35.9, carbsPer100g: 0, fatPer100g: 7.3, fiberPer100g: 0 },
      { foodName: 'Batata doce cozida', quantityValue: 200, unit: 'g' as PortionUnit, quantityGrams: 200, caloriesPer100g: 77, proteinPer100g: 0.6, carbsPer100g: 18.4, fatPer100g: 0.1, fiberPer100g: 2.2 },
      { foodName: 'Brócolis cozido no vapor', quantityValue: 100, unit: 'g' as PortionUnit, quantityGrams: 100, caloriesPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.5, fiberPer100g: 3.4 },
    ],
  },
  {
    label: 'Shake / Pré-Treino',
    icon: '🥤',
    calories: 440,
    items: [
      { foodName: 'Whey Protein Concentrado 80%', quantityValue: 1, unit: 'scoop' as PortionUnit, quantityGrams: 30, caloriesPer100g: 385, proteinPer100g: 80.0, carbsPer100g: 5.0, fatPer100g: 4.5, fiberPer100g: 0 },
      { foodName: 'Banana prata', quantityValue: 1, unit: 'un' as PortionUnit, quantityGrams: 100, caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
      { foodName: 'Aveia em flocos finos/grossos', quantityValue: 40, unit: 'g' as PortionUnit, quantityGrams: 40, caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
      { foodName: 'Pasta de amendoim integral 100%', quantityValue: 1, unit: 'colher' as PortionUnit, quantityGrams: 15, caloriesPer100g: 593, proteinPer100g: 28.0, carbsPer100g: 18.0, fatPer100g: 46.0, fiberPer100g: 6.0 },
    ],
  },
  {
    label: 'Jantar Leve & Peixe',
    icon: '🐟',
    calories: 360,
    items: [
      { foodName: 'Peixe tilápia filé grelhado', quantityValue: 180, unit: 'g' as PortionUnit, quantityGrams: 180, caloriesPer100g: 128, proteinPer100g: 26.0, carbsPer100g: 0, fatPer100g: 2.7, fiberPer100g: 0 },
      { foodName: 'Brócolis cozido no vapor', quantityValue: 150, unit: 'g' as PortionUnit, quantityGrams: 150, caloriesPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.5, fiberPer100g: 3.4 },
      { foodName: 'Azeite de oliva extravirgem', quantityValue: 1, unit: 'colher' as PortionUnit, quantityGrams: 10, caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
    ],
  },
];

export const FOOD_CATEGORIES = [
  { id: 'ALL', label: 'Todos os Alimentos', icon: '🍽️' },
  { id: 'PROTEIN', label: 'Proteínas', icon: '🍗' },
  { id: 'CARBS', label: 'Carboidratos', icon: '🍚' },
  { id: 'FATS', label: 'Gorduras Boas', icon: '🥑' },
  { id: 'FIBERS', label: 'Fibras & Vegetais', icon: '🥦' },
  { id: 'FRUITS', label: 'Frutas', icon: '🍎' },
];

export interface LocalMealItem {
  foodItemId: string;
  foodName: string;
  quantityValue: number | string;
  unit: PortionUnit;
  quantityGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  completed?: boolean;
}

export interface LocalMeal {
  name: string;
  items: LocalMealItem[];
}

export type MealsByDay = Record<DayOfWeek, LocalMeal[]>;

export interface FavoriteMeal {
  id: string;
  name: string;
  items: LocalMealItem[];
  savedAt: string;
}

const createDefaultMeals = (): LocalMeal[] => [
  { name: 'Café da Manhã', items: [] },
  { name: 'Almoço', items: [] },
  { name: 'Lanche da Tarde', items: [] },
  { name: 'Jantar', items: [] },
];

const initialMealsByDay: MealsByDay = {
  MONDAY: createDefaultMeals(),
  TUESDAY: createDefaultMeals(),
  WEDNESDAY: createDefaultMeals(),
  THURSDAY: createDefaultMeals(),
  FRIDAY: createDefaultMeals(),
  SATURDAY: createDefaultMeals(),
  SUNDAY: createDefaultMeals(),
};

// Ordem canônica: Domingo a Sábado
const daysList: { id: DayOfWeek; shortLabel: string; fullLabel: string }[] = [
  { id: 'SUNDAY', shortLabel: 'Dom', fullLabel: 'Domingo' },
  { id: 'MONDAY', shortLabel: 'Seg', fullLabel: 'Segunda-feira' },
  { id: 'TUESDAY', shortLabel: 'Ter', fullLabel: 'Terça-feira' },
  { id: 'WEDNESDAY', shortLabel: 'Qua', fullLabel: 'Quarta-feira' },
  { id: 'THURSDAY', shortLabel: 'Qui', fullLabel: 'Quinta-feira' },
  { id: 'FRIDAY', shortLabel: 'Sex', fullLabel: 'Sexta-feira' },
  { id: 'SATURDAY', shortLabel: 'Sáb', fullLabel: 'Sábado' },
];

const DAY_OF_WEEK_BY_INDEX: DayOfWeek[] = [
  'SUNDAY',    // 0 = Domingo
  'MONDAY',    // 1 = Segunda
  'TUESDAY',   // 2 = Terça
  'WEDNESDAY', // 3 = Quarta
  'THURSDAY',  // 4 = Quinta
  'FRIDAY',    // 5 = Sexta
  'SATURDAY',  // 6 = Sábado
];

export const getTodayDayOfWeek = (): DayOfWeek => {
  const dayIndex = new Date().getDay();
  return DAY_OF_WEEK_BY_INDEX[dayIndex] || 'SUNDAY';
};

const STORAGE_KEY = 'nutriplan_saved_diet_meals';
const STORAGE_NAME_KEY = 'nutriplan_saved_diet_name';
const FAVORITES_STORAGE_KEY = 'nutriplan_favorite_meals';

// Retorna apenas as unidades válidas para o alimento
export function getValidUnitsForFood(foodName: string): { id: PortionUnit; label: string }[] {
  const lower = foodName.toLowerCase();

  // 1. Bebidas e Líquidos
  if (
    lower.includes('leite') ||
    lower.includes('suco') ||
    lower.includes('coca') ||
    lower.includes('guaraná') ||
    lower.includes('guarana') ||
    lower.includes('sprite') ||
    lower.includes('yopro') ||
    lower.includes('shake') ||
    lower.includes('água de coco') ||
    lower.includes('agua de coco') ||
    lower.includes('chá') ||
    lower.includes('cha') ||
    lower.includes('café') ||
    lower.includes('cafe') ||
    lower.includes('red bull') ||
    lower.includes('monster') ||
    lower.includes('gatorade') ||
    lower.includes('isotônico')
  ) {
    return [
      { id: 'ml', label: 'Mililitros (ml)' },
      { id: 'copo', label: 'Copo (200 ml)' },
      { id: 'lata', label: 'Lata (350 ml)' },
      { id: 'g', label: 'Gramas (g)' },
    ];
  }

  // 2. Suplementos e Pós
  if (
    lower.includes('whey') ||
    lower.includes('creatina') ||
    lower.includes('albumina') ||
    lower.includes('caseína') ||
    lower.includes('caseina') ||
    lower.includes('leite em pó')
  ) {
    return [
      { id: 'g', label: 'Gramas (g)' },
      { id: 'scoop', label: 'Scoop / Dosador (30 g)' },
      { id: 'colher', label: 'Colher de sopa (15 g)' },
    ];
  }

  // 3. Pães, Queijos e Frios
  if (
    lower.includes('pão de forma') ||
    lower.includes('queijo') ||
    lower.includes('muçarela') ||
    lower.includes('presunto') ||
    lower.includes('peito de peru') ||
    lower.includes('ricota')
  ) {
    return [
      { id: 'g', label: 'Gramas (g)' },
      { id: 'fatia', label: 'Fatia (30 g)' },
      { id: 'un', label: 'Unidade (un)' },
    ];
  }

  // 4. Frutas e Ovos
  if (
    lower.includes('ovo') ||
    lower.includes('banana') ||
    lower.includes('maçã') ||
    lower.includes('maca') ||
    lower.includes('laranja') ||
    lower.includes('pera') ||
    lower.includes('kiwi') ||
    lower.includes('limão') ||
    lower.includes('pão francês')
  ) {
    return [
      { id: 'un', label: 'Unidade (un)' },
      { id: 'g', label: 'Gramas (g)' },
    ];
  }

  // 5. Óleos, Pastas e Sementes
  if (
    lower.includes('azeite') ||
    lower.includes('óleo') ||
    lower.includes('manteiga') ||
    lower.includes('pasta de amendoim') ||
    lower.includes('chia') ||
    lower.includes('linhaça') ||
    lower.includes('mel')
  ) {
    return [
      { id: 'colher', label: 'Colher de sopa (15 g)' },
      { id: 'g', label: 'Gramas (g)' },
    ];
  }

  // 6. Carnes, Frango e Peixes
  if (
    lower.includes('frango') ||
    lower.includes('patinho') ||
    lower.includes('alcatra') ||
    lower.includes('filé') ||
    lower.includes('tilápia') ||
    lower.includes('salmão') ||
    lower.includes('atum') ||
    lower.includes('carne')
  ) {
    return [
      { id: 'g', label: 'Gramas (g)' },
      { id: 'file', label: 'Filé / Porção (150 g)' },
    ];
  }

  return [
    { id: 'g', label: 'Gramas (g)' },
    { id: 'colher', label: 'Colher de sopa (25 g)' },
    { id: 'un', label: 'Porção (100 g)' },
  ];
}

export function calculateGramsFromUnit(value: number, unit: PortionUnit, foodName: string): number {
  const lower = foodName.toLowerCase();
  switch (unit) {
    case 'g':
    case 'ml':
      return value;
    case 'un':
      if (lower.includes('ovo')) return value * 50;
      if (lower.includes('banana')) return value * 100;
      if (lower.includes('maçã') || lower.includes('maca')) return value * 130;
      if (lower.includes('pão francês') || lower.includes('pao frances')) return value * 50;
      if (lower.includes('laranja')) return value * 150;
      if (lower.includes('kiwi')) return value * 80;
      return value * 100;
    case 'scoop':
      return value * 30;
    case 'colher':
      if (lower.includes('azeite') || lower.includes('óleo') || lower.includes('manteiga')) return value * 10;
      if (lower.includes('pasta de amendoim')) return value * 15;
      if (lower.includes('arroz') || lower.includes('feijão') || lower.includes('feijao')) return value * 25;
      return value * 15;
    case 'fatia':
      if (lower.includes('pão') || lower.includes('pao')) return value * 25;
      if (lower.includes('queijo') || lower.includes('presunto') || lower.includes('peito de peru')) return value * 30;
      return value * 30;
    case 'copo':
      return value * 200;
    case 'lata':
      return value * 350;
    case 'file':
      return value * 150;
    default:
      return value;
  }
}

/**
 * Função Pura e Determinística para Recálculo de Calorias e Macronutrientes:
 * Garante que multiplicar ou dividir a quantidade de alimento gere SEMPRE
 * valores proporcionais sem efeitos cumulativos ou perda de precisão.
 */
export function recalculateItemNutrients(
  item: LocalMealItem,
  rawValue: string | number,
  unit?: PortionUnit
): LocalMealItem {
  const selectedUnit = unit || item.unit || 'g';
  const parsedVal = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(',', '.')) || 0;
  const grams = calculateGramsFromUnit(parsedVal, selectedUnit, item.foodName);
  const factor = grams / 100;

  const protein = Math.round((Number(item.proteinPer100g) || 0) * factor * 10) / 10;
  const carbs = Math.round((Number(item.carbsPer100g) || 0) * factor * 10) / 10;
  const fat = Math.round((Number(item.fatPer100g) || 0) * factor * 10) / 10;
  const fiber = Math.round((Number(item.fiberPer100g) || 0) * factor * 10) / 10;
  const calories = Math.round((Number(item.caloriesPer100g) || 0) * factor * 10) / 10;

  return {
    ...item,
    quantityValue: rawValue,
    unit: selectedUnit,
    quantityGrams: Math.round(grams * 10) / 10,
    calories,
    protein,
    carbs,
    fat,
    fiber,
  };
}

export interface UserMetabolicPlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  deficitOrSurplusCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetFiberGrams: number;
  goalLabel: string;
  isConstrainedBySafetyFloor?: boolean;
}

/**
 * Motor Científico de Cálculo Metabólico e Metas Nutricionais
 * Integrado às diretrizes do CDC (perda de peso sustentável) e DRIs das National Academies (fibras e macros).
 */
export function calculateUserMetabolicTargets(user: any): UserMetabolicPlan {
  const weight = user?.weight ? Number(user.weight) : 75;
  const height = user?.height ? Number(user.height) : 175;
  const age = user?.age ? Number(user.age) : 28;
  const gender = (user?.gender || 'male').toLowerCase();
  const activityLevel = (user?.activityLevel || 'moderately_active').toLowerCase();
  const goal = (user?.goal || 'maintain').toLowerCase();

  // 1. TMB (Mifflin-St Jeor)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male' || gender === 'masculino') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 2. Fatores de Atividade TDEE / GET
  const activityMultipliers: Record<string, number> = {
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
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // 3. Ajuste Calórico Científico por Objetivo (CDC / NIH)
  let targetCalories = tdee;
  let deficitOrSurplusCalories = 0;
  let goalLabel = 'Manutenção do Peso';
  let isConstrainedBySafetyFloor = false;

  if (goal.includes('lose') || goal.includes('perda') || goal.includes('emagrecimento') || goal.includes('cut')) {
    const deficitResult = calcularDeficitCaloricoSustentavel(tdee, bmr, gender, weight);
    targetCalories = deficitResult.targetCalories;
    deficitOrSurplusCalories = -deficitResult.deficitCalories;
    isConstrainedBySafetyFloor = deficitResult.isConstrainedByBmr;
    goalLabel = `Emagrecimento Saudável (-${deficitResult.deficitCalories} kcal/dia)`;
  } else if (goal.includes('gain') || goal.includes('ganho') || goal.includes('hipertrofia') || goal.includes('bulk')) {
    const surplus = Math.min(500, Math.max(250, Math.round(tdee * 0.12))); // Superávit limpo de 12% (~300 a 450 kcal)
    targetCalories = tdee + surplus;
    deficitOrSurplusCalories = surplus;
    goalLabel = `Hipertrofia (+${surplus} kcal/dia)`;
  } else if (goal.includes('recomp')) {
    const recompDeficit = Math.round(tdee * 0.05);
    targetCalories = tdee - recompDeficit;
    deficitOrSurplusCalories = -recompDeficit;
    goalLabel = 'Recomposição Corporal';
  }

  // 4. Divisão Científica de Macronutrientes (ISSN / DRIs)
  // Proteína: 2.0g/kg para preservação e síntese muscular
  const targetProteinGrams = Math.round(weight * 2.0);
  const proteinCalories = targetProteinGrams * 4;

  // Gorduras: 0.8g/kg para suporte hormonal essencial
  const targetFatGrams = Math.round(weight * 0.8);
  const fatCalories = targetFatGrams * 9;

  // Carboidratos: Restante calórico para rendimento no treino e reposição de glicogênio
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const targetCarbsGrams = Math.round(remainingCalories / 4);

  // Fibras: Meta por 1000 kcal e perfil biológico (DRIs National Academies)
  const targetFiberGrams = calcularMetaFibras(targetCalories, gender, age);

  return {
    bmr,
    tdee,
    targetCalories,
    deficitOrSurplusCalories,
    targetProteinGrams,
    targetCarbsGrams,
    targetFatGrams,
    targetFiberGrams,
    goalLabel,
    isConstrainedBySafetyFloor,
  };
}

interface DietPreset {
  id: string;
  name: string;
  targetGoal: 'GAIN_WEIGHT' | 'LOSE_WEIGHT' | 'MAINTAIN';
  badge: string;
  description: string;
  icon: any;
  baseCalories: number;
  costInfo?: string;
  meals: {
    name: string;
    items: {
      foodName: string;
      baseQuantity: number;
      unit: PortionUnit;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g: number;
    }[];
  }[];
}

const dietPresets: DietPreset[] = [
  {
    id: 'budget_cost_benefit',
    name: 'Dieta Máximo Custo-Benefício (Econômica Brasil)',
    targetGoal: 'GAIN_WEIGHT',
    badge: '💰 R$ 15,80/dia · Alta Eficiência',
    description: 'Calculada com preços médios regionais brasileiros (Ovos R$0,65/un, Frango R$18,90/kg, Arroz, Feijão, Aveia, Banana). Máxima proteína por real investido.',
    icon: DollarSign,
    baseCalories: 2500,
    costInfo: 'Estimativa de custo mensal: R$ 474,00 / mês',
    meals: [
      {
        name: 'Café da Manhã Econômico',
        items: [
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 3, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
          { foodName: 'Banana prata', baseQuantity: 2, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
          { foodName: 'Aveia em flocos finos/grossos', baseQuantity: 50, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
        ],
      },
      {
        name: 'Almoço Tradicional Brasileiro',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
          { foodName: 'Feijão carioca cozido (50% grão/caldo)', baseQuantity: 120, unit: 'g', caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
      {
        name: 'Lanche da Tarde Anabólico de Baixo Custo',
        items: [
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 2, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
          { foodName: 'Leite desnatado UHT', baseQuantity: 1, unit: 'copo', caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5.0, fatPer100g: 0.2, fiberPer100g: 0 },
          { foodName: 'Pasta de amendoim integral 100%', baseQuantity: 1, unit: 'colher', caloriesPer100g: 593, proteinPer100g: 28.0, carbsPer100g: 18.0, fatPer100g: 46.0, fiberPer100g: 6.0 },
        ],
      },
      {
        name: 'Jantar',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Batata inglesa cozida', baseQuantity: 250, unit: 'g', caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 11.9, fatPer100g: 0.1, fiberPer100g: 1.3 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
    ],
  },
  {
    id: 'simple_minimalist',
    name: 'Dieta Prática & Minimalista (Apenas 5 Ingredientes Base)',
    targetGoal: 'MAINTAIN',
    badge: '⚡ Mínimo de Ingredientes & Marmitas',
    description: 'Planejada para quem tem pouco tempo de cozinhar. Utiliza apenas 5 alimentos-chave (Ovos, Frango, Arroz, Aveia e Banana) com fácil pesagem e preparo antecipado.',
    icon: Layers,
    baseCalories: 2300,
    costInfo: 'Preparo rápido em lote para a semana inteira (meal prep simplificado)',
    meals: [
      {
        name: 'Café da Manhã Rápido (3 min)',
        items: [
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 3, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
          { foodName: 'Banana prata', baseQuantity: 1, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
          { foodName: 'Aveia em flocos finos/grossos', baseQuantity: 40, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
        ],
      },
      {
        name: 'Marmita 1 - Almoço',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
      {
        name: 'Lanche Prático',
        items: [
          { foodName: 'Banana prata', baseQuantity: 2, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
          { foodName: 'Aveia em flocos finos/grossos', baseQuantity: 50, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 2, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
        ],
      },
      {
        name: 'Marmita 2 - Jantar',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
    ],
  },
  {
    id: 'hypertrophy_bulking',
    name: 'Dieta Hipertrofia & Bulking Limpo',
    targetGoal: 'GAIN_WEIGHT',
    badge: 'Hipertrofia & Massa Magra',
    description: 'Alto teor calórico e proteico balanceado para maximizar síntese proteica e ganhos musculares limpos.',
    icon: Dumbbell,
    baseCalories: 2750,
    meals: [
      {
        name: 'Café da Manhã Anabólico',
        items: [
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 3, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
          { foodName: 'Pão de forma 100% integral', baseQuantity: 2, unit: 'fatia', caloriesPer100g: 245, proteinPer100g: 9.5, carbsPer100g: 45.0, fatPer100g: 2.8, fiberPer100g: 7.0 },
          { foodName: 'Banana prata', baseQuantity: 1, unit: 'un', caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26.0, fatPer100g: 0.1, fiberPer100g: 2.0 },
          { foodName: 'Queijo Minas frescal', baseQuantity: 1, unit: 'fatia', caloriesPer100g: 264, proteinPer100g: 17.4, carbsPer100g: 3.2, fatPer100g: 20.2, fiberPer100g: 0 },
        ],
      },
      {
        name: 'Almoço de Construção',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 200, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Arroz branco cozido', baseQuantity: 200, unit: 'g', caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28.1, fatPer100g: 0.2, fiberPer100g: 1.6 },
          { foodName: 'Feijão carioca cozido (50% grão/caldo)', baseQuantity: 100, unit: 'g', caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
          { foodName: 'Brócolis cozido no vapor', baseQuantity: 100, unit: 'g', caloriesPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.5, fiberPer100g: 3.4 },
        ],
      },
      {
        name: 'Lanche / Pré-Treino de Alta Energia',
        items: [
          { foodName: 'Iogurte Grego desnatado (sem açúcar)', baseQuantity: 150, unit: 'g', caloriesPer100g: 59, proteinPer100g: 10.0, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0 },
          { foodName: 'Whey Protein Concentrado 80%', baseQuantity: 1, unit: 'scoop', caloriesPer100g: 385, proteinPer100g: 80.0, carbsPer100g: 5.0, fatPer100g: 4.5, fiberPer100g: 0 },
          { foodName: 'Aveia em flocos finos/grossos', baseQuantity: 40, unit: 'g', caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 66.6, fatPer100g: 8.5, fiberPer100g: 9.1 },
          { foodName: 'Pasta de amendoim integral 100%', baseQuantity: 1, unit: 'colher', caloriesPer100g: 593, proteinPer100g: 28.0, carbsPer100g: 18.0, fatPer100g: 46.0, fiberPer100g: 6.0 },
        ],
      },
      {
        name: 'Jantar Recuperador',
        items: [
          { foodName: 'Carne bovina patinho grelhado / moído', baseQuantity: 180, unit: 'g', caloriesPer100g: 219, proteinPer100g: 35.9, carbsPer100g: 0, fatPer100g: 7.3, fiberPer100g: 0 },
          { foodName: 'Batata doce cozida', baseQuantity: 200, unit: 'g', caloriesPer100g: 77, proteinPer100g: 0.6, carbsPer100g: 18.4, fatPer100g: 0.1, fiberPer100g: 2.2 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
    ],
  },
  {
    id: 'cutting_definition',
    name: 'Dieta Definição & Queima de Gordura (Cutting)',
    targetGoal: 'LOSE_WEIGHT',
    badge: 'Seca Gordura & Definição',
    description: 'Déficit calórico calculado com alto teor proteico e fibras para máxima saciedade e preservação de massa magra.',
    icon: Flame,
    baseCalories: 1850,
    meals: [
      {
        name: 'Café da Manhã Low-Cal',
        items: [
          { foodName: 'Ovo de galinha inteiro cozido', baseQuantity: 2, unit: 'un', caloriesPer100g: 146, proteinPer100g: 13.3, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0 },
          { foodName: 'Clara de ovo cozida / pasteurizada', baseQuantity: 100, unit: 'g', caloriesPer100g: 44, proteinPer100g: 9.6, carbsPer100g: 0.8, fatPer100g: 0.0, fiberPer100g: 0 },
          { foodName: 'Mamão papaia', baseQuantity: 100, unit: 'g', caloriesPer100g: 40, proteinPer100g: 0.5, carbsPer100g: 10.4, fatPer100g: 0.1, fiberPer100g: 1.8 },
        ],
      },
      {
        name: 'Almoço Sacietogênico',
        items: [
          { foodName: 'Tilápia filé grelhado', baseQuantity: 180, unit: 'g', caloriesPer100g: 120, proteinPer100g: 26.0, carbsPer100g: 0, fatPer100g: 1.3, fiberPer100g: 0 },
          { foodName: 'Arroz integral cozido', baseQuantity: 120, unit: 'g', caloriesPer100g: 124, proteinPer100g: 2.6, carbsPer100g: 25.8, fatPer100g: 1.0, fiberPer100g: 2.7 },
          { foodName: 'Brócolis cozido no vapor', baseQuantity: 150, unit: 'g', caloriesPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.5, fiberPer100g: 3.4 },
          { foodName: 'Azeite de oliva extravirgem', baseQuantity: 1, unit: 'colher', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
        ],
      },
      {
        name: 'Lanche Proteico',
        items: [
          { foodName: 'Bebida Láctea YoPRO 15g proteína (Danone)', baseQuantity: 1, unit: 'copo', caloriesPer100g: 60, proteinPer100g: 6.0, carbsPer100g: 5.5, fatPer100g: 1.0, fiberPer100g: 0 },
          { foodName: 'Morango fresco', baseQuantity: 100, unit: 'g', caloriesPer100g: 30, proteinPer100g: 0.9, carbsPer100g: 6.8, fatPer100g: 0.3, fiberPer100g: 1.7 },
        ],
      },
      {
        name: 'Jantar Leve & Magro',
        items: [
          { foodName: 'Frango filé de peito grelhado sem pele', baseQuantity: 180, unit: 'g', caloriesPer100g: 159, proteinPer100g: 32.0, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
          { foodName: 'Abóbora cabotiá cozida', baseQuantity: 150, unit: 'g', caloriesPer100g: 30, proteinPer100g: 0.8, carbsPer100g: 7.0, fatPer100g: 0.1, fiberPer100g: 1.6 },
        ],
      },
    ],
  },
];

export interface DietDiagnosisItem {
  type: 'STRENGTH' | 'IMPROVEMENT';
  importance: 'ALTA IMPORTÂNCIA' | 'MÉDIA IMPORTÂNCIA' | 'SUGESTÃO' | 'PONTO FORTE';
  title: string;
  description: string;
  actionRecommendation?: string;
}

export const DietPlanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'primary' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  const [inputDialog, setInputDialog] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  // Cálculo metabólico dinâmico
  const userMetabolism = useMemo(() => {
    return calculateUserMetabolicTargets(user);
  }, [user]);

  // Leitura síncrona do localStorage
  const [planName, setPlanName] = useState(() => {
    return localStorage.getItem(STORAGE_NAME_KEY) || 'Meu Plano Alimentar Personalizado';
  });

  const [mealsByDay, setMealsByDay] = useState<MealsByDay>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialMealsByDay;
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState<boolean>(false);
  const [activeSearchMealIdx, setActiveSearchMealIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState<boolean>(false);
  const [foodSearchError, setFoodSearchError] = useState<string | null>(null);
  const [selectedTargetMealIdx, setSelectedTargetMealIdx] = useState<number>(0);
  const [expandedFoods, setExpandedFoods] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [recentlyAddedFoodId, setRecentlyAddedFoodId] = useState<string | null>(null);
  const [recentlyAddedFoodMsg, setRecentlyAddedFoodMsg] = useState<string | null>(null);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState<boolean>(false);
  const [isHydrationOpen, setIsHydrationOpen] = useState<boolean>(false);

  // Refeições Favoritas
  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favs) return JSON.parse(favs);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [favoriteTargetMealIdx, setFavoriteTargetMealIdx] = useState<number>(0);

  // Drag and Drop
  const [draggedItem, setDraggedItem] = useState<{ mealIdx: number; itemIdx: number } | null>(null);
  const [dragOverMealIdx, setDragOverMealIdx] = useState<number | null>(null);

  // Status e Autosave
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestrictionModalOpen, setIsRestrictionModalOpen] = useState(false);
  const [pendingMealIdxForAdd, setPendingMealIdxForAdd] = useState<number | null>(null);

  const checkCanAddFood = (mealIdx?: number): boolean => {
    if (!restricoesAlimentaresPreenchidas(user)) {
      if (typeof mealIdx === 'number') {
        setPendingMealIdxForAdd(mealIdx);
      }
      setIsRestrictionModalOpen(true);
      return false;
    }
    return true;
  };

  const currentMeals = mealsByDay[selectedDay] || [];
  const isInitialSyncDone = useRef(false);

  // Sincronização inicial com o backend
  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/diet-plans');
      if (data && data.length > 0) {
        const active = data.find((p: any) => p.isActive) || data[0];
        if (active && active.days && active.days.length > 0) {
          const hasMealsInApi = active.days.some((d: any) => d.meals && d.meals.some((m: any) => m.items?.length > 0));
          if (hasMealsInApi) {
            setPlanName(active.name);
            const loadedMealsByDay: MealsByDay = { ...initialMealsByDay };
            active.days.forEach((d: any) => {
              const dayKey = d.dayOfWeek as DayOfWeek;
              if (loadedMealsByDay[dayKey]) {
                loadedMealsByDay[dayKey] = (d.meals || []).map((m: any) => ({
                  name: m.name,
                  items: (m.items || []).map((it: any) => {
                    const fi = it.foodItem;
                    const g = Number(it.quantityGrams) || 100;
                    const units = getValidUnitsForFood(fi?.name || it.foodName || '');
                    const defaultUnit = it.unit || units[0]?.id || 'g';

                    const cal100 = fi ? Number(fi.caloriesPer100g) : Number(it.caloriesPer100g) || (Number(it.calories) / (g / 100));
                    const p100 = fi ? Number(fi.proteinPer100g) : Number(it.proteinPer100g) || (Number(it.protein) / (g / 100));
                    const c100 = fi ? Number(fi.carbsPer100g) : Number(it.carbsPer100g) || (Number(it.carbs) / (g / 100));
                    const f100 = fi ? Number(fi.fatPer100g) : Number(it.fatPer100g) || (Number(it.fat) / (g / 100));
                    const fib100 = fi ? Number(fi.fiberPer100g || 0) : Number(it.fiberPer100g || 0);

                    const baseItem: LocalMealItem = {
                      foodItemId: it.foodItemId || fi?.id || 'saved-food',
                      foodName: fi?.name || it.foodName || 'Alimento',
                      quantityValue: it.quantityValue !== undefined ? it.quantityValue : (defaultUnit === 'g' || defaultUnit === 'ml' ? g : 1),
                      unit: defaultUnit,
                      quantityGrams: g,
                      caloriesPer100g: cal100 || 0,
                      proteinPer100g: p100 || 0,
                      carbsPer100g: c100 || 0,
                      fatPer100g: f100 || 0,
                      fiberPer100g: fib100 || 0,
                      calories: 0,
                      protein: 0,
                      carbs: 0,
                      fat: 0,
                      fiber: 0,
                    };

                    return recalculateItemNutrients(baseItem, baseItem.quantityValue, defaultUnit);
                  }),
                }));
              }
            });
            setMealsByDay(loadedMealsByDay);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedMealsByDay));
            localStorage.setItem(STORAGE_NAME_KEY, active.name);
          }
        }
      }
    } catch (err) {
      console.error('Falha ao carregar planos', err);
    } finally {
      isInitialSyncDone.current = true;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Autosave
  const triggerAutoSave = useCallback(
    async (nameToSave: string, mealsToSave: MealsByDay) => {
      setSaveStatus('saving');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mealsToSave));
        localStorage.setItem(STORAGE_NAME_KEY, nameToSave);

        const daysPayload = daysList.map((d) => ({
          dayOfWeek: d.id,
          meals: (mealsToSave[d.id] || []).map((m) => ({
            name: m.name,
            items: m.items.map((i) => ({
              foodItemId: i.foodItemId,
              quantityGrams: Number(i.quantityGrams) || 100,
            })),
          })),
        }));

        await api.post('/diet-plans', {
          name: nameToSave,
          days: daysPayload,
        });

        setSaveStatus('saved');
        gamificationService.recordAction(user?.id || 'guest', 'MEAL_SAVED');
      } catch (err) {
        console.error('Erro no autosave', err);
        setSaveStatus('error');
      }
    },
    [user]
  );

  useEffect(() => {
    if (!isInitialSyncDone.current) return;

    const timer = setTimeout(() => {
      triggerAutoSave(planName, mealsByDay);
    }, 800);

    return () => clearTimeout(timer);
  }, [mealsByDay, planName, triggerAutoSave]);

  // Busca de alimentos resiliente com Tabela TACO e sugestões
  useEffect(() => {
    let isMounted = true;
    setIsSearchingFoods(true);
    setFoodSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await foodService.searchFoods(searchQuery, 40);
        if (isMounted) {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar alimentos', err);
        if (isMounted) {
          setFoodSearchError('Não foi possível carregar os alimentos.');
        }
      } finally {
        if (isMounted) {
          setIsSearchingFoods(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Alterna expansão de detalhes do alimento
  const toggleExpandFood = (mealIdx: number, itemIdx: number) => {
    const key = `${mealIdx}_${itemIdx}`;
    setExpandedFoods((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Expande ou recolhe todos os alimentos
  const toggleExpandAllFoods = () => {
    const allKeys: string[] = [];
    currentMeals.forEach((meal, mIdx) => {
      meal.items.forEach((_, iIdx) => {
        allKeys.push(`${mIdx}_${iIdx}`);
      });
    });
    const areAllExpanded = allKeys.length > 0 && allKeys.every((k) => expandedFoods[k]);
    const nextState: Record<string, boolean> = {};
    if (!areAllExpanded) {
      allKeys.forEach((k) => {
        nextState[k] = true;
      });
    }
    setExpandedFoods(nextState);
  };

  // Marca/desmarca alimento como consumido e recolhe detalhes automaticamente
  const toggleFoodCompletion = (mealIdx: number, itemIdx: number) => {
    triggerHapticFeedback();
    const key = `${mealIdx}_${itemIdx}`;

    setMealsByDay((prev) => {
      const dayMeals = [...(prev[selectedDay] || [])];
      const targetMeal = dayMeals[mealIdx];
      if (!targetMeal) return prev;
      const items = [...targetMeal.items];
      const item = items[itemIdx];
      if (!item) return prev;

      const isNowCompleted = !item.completed;
      items[itemIdx] = {
        ...item,
        completed: isNowCompleted,
      };
      dayMeals[mealIdx] = { ...targetMeal, items };
      return { ...prev, [selectedDay]: dayMeals };
    });

    // Ao marcar como concluído, recolhe automaticamente os detalhes
    setExpandedFoods((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

    // Regra de Ouro do NutriHero: 1ª Refeição do dia desbloqueia Baú da Dieta (+1 Agilidade)
  const checkAndRewardFirstMealOfDay = async () => {
    if (!user?.id) return;
    try {
      const res = await idleGameService.taskCheckin(user.id, 'diet');
      if (res.success && !res.alreadyCompleted) {
        triggerHapticFeedback();
        setStatusMsg({
          type: 'success',
          text: `🎉 Primeira refeição do dia registrada! Recompensa desbloqueada: ${res.attributeGained}! O baú foi adicionado à sua Mochila 🎒.`,
        });
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch {
      // silencioso se falhar
    }
  };

  // Adiciona alimento à refeição alvo
  const addFoodToMeal = (food: FoodItem, specificMealIdx?: number) => {
    if (!checkCanAddFood()) return;

    const currentDayMeals = mealsByDay[selectedDay] || [];
    let targetIdx = specificMealIdx !== undefined ? specificMealIdx : selectedTargetMealIdx;
    if (targetIdx < 0 || targetIdx >= currentDayMeals.length) {
      targetIdx = 0;
    }
    const targetMealName = currentDayMeals[targetIdx]?.name || 'Refeição';

    const units = getValidUnitsForFood(food.name);
    const defaultUnit = units[0]?.id || 'g';
    const defaultQuantityValue = defaultUnit === 'g' || defaultUnit === 'ml' ? 100 : 1;

    const baseItem: LocalMealItem = {
      foodItemId: food.id,
      foodName: food.name,
      quantityValue: defaultQuantityValue,
      unit: defaultUnit,
      quantityGrams: 100,
      caloriesPer100g: Number(food.caloriesPer100g) || 0,
      proteinPer100g: Number(food.proteinPer100g) || 0,
      carbsPer100g: Number(food.carbsPer100g) || 0,
      fatPer100g: Number(food.fatPer100g) || 0,
      fiberPer100g: Number(food.fiberPer100g || 0),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      completed: false,
    };

    const newItem = recalculateItemNutrients(baseItem, defaultQuantityValue, defaultUnit);

    setMealsByDay((prev) => {
      const dayMeals = [...(prev[selectedDay] || [])];
      if (!dayMeals[targetIdx]) {
        dayMeals[targetIdx] = { name: 'Café da Manhã', items: [] };
      }
      dayMeals[targetIdx] = {
        ...dayMeals[targetIdx],
        items: [...dayMeals[targetIdx].items, newItem],
      };
      return { ...prev, [selectedDay]: dayMeals };
    });

    // REGRA DO NUTRI HERO: Primeira refeição do dia desbloqueia Baú da Dieta (+1 AGI)
    checkAndRewardFirstMealOfDay();
    triggerHapticFeedback();

    setRecentlyAddedFoodId(food.id);
    setRecentlyAddedFoodMsg(`✓ ${food.name} adicionado ao ${targetMealName}!`);
    setTimeout(() => {
      setRecentlyAddedFoodId(null);
      setRecentlyAddedFoodMsg(null);
    }, 2500);
  };

  // Edição funcional e precisa de quantidade
  const updateFoodQuantity = (mealIdx: number, itemIdx: number, rawValue: string) => {
    setMealsByDay((prev) => {
      const currentDayMeals = prev[selectedDay] || [];
      const updatedDayMeals = currentDayMeals.map((meal, mIdx) => {
        if (mIdx !== mealIdx) return meal;
        const updatedItems = meal.items.map((it, iIdx) => {
          if (iIdx !== itemIdx) return it;
          return recalculateItemNutrients(it, rawValue, it.unit);
        });
        return { ...meal, items: updatedItems };
      });
      return { ...prev, [selectedDay]: updatedDayMeals };
    });
  };

  // Edição de unidade diretamente no item
  const updateFoodUnit = (mealIdx: number, itemIdx: number, newUnit: PortionUnit) => {
    setMealsByDay((prev) => {
      const currentDayMeals = prev[selectedDay] || [];
      const updatedDayMeals = currentDayMeals.map((meal, mIdx) => {
        if (mIdx !== mealIdx) return meal;
        const updatedItems = meal.items.map((it, iIdx) => {
          if (iIdx !== itemIdx) return it;
          return recalculateItemNutrients(it, it.quantityValue, newUnit);
        });
        return { ...meal, items: updatedItems };
      });
      return { ...prev, [selectedDay]: updatedDayMeals };
    });
  };

  // Remove alimento
  const removeFoodItem = (mealIdx: number, itemIdx: number) => {
    setMealsByDay((prev) => {
      const dayMeals = [...prev[selectedDay]];
      const updatedItems = [...dayMeals[mealIdx].items];
      updatedItems.splice(itemIdx, 1);
      dayMeals[mealIdx] = { ...dayMeals[mealIdx], items: updatedItems };
      return { ...prev, [selectedDay]: dayMeals };
    });
  };

  // Salva refeição como favorita
  const handleSaveMealAsFavorite = (mealIdx: number) => {
    const meal = currentMeals[mealIdx];
    if (!meal || meal.items.length === 0) {
      alert('Adicione pelo menos 1 alimento à refeição antes de favoritá-la.');
      return;
    }

    setInputDialog({
      isOpen: true,
      title: 'Salvar Refeição Favorita',
      message: 'Nome para salvar esta Refeição Favorita:',
      defaultValue: meal.name,
      onConfirm: (customName) => {
        if (!customName?.trim()) return;

        const newFav: FavoriteMeal = {
          id: Date.now().toString(),
          name: customName.trim(),
          items: JSON.parse(JSON.stringify(meal.items)),
          savedAt: new Date().toLocaleDateString('pt-BR'),
        };

        const updated = [newFav, ...favoriteMeals];
        setFavoriteMeals(updated);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));

        setStatusMsg({
          type: 'success',
          text: `Refeição "${customName}" salva nas suas Favoritas com sucesso!`,
        });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    });
  };

  // Insere refeição favorita
  const handleInsertFavoriteMeal = (fav: FavoriteMeal) => {
    setMealsByDay((prev) => {
      const dayMeals = [...prev[selectedDay]];
      dayMeals[favoriteTargetMealIdx] = {
        name: dayMeals[favoriteTargetMealIdx].name,
        items: JSON.parse(JSON.stringify(fav.items)),
      };
      return { ...prev, [selectedDay]: dayMeals };
    });

    setIsFavoritesModalOpen(false);
    setStatusMsg({
      type: 'success',
      text: `Refeição favorita "${fav.name}" carregada no ${currentMeals[favoriteTargetMealIdx]?.name}!`,
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Exclui refeição favorita
  const handleDeleteFavoriteMeal = (favId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: 'Remover Refeição',
      message: 'Deseja remover esta refeição das suas favoritas?',
      variant: 'danger',
      onConfirm: () => {
        const updated = favoriteMeals.filter((f) => f.id !== favId);
        setFavoriteMeals(updated);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      }
    });
  };

  /**
   * Aplica Dieta Pré-Montada ou Personalizada Dimensionada com Unidades Práticas Inteiras
   */
  const handleApplyDietPreset = async (preset: DietPreset, scaleToUserTdee = true) => {
    if (!checkCanAddFood()) return;

    const targetCalories = scaleToUserTdee ? userMetabolism.targetCalories : preset.baseCalories;
    const planTitle = `${preset.name} (${userMetabolism.goalLabel} - ${targetCalories} kcal)`;

    setConfirmDialog({
      isOpen: true,
      title: 'Carregar Cardápio',
      message: `Carregar o cardápio "${preset.name}" ajustado cientificamente com quantidades práticas inteiras para sua meta de ${targetCalories} kcal?`,
      onConfirm: () => {
        setPlanName(planTitle);

        const calibratedMeals = calibrateDietMeals(preset.meals, targetCalories, preset.baseCalories, {
          calories: targetCalories,
          protein: userMetabolism.targetProteinGrams,
          carbs: userMetabolism.targetCarbsGrams,
          fat: userMetabolism.targetFatGrams,
          fiber: userMetabolism.targetFiberGrams,
          userWeight: user?.weight ? Number(user.weight) : 75,
          userGender: user?.gender || 'male',
          userAge: user?.age ? Number(user.age) : 28,
          goal: user?.goal || 'maintain',
        });

        const newWeek: MealsByDay = {
          MONDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          TUESDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          WEDNESDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          THURSDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          FRIDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          SATURDAY: JSON.parse(JSON.stringify(calibratedMeals)),
          SUNDAY: JSON.parse(JSON.stringify(calibratedMeals)),
        };

        setMealsByDay(newWeek);
        triggerAutoSave(planTitle, newWeek);

        setStatusMsg({
          type: 'success',
          text: `Plano alimentar calibrado para ${targetCalories} kcal (${userMetabolism.goalLabel}) com unidades práticas aplicado!`,
        });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    });
  };

  // Drag and Drop
  const handleDragStart = (mealIdx: number, itemIdx: number, e: React.DragEvent) => {
    setDraggedItem({ mealIdx, itemIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverMeal = (mealIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverMealIdx !== mealIdx) {
      setDragOverMealIdx(mealIdx);
    }
  };

  const handleDropOnMeal = (targetMealIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverMealIdx(null);

    if (!draggedItem) return;
    const { mealIdx: sourceMealIdx, itemIdx: sourceItemIdx } = draggedItem;

    if (sourceMealIdx === targetMealIdx) {
      setDraggedItem(null);
      return;
    }

    setMealsByDay((prev) => {
      const dayMeals = JSON.parse(JSON.stringify(prev[selectedDay]));
      const itemToMove = dayMeals[sourceMealIdx].items[sourceItemIdx];
      dayMeals[sourceMealIdx].items.splice(sourceItemIdx, 1);
      dayMeals[targetMealIdx].items.push(itemToMove);
      return { ...prev, [selectedDay]: dayMeals };
    });

    setStatusMsg({
      type: 'success',
      text: `Alimento transferido para ${currentMeals[targetMealIdx]?.name}!`,
    });
    setTimeout(() => setStatusMsg(null), 2500);
    setDraggedItem(null);
  };

  // Adiciona nova refeição
  const addMealSection = () => {
    setInputDialog({
      isOpen: true,
      title: 'Nova Refeição',
      message: 'Nome da nova refeição:',
      placeholder: 'ex: Ceia, Pré-Treino, Shake da Tarde',
      onConfirm: (mealName) => {
        if (mealName?.trim()) {
          setMealsByDay((prev) => {
            const dayMeals = [...prev[selectedDay], { name: mealName.trim(), items: [] }];
            return { ...prev, [selectedDay]: dayMeals };
          });
        }
      }
    });
  };

  // Exclui refeição
  const removeMealSection = (mealIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Refeição',
      message: `Deseja excluir a refeição "${currentMeals[mealIdx]?.name}"?`,
      variant: 'danger',
      onConfirm: () => {
        setMealsByDay((prev) => {
          const dayMeals = [...prev[selectedDay]];
          dayMeals.splice(mealIdx, 1);
          return { ...prev, [selectedDay]: dayMeals };
        });
      }
    });
  };

  // Replica dia atual para a semana toda
  const handleReplicateToAllDays = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Replicar Cardápio',
      message: `Copiar o cardápio de ${
        daysList.find((d) => d.id === selectedDay)?.fullLabel
      } para TODOS os 7 dias da semana?`,
      onConfirm: () => {
        const replicated: MealsByDay = {
          MONDAY: JSON.parse(JSON.stringify(currentMeals)),
          TUESDAY: JSON.parse(JSON.stringify(currentMeals)),
          WEDNESDAY: JSON.parse(JSON.stringify(currentMeals)),
          THURSDAY: JSON.parse(JSON.stringify(currentMeals)),
          FRIDAY: JSON.parse(JSON.stringify(currentMeals)),
          SATURDAY: JSON.parse(JSON.stringify(currentMeals)),
          SUNDAY: JSON.parse(JSON.stringify(currentMeals)),
        };
        setMealsByDay(replicated);
        triggerAutoSave(planName, replicated);
        setStatusMsg({
          type: 'success',
          text: 'Cardápio replicado com sucesso para todos os dias da semana!',
        });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    });
  };

  // Totais do dia
  const dayTotals = useMemo(() => {
    return currentMeals.reduce(
      (acc, meal) => {
        meal.items.forEach((item) => {
          acc.calories += Number(item.calories) || 0;
          acc.protein += Number(item.protein) || 0;
          acc.carbs += Number(item.carbs) || 0;
          acc.fat += Number(item.fat) || 0;
          acc.fiber += Number(item.fiber) || 0;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [currentMeals]);

  // Diagnóstico de Pontos Fortes e Fracos
  const dietDiagnosis = useMemo((): DietDiagnosisItem[] => {
    const itemsCount = currentMeals.reduce((cnt, m) => cnt + m.items.length, 0);
    if (itemsCount === 0) return [];

    const diagnosis: DietDiagnosisItem[] = [];
    const userWeight = user?.weight ? Number(user.weight) : 75;
    const userTargetCal = userMetabolism.targetCalories;

    const proteinPerKg = Math.round((dayTotals.protein / userWeight) * 10) / 10;

    // 1. Diagnóstico de Proteína
    if (proteinPerKg < 1.4) {
      diagnosis.push({
        type: 'IMPROVEMENT',
        importance: 'ALTA IMPORTÂNCIA',
        title: `Ingestão Proteica Baixa (${proteinPerKg}g/kg)`,
        description: `Seu consumo atual é de ${Math.round(dayTotals.protein)}g para seu peso de ${userWeight}kg. Abaixo de 1.4g/kg há risco de recuperação lenta e perda de massa muscular.`,
        actionRecommendation: `Adicione alimentos densos em proteína (Peito de frango, ovos, tilápia, leite desnatado ou Whey Protein) para atingir entre 1.8g e 2.2g/kg (${Math.round(userWeight * 1.8)}g a ${Math.round(userWeight * 2.2)}g/dia).`,
      });
    } else if (proteinPerKg >= 1.4 && proteinPerKg < 1.8) {
      diagnosis.push({
        type: 'IMPROVEMENT',
        importance: 'MÉDIA IMPORTÂNCIA',
        title: `Aporte Proteico Moderado (${proteinPerKg}g/kg)`,
        description: `Ingestão de ${Math.round(dayTotals.protein)}g está aceitável para manutenção, mas ligeiramente abaixo do padrão ideal de hipertrofia máxima.`,
        actionRecommendation: `Acrescente 1 a 2 ovos ou 50g extras de frango/iogurte para atingir 2.0g/kg.`,
      });
    } else {
      diagnosis.push({
        type: 'STRENGTH',
        importance: 'PONTO FORTE',
        title: `Aporte Proteico Excelente (${proteinPerKg}g/kg)`,
        description: `Consumo de ${Math.round(dayTotals.protein)}g garante máxima sinalização de síntese proteica miofibrilar e ótima recuperação tecidual.`,
      });
    }

    // 2. Diagnóstico de Fibras
    if (dayTotals.fiber < 18) {
      diagnosis.push({
        type: 'IMPROVEMENT',
        importance: 'ALTA IMPORTÂNCIA',
        title: `Consumo de Fibras Insuficiente (${Math.round(dayTotals.fiber)}g / meta 25-35g)`,
        description: `Fibras abaixo de 18g prejudicam a microbiota intestinal, saciedade e controle glicêmico.`,
        actionRecommendation: `Inclua aveia, feijão, chia, maçã com casca ou brócolis.`,
      });
    } else {
      diagnosis.push({
        type: 'STRENGTH',
        importance: 'PONTO FORTE',
        title: `Excelente Aporte de Fibras (${Math.round(dayTotals.fiber)}g)`,
        description: `Auxilia na saúde digestiva, motilidade intestinal e estabilidade glicêmica.`,
      });
    }

    // 3. Diagnóstico do Balanço Energético vs Meta do Usuário
    const calDiff = dayTotals.calories - userTargetCal;
    if (Math.abs(calDiff) <= 150) {
      diagnosis.push({
        type: 'STRENGTH',
        importance: 'PONTO FORTE',
        title: `Aderência Calórica Precisa (${Math.round(dayTotals.calories)} kcal / meta ${userTargetCal} kcal)`,
        description: `O total calórico está perfeitamente alinhado com seu objetivo (${userMetabolism.goalLabel}).`,
      });
    } else if (calDiff < -300) {
      diagnosis.push({
        type: 'IMPROVEMENT',
        importance: 'MÉDIA IMPORTÂNCIA',
        title: `Déficit Calórico Muito Acentuado (${Math.round(dayTotals.calories)} kcal vs meta ${userTargetCal} kcal)`,
        description: `Ingestão ${Math.abs(Math.round(calDiff))} kcal abaixo do recomendado.`,
        actionRecommendation: `Aumente ligeiramente fontes de carboidratos complexos (Arroz, Batata, Aveia).`,
      });
    } else if (calDiff > 300) {
      diagnosis.push({
        type: 'IMPROVEMENT',
        importance: 'MÉDIA IMPORTÂNCIA',
        title: `Excesso Calórico em Relação à Meta (+${Math.round(calDiff)} kcal)`,
        description: `Ingestão superior à meta planejada para seu gasto energético.`,
        actionRecommendation: `Reduza as porções de azeite, pastas ou fontes densas de carboidrato.`,
      });
    }

    return diagnosis;
  }, [currentMeals, dayTotals, user, userMetabolism]);

  // Filtro de alimentos da busca TACO por categoria selecionada
  const filteredFoods = useMemo(() => {
    if (selectedCategory === 'ALL') return searchResults;

    return searchResults.filter((f: FoodItem) => {
      const lower = f.name.toLowerCase();
      const p = Number(f.proteinPer100g) || 0;
      const c = Number(f.carbsPer100g) || 0;
      const g = Number(f.fatPer100g) || 0;
      const fib = Number(f.fiberPer100g) || 0;

      switch (selectedCategory) {
        case 'PROTEIN':
          return (
            p >= 12 ||
            lower.includes('frango') ||
            lower.includes('carne') ||
            lower.includes('patinho') ||
            lower.includes('alcatra') ||
            lower.includes('bovina') ||
            lower.includes('ovo') ||
            lower.includes('peixe') ||
            lower.includes('tilápia') ||
            lower.includes('tilapia') ||
            lower.includes('salmão') ||
            lower.includes('salmao') ||
            lower.includes('atum') ||
            lower.includes('whey') ||
            lower.includes('queijo') ||
            lower.includes('iogurte') ||
            lower.includes('leite')
          );
        case 'CARBS':
          return (
            c >= 18 ||
            lower.includes('arroz') ||
            lower.includes('batata') ||
            lower.includes('aveia') ||
            lower.includes('pão') ||
            lower.includes('pao') ||
            lower.includes('macarrão') ||
            lower.includes('macarrao') ||
            lower.includes('mandioca') ||
            lower.includes('tapioca') ||
            lower.includes('cuscuz') ||
            lower.includes('milho') ||
            lower.includes('granola')
          );
        case 'FATS':
          return (
            g >= 12 ||
            lower.includes('azeite') ||
            lower.includes('óleo') ||
            lower.includes('oleo') ||
            lower.includes('pasta de amendoim') ||
            lower.includes('castanha') ||
            lower.includes('nozes') ||
            lower.includes('amêndoa') ||
            lower.includes('amendoa') ||
            lower.includes('abacate') ||
            lower.includes('manteiga')
          );
        case 'FIBERS':
          return (
            fib >= 2.5 ||
            lower.includes('brócolis') ||
            lower.includes('brocolis') ||
            lower.includes('couve') ||
            lower.includes('alface') ||
            lower.includes('espinafre') ||
            lower.includes('feijão') ||
            lower.includes('feijao') ||
            lower.includes('lentilha') ||
            lower.includes('cenoura') ||
            lower.includes('tomate') ||
            lower.includes('rúcula') ||
            lower.includes('rucula') ||
            lower.includes('salada')
          );
        case 'FRUITS':
          return (
            lower.includes('banana') ||
            lower.includes('maçã') ||
            lower.includes('maca') ||
            lower.includes('laranja') ||
            lower.includes('morango') ||
            lower.includes('kiwi') ||
            lower.includes('uva') ||
            lower.includes('abacaxi') ||
            lower.includes('mamão') ||
            lower.includes('mamao') ||
            lower.includes('melancia') ||
            lower.includes('manga') ||
            lower.includes('limão') ||
            lower.includes('limao')
          );
        default:
          return true;
      }
    });
  }, [searchResults, selectedCategory]);

  // Contadores e métricas para a Caixa 2 (Dieta Montada)
  const totalFoodsCount = useMemo(() => {
    return currentMeals.reduce((acc, m) => acc + m.items.length, 0);
  }, [currentMeals]);

  const completedFoodsCount = useMemo(() => {
    return currentMeals.reduce(
      (acc, m) => acc + m.items.filter((i) => i.completed).length,
      0
    );
  }, [currentMeals]);

  const consumedPercent = totalFoodsCount > 0 ? Math.round((completedFoodsCount / totalFoodsCount) * 100) : 0;
  const isAllConsumed = totalFoodsCount > 0 && completedFoodsCount === totalFoodsCount;

  const calPercent = userMetabolism.targetCalories > 0
    ? Math.round((dayTotals.calories / userMetabolism.targetCalories) * 100)
    : 0;

  const areAllFoodsExpanded = useMemo(() => {
    if (totalFoodsCount === 0) return false;
    return currentMeals.every((meal, mIdx) =>
      meal.items.every((_, iIdx) => expandedFoods[`${mIdx}_${iIdx}`])
    );
  }, [currentMeals, expandedFoods, totalFoodsCount]);

  
  // Aplica combo pronto de alimentos com 1 toque na refeição ativa
  const handleApplyQuickCombo = (combo: typeof QUICK_DIET_COMBOS[0]) => {
    if (!checkCanAddFood()) return;
    const dayMeals = mealsByDay[selectedDay] || [];
    let targetIdx = selectedTargetMealIdx;
    if (targetIdx < 0 || targetIdx >= dayMeals.length) {
      targetIdx = 0;
    }
    const targetMealName = dayMeals[targetIdx]?.name || 'Refeição';

    const newItems: LocalMealItem[] = combo.items.map((item) => {
      const baseItem: LocalMealItem = {
        foodItemId: `combo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        foodName: item.foodName,
        quantityValue: item.quantityValue,
        unit: item.unit,
        quantityGrams: item.quantityGrams,
        caloriesPer100g: item.caloriesPer100g,
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g,
        fiberPer100g: item.fiberPer100g,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        completed: false,
      };
      return recalculateItemNutrients(baseItem, item.quantityValue, item.unit);
    });

    setMealsByDay((prev) => {
      const currentList = [...(prev[selectedDay] || [])];
      if (!currentList[targetIdx]) {
        currentList[targetIdx] = { name: targetMealName, items: [] };
      }
      currentList[targetIdx] = {
        ...currentList[targetIdx],
        items: [...currentList[targetIdx].items, ...newItems],
      };
      return { ...prev, [selectedDay]: currentList };
    });

    checkAndRewardFirstMealOfDay();
    triggerHapticFeedback();
    setStatusMsg({
      type: 'success',
      text: `🎉 Combo "${combo.label}" (${combo.items.length} alimentos) adicionado ao ${targetMealName}!`,
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Exportar JSON
  const handleExportJson = () => {
    const exportData = {
      name: planName,
      exportedAt: new Date().toISOString(),
      userMetabolism,
      mealsByDay,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planName.toLowerCase().replace(/\s+/g, '_')}_dieta.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Banner Informativo de Alergias & Restrições */}
      {(() => {
        const allergyInfo = getAllergyBannerInfo(user || {});
        if (allergyInfo.status === 'HAS_ALLERGIES') {
          return (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>Proteção de Alergias Ativa:</strong> Alimentos com{' '}
                  <span className="underline font-bold text-white">{allergyInfo.allergies.join(', ')}</span> serão filtrados e sinalizados na montagem da sua dieta.
                </span>
              </div>
              <button
                onClick={() => setIsRestrictionModalOpen(true)}
                className="text-[11px] font-bold text-rose-400 hover:text-white underline whitespace-nowrap"
              >
                Editar
              </button>
            </div>
          );
        } else if (allergyInfo.status === 'NO_INFO') {
          return (
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1F2937] text-slate-400 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Alergias não informadas:</strong> Preencha suas restrições alimentares para ativar a exclusão automática de ingredientes alérgenos.
                </span>
              </div>
              <button
                onClick={() => setIsRestrictionModalOpen(true)}
                className="text-[11px] font-bold text-emerald-400 hover:text-white underline whitespace-nowrap"
              >
                Informar agora
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* ========================================================================= */}
      {/* CAIXA 1: MONTADOR DE DIETA DINÂMICO E CONDENSADO                          */}
      {/* ========================================================================= */}
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Cabeçalho do Montador com Ações e Status Integrados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243044]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Montador de Dieta
              </h2>
              <p className="text-xs text-slate-400">
                Selecione a refeição com 1 toque, use combos prontos ou adicione alimentos da TACO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status de Salvamento */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-400 hidden sm:inline">Salvando...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Salvo</span>
                </>
              ) : (
                <span className="text-slate-400">Pronto</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Exportar plano em JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback();
                setIsRecommendationsOpen(!isRecommendationsOpen);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRecommendationsOpen ? 'Fechar Modelos' : 'Modelos Prontos'}</span>
            </button>

            <button
              type="button"
              onClick={addMealSection}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nova Refeição</span>
            </button>
          </div>
        </div>

        {/* Modelos Prontos (se expandido) */}
        {isRecommendationsOpen && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Modelos de Cardápios Baseados em Evidência (Calibrados para {userMetabolism.targetCalories} kcal)
              </span>
              <button onClick={() => setIsRecommendationsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dietPresets.map((preset) => {
                const IconComp = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      handleApplyDietPreset(preset, true);
                      setIsRecommendationsOpen(false);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {preset.badge}
                        </span>
                        <IconComp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <h4 className="font-extrabold text-xs text-white group-hover:text-emerald-300 mt-1">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px] mt-2 flex items-center gap-1">
                      Calibrar & Aplicar <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Abas dos Dias da Semana - Barra Horizontal Condensada */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
            {daysList.map((day) => {
              const isSelected = selectedDay === day.id;
              const count = (mealsByDay[day.id] || []).reduce((acc, m) => acc + m.items.length, 0);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold tracking-wider transition-all uppercase flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                  title={day.fullLabel}
                >
                  <span>{day.shortLabel}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    isSelected ? 'bg-slate-950 text-emerald-400 font-bold' : 'bg-slate-950 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleReplicateToAllDays}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-800 hover:border-emerald-500/40 cursor-pointer shrink-0"
            title="Copiar o cardápio deste dia para todos os outros 6 dias da semana"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replicar Semana</span>
          </button>
        </div>

        {/* Nome do Plano Alimentar com Sugestões Rápidas */}
        <div className="pt-2 border-t border-[#243044] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Plano:
            </span>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Ex: Minha Dieta Hipertrofia Limpa"
              className="flex-1 max-w-sm px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">Sugestões:</span>
            {['Hipertrofia', 'Cutting', 'Manutenção', 'Low Carb'].map((sug) => (
              <button
                type="button"
                key={sug}
                onClick={() => setPlanName(`Dieta ${sug}`)}
                className="text-[11px] px-2 py-0.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* FORMA DINÂMICA: ABAS INTERATIVAS DAS REFEIÇÕES DO DIA (1-TOQUE)          */}
        {/* ======================================================================= */}
        <div className="space-y-2 pt-2 border-t border-[#243044]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Adicionando Alimentos Na Refeição:</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              (Toque na refeição para alternar o destino)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentMeals.map((meal, idx) => {
              const isTarget = selectedTargetMealIdx === idx;
              const mealCals = meal.items.reduce((s, it) => s + (Number(it.calories) || 0), 0);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback();
                    setSelectedTargetMealIdx(idx);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 ${
                    isTarget
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{meal.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isTarget ? 'bg-slate-950 text-emerald-400' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'} &middot; {Math.round(mealCals)} kcal
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={addMealSection}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-dashed border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova</span>
            </button>
          </div>
        </div>

        {/* COMBOS RÁPIDOS DE 1-TOQUE (PRATOS PRONTOS BALANCEADOS) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Combos Prontos de 1-Toque (Adiciona direto ao {currentMeals[selectedTargetMealIdx]?.name || 'Refeição'}):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DIET_COMBOS.map((combo) => (
              <button
                key={combo.label}
                type="button"
                onClick={() => handleApplyQuickCombo(combo)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>{combo.icon}</span>
                <span>{combo.label}</span>
                <span className="text-[10px] text-amber-400/90 font-normal">({combo.calories} kcal)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Tags / Categorias Nutricionais */}
        <div className="space-y-2 pt-1 border-t border-[#243044]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Categorias de Alimentos:</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-bold">
              {filteredFoods.length} {filteredFoods.length === 1 ? 'disponível' : 'disponíveis'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FOOD_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    triggerHapticFeedback();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400 font-extrabold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* BUSCA E GRADE DE ALIMENTOS DA TABELA TACO */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>Alimentos da Tabela TACO:</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Entrando em: <strong className="text-emerald-400">{currentMeals[selectedTargetMealIdx]?.name || 'Refeição'}</strong>)
                </span>
              </h3>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar (ex: Frango, Arroz, Ovo...)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mensagem de Feedback de Adição */}
          {recentlyAddedFoodMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{recentlyAddedFoodMsg}</span>
            </div>
          )}

          {/* Grade de Alimentos para Adicionar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {isSearchingFoods ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400 mx-auto mb-2" />
                Consultando Tabela TACO...
              </div>
            ) : filteredFoods.length > 0 ? (
              filteredFoods.map((food) => {
                const isRecentlyAdded = recentlyAddedFoodId === food.id;
                const allergyCheck = checkFoodAllergens(food.name, user?.allergies);
                const isAlreadyInTargetMeal = currentMeals[selectedTargetMealIdx]?.items.some(
                  (it) => it.foodItemId === food.id || it.foodName === food.name
                );

                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => addFoodToMeal(food)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isRecentlyAdded
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                        : allergyCheck.isAllergen
                        ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                        : isAlreadyInTargetMeal
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex-1 pr-2 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs text-white block truncate">
                          {food.name}
                        </span>
                        {allergyCheck.isAllergen && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            ⚠️ Alérgeno
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                        {food.caloriesPer100g} kcal &middot; P: {food.proteinPer100g}g &middot; C: {food.carbsPer100g}g &middot; G: {food.fatPer100g}g
                      </span>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        isRecentlyAdded
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : isAlreadyInTargetMeal
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                      }`}
                    >
                      {isRecentlyAdded ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Adicionado!</span>
                        </>
                      ) : isAlreadyInTargetMeal ? (
                        <>
                          <span>+1 Porção</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Nenhum alimento encontrado para "{searchQuery}". Tente palavras simples como "arroz", "frango", "ovo", "aveia" ou "banana".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CAIXA 2: DIETA MONTADA (Apenas o nome do alimento até ser iniciado)       */}
      {/* ========================================================================= */}
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Cabeçalho da Dieta Montada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243044]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Dieta Montada: {daysList.find((d) => d.id === selectedDay)?.fullLabel}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {totalFoodsCount} {totalFoodsCount === 1 ? 'alimento cadastrado' : 'alimentos cadastrados'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFavoritesModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Refeições Favoritas</span>
            </button>

            {totalFoodsCount > 0 && (
              <button
                type="button"
                onClick={toggleExpandAllFoods}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {areAllFoodsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{areAllFoodsExpanded ? 'Recolher Todos' : 'Ver Todos Detalhes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sumário Condensado de Calorias, Macros e Alimentos Consumidos */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
          {/* Linha 1: Calorias */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Calorias do Dia:</span>
                <span className="text-emerald-400 font-black text-sm">{Math.round(dayTotals.calories)} kcal</span>
              </span>
              <span className="text-slate-400">
                Meta:{' '}
                <strong className="text-white">
                  {userMetabolism.targetCalories} kcal
                </strong>{' '}
                ({userMetabolism.goalLabel})
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  calPercent > 105 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(calPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Linha 2: Mini Pills de Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400">Proteína</span>
              <span className="text-xs font-black text-white">
                {Math.round(dayTotals.protein)}g / <span className="text-slate-400 font-semibold">{userMetabolism.targetProteinGrams}g</span>
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400">Carboidratos</span>
              <span className="text-xs font-black text-white">
                {Math.round(dayTotals.carbs)}g / <span className="text-slate-400 font-semibold">{userMetabolism.targetCarbsGrams}g</span>
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400">Gorduras</span>
              <span className="text-xs font-black text-white">
                {Math.round(dayTotals.fat)}g / <span className="text-slate-400 font-semibold">{userMetabolism.targetFatGrams}g</span>
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400">Fibras</span>
              <span className="text-xs font-black text-white">
                {Math.round(dayTotals.fiber)}g / <span className="text-slate-400 font-semibold">28g</span>
              </span>
            </div>
          </div>

          {/* Linha 3: Progresso de Conclusão / Alimentos Consumidos */}
          {totalFoodsCount > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className={`font-bold ${isAllConsumed ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {completedFoodsCount} de {totalFoodsCount} alimentos consumidos hoje ({consumedPercent}%)
                </span>
                <div className="w-24 sm:w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isAllConsumed ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${consumedPercent}%` }}
                  />
                </div>
                {isAllConsumed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Cardápio 100% Consumido
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LISTA DAS REFEIÇÕES E ALIMENTOS */}
        <div className="space-y-4">
          {currentMeals.map((meal, mealIdx) => {
            const mealTotals = meal.items.reduce(
              (acc, it) => {
                acc.calories += Number(it.calories) || 0;
                acc.protein += Number(it.protein) || 0;
                acc.carbs += Number(it.carbs) || 0;
                acc.fat += Number(it.fat) || 0;
                return acc;
              },
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            return (
              <div
                key={mealIdx}
                onDragOver={(e) => handleDragOverMeal(mealIdx, e)}
                onDrop={(e) => handleDropOnMeal(mealIdx, e)}
                className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-md transition-all space-y-3 ${
                  dragOverMealIdx === mealIdx
                    ? 'border-emerald-400 bg-emerald-950/20 ring-2 ring-emerald-500/30'
                    : 'border-slate-800/90'
                }`}
              >
                {/* Linha do Cabeçalho da Refeição */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 shrink-0">
                      {mealIdx === 0 ? (
                        <Coffee className="w-4 h-4" />
                      ) : mealIdx === 1 ? (
                        <Sun className="w-4 h-4" />
                      ) : mealIdx === 2 ? (
                        <Sunset className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white text-base">{meal.name}</h3>
                        <span className="text-[11px] px-2 py-0.2 rounded-md bg-slate-950 text-slate-400 font-semibold border border-slate-800">
                          {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="text-emerald-400 font-bold">{Math.round(mealTotals.calories)} kcal</span>
                        <span>&middot;</span>
                        <span>P: {Math.round(mealTotals.protein)}g</span>
                        <span>&middot;</span>
                        <span>C: {Math.round(mealTotals.carbs)}g</span>
                        <span>&middot;</span>
                        <span>G: {Math.round(mealTotals.fat)}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSaveMealAsFavorite(mealIdx)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salvar esta refeição nas Favoritas"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Favoritar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetMealIdx(mealIdx);
                        setStatusMsg({
                          type: 'success',
                          text: `Refeição "${meal.name}" selecionada no montador acima!`,
                        });
                        setTimeout(() => setStatusMsg(null), 2500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold flex items-center gap-1 transition-all border border-emerald-500/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Alimento</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeMealSection(mealIdx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remover refeição"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lista dos Alimentos da Refeição (Apenas o nome por padrão) */}
                <div className="space-y-2">
                  {meal.items.map((item, itemIdx) => {
                    const key = `${mealIdx}_${itemIdx}`;
                    const isCompleted = Boolean(item.completed);
                    const isExpanded = Boolean(expandedFoods[key]);
                    const foodUnits = getValidUnitsForFood(item.foodName);
                    const allergyCheck = checkFoodAllergens(item.foodName, user?.allergies);

                    return (
                      <div
                        key={itemIdx}
                        draggable
                        onDragStart={(e) => handleDragStart(mealIdx, itemIdx, e)}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm shadow-emerald-950/30'
                            : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* LINHA DO ALIMENTO: APENAS O NOME DO ALIMENTO */}
                        <div
                          onClick={() => toggleExpandFood(mealIdx, itemIdx)}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Grip / Número ou Check */}
                            <div className="text-slate-500 hover:text-slate-300 cursor-grab shrink-0">
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>

                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span>{itemIdx + 1}</span>}
                            </div>

                            {/* APENAS O NOME DO ALIMENTO (VERDE SE CONCLUÍDO) */}
                            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-extrabold truncate ${
                                  isCompleted ? 'text-emerald-400' : 'text-white'
                                }`}
                              >
                                {item.foodName}
                              </span>

                              {/* Porção compacta ao lado */}
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                                {item.quantityValue} {item.unit} ({item.quantityGrams}g)
                              </span>

                              {isCompleted && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  Consumido
                                </span>
                              )}
                            </div>
                          </div>

                          {/* AÇÕES NA DIREITA: INICIAR OU VER DETALHES + EXCLUIR */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isCompleted ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandFood(mealIdx, itemIdx);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>{isExpanded ? 'Ocultar' : 'Ajustar / Consumir'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandFood(mealIdx, itemIdx);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>{isExpanded ? 'Ocultar' : 'Ver Detalhes'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFoodItem(mealIdx, itemIdx);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remover alimento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* DETALHES EXPANDIDOS (QUANDO O USUÁRIO CLICA PARA AJUSTAR OU CONSUMIR) */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-950/60 animate-in fade-in duration-150">
                            {/* Alerta de Alérgeno */}
                            {allergyCheck.isAllergen && (
                              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>
                                  <strong>Atenção alérgeno detectado:</strong> Contém {allergyCheck.matchedAllergens.join(', ')}.
                                </span>
                              </div>
                            )}

                            {/* Configuração de Quantidade e Unidade */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Quantidade:
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={item.quantityValue}
                                  onChange={(e) => updateFoodQuantity(mealIdx, itemIdx, e.target.value)}
                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500 text-center"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Unidade:
                                </label>
                                <select
                                  value={item.unit}
                                  onChange={(e) => updateFoodUnit(mealIdx, itemIdx, e.target.value as PortionUnit)}
                                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                                >
                                  {foodUnits.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col justify-end">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Peso Total:</span>
                                <span className="text-xs font-extrabold text-white mt-1">
                                  {item.quantityGrams}g ({item.caloriesPer100g} kcal/100g)
                                </span>
                              </div>
                            </div>

                            {/* Breakdown Nutricional da Porção */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Calorias</span>
                                <span className="text-xs font-extrabold text-emerald-400">{Math.round(item.calories)} kcal</span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Proteínas</span>
                                <span className="text-xs font-extrabold text-rose-400">{Math.round(item.protein * 10) / 10}g</span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Carboidratos</span>
                                <span className="text-xs font-extrabold text-blue-400">{Math.round(item.carbs * 10) / 10}g</span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Gorduras</span>
                                <span className="text-xs font-extrabold text-amber-400">{Math.round(item.fat * 10) / 10}g</span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Fibras</span>
                                <span className="text-xs font-extrabold text-purple-400">{Math.round(item.fiber * 10) / 10}g</span>
                              </div>
                            </div>

                            {/* BOTÃO PARA FINALIZAR O ALIMENTO (RECOLHE OS DETALHES E FICA VERDE) */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => toggleExpandFood(mealIdx, itemIdx)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                              >
                                Recolher Detalhes
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleFoodCompletion(mealIdx, itemIdx)}
                                className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                                  isCompleted
                                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isCompleted ? 'Desmarcar Consumo' : '✓ Marcar como Consumido'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {meal.items.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      Nenhum alimento nesta refeição ainda. Selecione alimentos acima no Montador.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO SECUNDÁRIA: DIAGNÓSTICO NUTRICIONAL (COLAPSÁVEL) */}
      {dietDiagnosis.length > 0 && (
        <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 shadow-xl transition-all">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback();
              setIsDiagnosisOpen(!isDiagnosisOpen);
            }}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Diagnóstico Nutricional & Recomendações em Tempo Real</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {dietDiagnosis.length} análises
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isDiagnosisOpen ? 'Clique para recolher o relatório' : 'Clique para ver avaliação clínica de calorias, proteínas e fibras'}
                </p>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
              {isDiagnosisOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {isDiagnosisOpen && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-150">
              {dietDiagnosis.map((diag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    diag.type === 'STRENGTH'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          diag.type === 'STRENGTH'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {diag.importance}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{diag.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{diag.description}</p>
                  </div>
                  {diag.actionRecommendation && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-amber-300/90 font-medium">
                      👉 {diag.actionRecommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO SECUNDÁRIA: HIDRATAÇÃO (COLAPSÁVEL) */}
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 shadow-xl transition-all">
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback();
            setIsHydrationOpen(!isHydrationOpen);
          }}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💧</span>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Controle de Hidratação Diária</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHydrationOpen ? 'Clique para recolher o registro de água' : 'Clique para registrar copos de água e conferir sua meta hídrica'}
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
            {isHydrationOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {isHydrationOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-150">
            <HydrationTrackerCard />
          </div>
        )}
      </div>

      {/* Rodapé discreto com link para nutricionistas */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Utensils className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Precisa de um plano individualizado com acompanhamento clínico? Conecte-se com nutricionistas credenciados no CRN.
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/professionals?type=NUTRITIONIST')}
          className="text-emerald-400 hover:text-emerald-300 font-bold underline whitespace-nowrap cursor-pointer"
        >
          Consultar Nutricionistas &rarr;
        </button>
      </div>

      {/* Modal de Refeições Favoritas */}
      {isFavoritesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">Suas Refeições Favoritas</h3>
              </div>
              <button
                onClick={() => setIsFavoritesModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {favoriteMeals.length > 0 ? (
                favoriteMeals.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => handleInsertFavoriteMeal(fav)}
                    className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-300">
                        {fav.name}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {fav.items.length} alimentos cadastrados · Salvo em {fav.savedAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteFavoriteMeal(fav.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                        title="Excluir favorita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Usar &rarr;
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Você ainda não possui refeições favoritas salvas.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perguntas de Restrições Alimentares na Mesma Página */}
      <DietaryRestrictionsModal
        isOpen={isRestrictionModalOpen}
        onClose={() => {
          setIsRestrictionModalOpen(false);
          setPendingMealIdxForAdd(null);
        }}
        onSuccess={() => {
          if (pendingMealIdxForAdd !== null) {
            setActiveSearchMealIdx(pendingMealIdxForAdd);
            setSearchQuery('');
            setPendingMealIdxForAdd(null);
          }
        }}
      />

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {inputDialog && (
        <InputDialog
          isOpen={inputDialog.isOpen}
          title={inputDialog.title}
          message={inputDialog.message}
          placeholder={inputDialog.placeholder}
          defaultValue={inputDialog.defaultValue}
          onConfirm={(val) => {
            inputDialog.onConfirm(val);
            setInputDialog(null);
          }}
          onCancel={() => setInputDialog(null)}
        />
      )}
    </div>
  );
};
