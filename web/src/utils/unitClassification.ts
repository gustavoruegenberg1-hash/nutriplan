import { PortionUnit, LocalMeal } from '../pages/DietPlanner';
import { optimizeDietPlan, MacroGoals } from './dietOptimizer';

/**
 * Normaliza variações de nomes e textos de unidades para os identificadores oficiais do sistema.
 */
export function normalizeUnit(rawUnit: string): PortionUnit {
  if (!rawUnit) return 'g';
  const u = rawUnit.toLowerCase().trim();

  // Colheres (sopa, chá, cs, tbsp, etc.)
  if (
    u.includes('colher') ||
    u === 'cs' ||
    u === 'tbsp' ||
    u === 'c.sopa' ||
    u === 'c.cha' ||
    u === 'colheres'
  ) {
    return 'colher';
  }

  // Copos e Xícaras
  if (
    u.includes('copo') ||
    u.includes('xícara') ||
    u.includes('xicara') ||
    u === 'cup' ||
    u === 'copos' ||
    u === 'xícaras'
  ) {
    return 'copo';
  }

  // Fatias
  if (u.includes('fatia') || u.includes('slice')) {
    return 'fatia';
  }

  // Scoops e Dosadores
  if (u.includes('scoop') || u.includes('dosador')) {
    return 'scoop';
  }

  // Latas
  if (u.includes('lata') || u.includes('can')) {
    return 'lata';
  }

  // Filés / Porções de filé
  if (u.includes('file') || u.includes('filé')) {
    return 'file';
  }

  // Unidades práticas (ovos, frutas, unidades, sachês, cápsulas, pães)
  if (
    u === 'un' ||
    u.includes('unidade') ||
    u.includes('ovo') ||
    u.includes('fruta') ||
    u.includes('sachê') ||
    u.includes('sache') ||
    u.includes('cápsula') ||
    u.includes('capsula') ||
    u.includes('pão') ||
    u.includes('pao')
  ) {
    return 'un';
  }

  // Medidas contínuas de volume
  if (u === 'ml' || u.includes('mililitro') || u.includes('litro') || u === 'l') {
    return 'ml';
  }

  // Medidas contínuas de massa
  if (u === 'g' || u.includes('grama') || u.includes('quilo') || u === 'kg') {
    return 'g';
  }

  return 'g';
}

/**
 * Determina se a unidade de medida representa uma unidade prática e indivisível
 * que NÃO deve aceitar valores fracionados em gerações automáticas de dieta.
 */
export function isWholeUnit(unit: string, _foodName = ''): boolean {
  const norm = normalizeUnit(unit);
  const wholeUnits: PortionUnit[] = ['un', 'colher', 'copo', 'fatia', 'scoop', 'lata', 'file'];
  return wholeUnits.includes(norm);
}

/**
 * Arredonda uma quantidade para um valor prático e executável:
 * - Unidades inteiras: sempre números inteiros >= 1 (1, 2, 3, 4...)
 * - Unidades contínuas (g, ml): múltiplos práticos de 5g ou 10g (ex: 150g, 180g, 220g)
 */
export function roundToPracticalQuantity(value: number, unit: PortionUnit, foodName = ''): number {
  const norm = normalizeUnit(unit);

  if (isWholeUnit(norm, foodName)) {
    // Unidades inteiras: mínimo 1, arredondamento padrão para inteiro
    return Math.max(1, Math.round(value));
  }

  // Medidas contínuas (g, ml): arredonda de 5 em 5 unidades para praticidade de pesagem
  if (norm === 'g' || norm === 'ml') {
    if (value <= 0) return 0;
    const rounded = Math.round(value / 5) * 5;
    return Math.max(5, rounded);
  }

  return Math.round(value * 10) / 10;
}

export interface CalibrationItemInput {
  foodName: string;
  baseQuantity: number;
  unit: PortionUnit;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export interface CalibrationMealInput {
  name: string;
  items: CalibrationItemInput[];
}

/**
 * Calibra cientificamente um cardápio de refeições para atingir a meta calórica e de macronutrientes do usuário
 * com regras rigorosas de unidades práticas inteiras e preservação de proporção de carboidratos, proteínas e gorduras.
 */
export function calibrateDietMeals(
  rawMeals: CalibrationMealInput[],
  targetCalories: number,
  basePresetCalories: number,
  goals?: Partial<MacroGoals>
): LocalMeal[] {
  const userWeight = goals?.userWeight || 75;
  const protein = goals?.protein || Math.round(userWeight * 2.0);
  const fat = goals?.fat || Math.round(userWeight * 0.8);
  const carbs = goals?.carbs || Math.max(0, Math.round((targetCalories - (protein * 4 + fat * 9)) / 4));

  return optimizeDietPlan(rawMeals, {
    calories: targetCalories,
    protein,
    carbs,
    fat,
    userWeight,
    goal: goals?.goal || 'maintain',
  });
}
