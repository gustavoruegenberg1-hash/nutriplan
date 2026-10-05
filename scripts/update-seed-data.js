const fs = require('fs');
const path = require('path');

const seedPath = path.resolve(__dirname, '..', 'web', 'src', 'data', 'seedData.ts');
const content = fs.readFileSync(seedPath, 'utf8');
const exerciseMarker = 'export const SEED_EXERCISES: Exercise[] = [';
const idx = content.indexOf(exerciseMarker);

if (idx === -1) {
  console.error('Marker SEED_EXERCISES not found!');
  process.exit(1);
}

const exercisePart = content.slice(idx);
const header = `import { FoodItem, Exercise } from '../types';
import ALL_TACO_FOODS from './tacoFoods.json';

export const SEED_FOODS: FoodItem[] = (ALL_TACO_FOODS as any[]).map((f: any) => ({
  id: f.id,
  name: f.name,
  source: f.source || 'TACO',
  category: f.category,
  caloriesPer100g: Number(f.caloriesPer100g) || 0,
  proteinPer100g: Number(f.proteinPer100g) || 0,
  carbsPer100g: Number(f.carbsPer100g) || 0,
  fatPer100g: Number(f.fatPer100g) || 0,
  fiberPer100g: Number(f.fiberPer100g) || 0,
  micronutrients: f.micronutrients || null,
  legacyId: f.legacyId,
  isVerified: f.isVerified ?? true,
}));

`;

fs.writeFileSync(seedPath, header + exercisePart, 'utf8');
console.log('seedData.ts successfully updated with tacoFoods.json and SEED_EXERCISES preserved!');
