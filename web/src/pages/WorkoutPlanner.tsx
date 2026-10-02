import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Exercise, DayOfWeek } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputDialog } from '../components/InputDialog';
import { condicoesELimitacoesPreenchidas } from '../utils/formValidation';
import { WorkoutLimitationsModal } from '../components/workout/WorkoutLimitationsModal';
import {
  Dumbbell,
  Plus,
  Trash2,
  Download,
  Check,
  Search,
  AlertCircle,
  Activity,
  X,
  CheckCircle2,
  RefreshCw,
  Filter,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { verificarCompatibilidade } from '../utils/workoutSafety';
import { gamificationService } from '../services/gamificationService';
import { idleGameService } from '../services/idleGameService';
import { exerciseService } from '../services/exerciseService';
import { triggerHapticFeedback } from '../utils/mobile';

export type TrainingTechnique =
  | 'NORMAL'
  | 'DROP_SET'
  | 'REST_PAUSE'
  | 'BI_SET'
  | 'WARM_UP'
  | 'FEEDER'
  | 'CLUSTER';

export const techniqueDetails: Record<
  TrainingTechnique,
  { label: string; short: string; color: string; bg: string; border: string; desc: string }
> = {
  NORMAL: {
    label: 'Normal (Padrão)',
    short: 'Padrão',
    color: 'text-slate-300',
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    desc: 'Série tradicional com cadência controlada até a meta de repetições ou falha.',
  },
  DROP_SET: {
    label: 'Drop-Set (-25% carga)',
    short: 'Drop-Set',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    desc: 'Chega até a falha concêntrica, reduz 20-30% do peso imediatamente e continua sem descanso.',
  },
  REST_PAUSE: {
    label: 'Rest-Pause (Pausa 15s)',
    short: 'Rest-Pause',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    desc: 'Chega até a falha, descansa por 15 segundos respirando fundo e faz mais repetições até nova falha.',
  },
  BI_SET: {
    label: 'Bi-Set (Super-Set)',
    short: 'Bi-Set',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    desc: 'Execução de dois exercícios combinados consecutivamente sem intervalo de descanso.',
  },
  WARM_UP: {
    label: 'Aquecimento (Warm-Up)',
    short: 'Aquec.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Série leve com 40-50% da carga para lubrificação articular e aumento de temperatura local.',
  },
  FEEDER: {
    label: 'Feeder Set (Preparatória)',
    short: 'Feeder',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    desc: 'Série preparatória de 3 a 5 reps com 70-80% da carga para calibrar o sistema nervoso.',
  },
  CLUSTER: {
    label: 'Cluster Set (Micro-pausas)',
    short: 'Cluster',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    desc: 'Série fragmentada em mini-blocos de repetições intercalados por 15-20 segundos de descanso.',
  },
};

export const muscleGroupLabelsPtBr: Record<string, string> = {
  CHEST: 'Peitoral',
  BACK: 'Dorsal / Costas',
  SHOULDERS: 'Deltoides / Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  FOREARMS: 'Antebraço',
  QUADRICEPS: 'Quadríceps',
  HAMSTRINGS: 'Posterior de Coxa',
  GLUTES: 'Glúteos',
  CALVES: 'Panturrilhas',
  ABS: 'Abdômen & Core',
  CARDIO: 'Cardiorrespiratório',
  FULL_BODY: 'Corpo Inteiro / Composto',
};

export interface LocalWorkoutSet {
  setNumber: number;
  reps: number | string;
  weightKg: number | string;
  restSeconds: number | string;
  rpe?: number | string;
  technique?: TrainingTechnique;
}

export interface LocalExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  equipment?: string | null;
  notes?: string;
  sets: LocalWorkoutSet[];
}

export interface LocalWorkoutDay {
  name: string;
  dayOfWeek: DayOfWeek;
  exercises: LocalExerciseEntry[];
}

export interface TrainingPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  targetGender: 'MALE' | 'FEMALE' | 'UNISEX';
  days: { name: string; dayOfWeek: DayOfWeek; presetExercises?: string[] }[];
}

export const trainingPresets: TrainingPreset[] = [
  {
    id: 'ppl_advanced',
    title: 'Push / Pull / Legs (PPL Hipertrofia Masculina Padrão Ouro)',
    badge: 'Hipertrofia Masculina 3x a 6x',
    description: 'Divisão clássica e biomecanicamente balanceada. Separação por padrões de movimento (Empurrar, Puxar, Pernas).',
    targetGender: 'MALE',
    days: [
      {
        name: 'Treino A - Push (Peito, Ombros e Tríceps)',
        dayOfWeek: 'MONDAY',
        presetExercises: [
          'Supino reto na máquina articulada (Chest Press)',
          'Supino inclinado com halteres',
          'Crucifixo no voador / Pec Deck',
          'Desenvolvimento de ombros na máquina articulada (Shoulder Press Machine)',
          'Elevação lateral unilateral na polia baixa (cabo)',
          'Tríceps pulley no cabo com corda',
          'Tríceps francês unilateral na polia / cabo',
        ],
      },
      {
        name: 'Treino B - Pull (Costas, Trapézio e Bíceps)',
        dayOfWeek: 'WEDNESDAY',
        presetExercises: [
          'Puxada frontal na máquina articulada (Lat Pulldown Machine)',
          'Remada baixa no cabo com triângulo (Seated Cable Row)',
          'Remada articulada na máquina (pegada neutra/pronada)',
          'Pulldown na polia alta com corda',
          'Crucifixo invertido no voador / Pec Deck inverso',
          'Rosca Scott na máquina articulada (Preacher Curl Machine)',
          'Rosca martelo com halteres (Bíceps e Braquial)',
        ],
      },
      {
        name: 'Treino C - Legs (Quadríceps, Posterior, Glúteos e Panturrilhas)',
        dayOfWeek: 'FRIDAY',
        presetExercises: [
          'Agachamento no Hack Machine articulado (Hack Squat)',
          'Leg Press 45° articulado tradicional',
          'Cadeira extensora (Leg Extension Machine)',
          'Mesa flexora deitada (Lying Leg Curl)',
          'Stiff com halteres no banco / solo',
          'Cadeira abdutora com tronco inclinado / ereto',
          'Panturrilha na máquina sentado (Gêmeos sentado / Sóleo)',
        ],
      },
    ],
  },
  {
    id: 'upper_lower_freq',
    title: 'Upper / Lower (Superiores & Inferiores 4x - Alta Frequência)',
    badge: 'Unissex · Força & Densidade 4x',
    description: 'Ideal para hipertrofia com estímulo 2x na semana por grupo muscular, otimizando a síntese proteica.',
    targetGender: 'UNISEX',
    days: [
      {
        name: 'Treino A1 - Superior (Foco Peito e Costas)',
        dayOfWeek: 'MONDAY',
        presetExercises: [
          'Supino reto com barra',
          'Puxada frontal no pulley (pegada aberta pronada)',
          'Supino inclinado na máquina articulada (Incline Chest Press)',
          'Remada cavalinho articulada com apoio no peito (T-Bar Row)',
          'Elevação lateral na máquina articulada',
          'Tríceps pulley no cabo com barra reta / barra V',
          'Rosca direta com barra W',
        ],
      },
      {
        name: 'Treino B1 - Inferior (Foco Quadríceps e Glúteos)',
        dayOfWeek: 'TUESDAY',
        presetExercises: [
          'Agachamento livre com barra nas costas (Back Squat)',
          'Leg Press 45° articulado tradicional',
          'Cadeira extensora (Leg Extension Machine)',
          'Cadeira flexora sentada (Seated Leg Curl)',
          'Elevação pélvica na máquina articulada (Hip Thrust Machine)',
          'Panturrilha na máquina em pé (Standing Calf Raise)',
        ],
      },
      {
        name: 'Treino A2 - Superior (Foco Ombros e Braços)',
        dayOfWeek: 'THURSDAY',
        presetExercises: [
          'Desenvolvimento de ombros na máquina articulada (Shoulder Press Machine)',
          'Puxada frontal no pulley (triângulo / pegada neutra)',
          'Crucifixo no voador / Pec Deck',
          'Elevação lateral unilateral na polia baixa (cabo)',
          'Crucifixo invertido na polia alta (Face Pull com corda)',
          'Tríceps francês bilateral na polia com corda',
          'Rosca Scott na máquina articulada (Preacher Curl Machine)',
        ],
      },
      {
        name: 'Treino B2 - Inferior (Foco Posterior e Panturrilhas)',
        dayOfWeek: 'FRIDAY',
        presetExercises: [
          'Levantamento terra romeno (RDL com barra)',
          'Mesa flexora deitada (Lying Leg Curl)',
          'Agachamento no Hack Machine articulado (Hack Squat)',
          'Avanço / Passada caminhando com halteres',
          'Cadeira abdutora com tronco inclinado / ereto',
          'Panturrilha no Leg Press 45°',
        ],
      },
    ],
  },
  {
    id: 'abcd_hypertrophy',
    title: 'Divisão ABCD Masculina (Alta Intensidade 4x)',
    badge: 'Hipertrofia Masculina 4x',
    description: 'Divisão balanceada com ótimo tempo de recuperação e foco no desenvolvimento muscular superior e de membros inferiores.',
    targetGender: 'MALE',
    days: [
      {
        name: 'Treino A - Peitoral e Tríceps',
        dayOfWeek: 'MONDAY',
        presetExercises: [
          'Supino reto na máquina articulada (Chest Press)',
          'Supino inclinado com halteres',
          'Crucifixo no voador / Pec Deck',
          'Crossover na polia alta (foco inferior)',
          'Tríceps pulley no cabo com corda',
          'Tríceps testa com barra W no banco reto',
        ],
      },
      {
        name: 'Treino B - Costas e Bíceps',
        dayOfWeek: 'TUESDAY',
        presetExercises: [
          'Puxada frontal no pulley (pegada aberta pronada)',
          'Remada baixa no cabo com triângulo (Seated Cable Row)',
          'Remada articulada na máquina (pegada neutra/pronada)',
          'Pulldown na polia alta com corda',
          'Rosca direta com barra W',
          'Rosca martelo com halteres (Bíceps e Braquial)',
        ],
      },
      {
        name: 'Treino C - Pernas Completo (Quadríceps e Posterior)',
        dayOfWeek: 'THURSDAY',
        presetExercises: [
          'Agachamento no Hack Machine articulado (Hack Squat)',
          'Leg Press 45° articulado tradicional',
          'Cadeira extensora (Leg Extension Machine)',
          'Mesa flexora deitada (Lying Leg Curl)',
          'Stiff com halteres no banco / solo',
          'Panturrilha na máquina sentado (Gêmeos sentado / Sóleo)',
        ],
      },
      {
        name: 'Treino D - Deltoides, Trapézio e Abdômen',
        dayOfWeek: 'FRIDAY',
        presetExercises: [
          'Desenvolvimento de ombros na máquina articulada (Shoulder Press Machine)',
          'Elevação lateral unilateral na polia baixa (cabo)',
          'Crucifixo invertido no voador / Pec Deck inverso',
          'Encolhimento com halteres (Trapézio)',
          'Abdominal na máquina articulada (Abdominal Machine)',
          'Prancha frontal isométrica',
        ],
      },
    ],
  },
  {
    id: 'glutes_legs_women',
    title: 'Foco Glúteos, Coxas & Estética Feminina (4x)',
    badge: 'Feminino · Glúteos & Coxas 4x',
    description: 'Enfatiza glúteos e membros inferiores com volume estratégico para superiores e tônus corporal feminino.',
    targetGender: 'FEMALE',
    days: [
      {
        name: 'Treino A - Foco Quadríceps e Glúteos',
        dayOfWeek: 'MONDAY',
        presetExercises: [
          'Elevação pélvica na máquina articulada (Hip Thrust Machine)',
          'Agachamento no Hack Machine articulado (Hack Squat)',
          'Leg Press 45° articulado tradicional',
          'Cadeira extensora (Leg Extension Machine)',
          'Cadeira abdutora com tronco inclinado / ereto',
          'Panturrilha na máquina em pé (Standing Calf Raise)',
        ],
      },
      {
        name: 'Treino B - Superiores Completo & Core',
        dayOfWeek: 'TUESDAY',
        presetExercises: [
          'Puxada frontal no pulley (pegada aberta pronada)',
          'Remada baixa no cabo com triângulo (Seated Cable Row)',
          'Desenvolvimento de ombros com halteres',
          'Elevação lateral unilateral na polia baixa (cabo)',
          'Tríceps pulley no cabo com corda',
          'Abdominal na máquina articulada (Abdominal Machine)',
        ],
      },
      {
        name: 'Treino C - Foco Posterior de Coxa e Glúteos',
        dayOfWeek: 'THURSDAY',
        presetExercises: [
          'Elevação pélvica com barra no banco',
          'Stiff com halteres no banco / solo',
          'Mesa flexora deitada (Lying Leg Curl)',
          'Cadeira flexora sentada (Seated Leg Curl)',
          'Glúteo no cabo com caneleira (Glute Kickback)',
          'Cadeira abdutora com tronco inclinado / ereto',
        ],
      },
      {
        name: 'Treino D - Deltoides, Costas & Abdômen',
        dayOfWeek: 'FRIDAY',
        presetExercises: [
          'Puxada frontal na máquina articulada (Lat Pulldown Machine)',
          'Remada articulada na máquina (pegada neutra/pronada)',
          'Elevação lateral na máquina articulada',
          'Crucifixo invertido no voador / Pec Deck inverso',
          'Prancha frontal isométrica',
          'Abdominal infra no solo / paralela',
        ],
      },
    ],
  },
  {
    id: 'abc_women_tone',
    title: 'ABC Feminino - Definição & Glúteos (3x)',
    badge: 'Feminino · Glúteos & Tônus 3x',
    description: 'Rotina de 3 dias por semana ideal para máxima densidade em membros inferiores e definição corporal equilibrada.',
    targetGender: 'FEMALE',
    days: [
      {
        name: 'Treino A - Glúteos & Posterior de Coxa',
        dayOfWeek: 'MONDAY',
        presetExercises: [
          'Elevação pélvica na máquina articulada (Hip Thrust Machine)',
          'Stiff com halteres no banco / solo',
          'Mesa flexora deitada (Lying Leg Curl)',
          'Glúteo no cabo com caneleira (Glute Kickback)',
          'Cadeira abdutora com tronco inclinado / ereto',
          'Panturrilha no Leg Press 45°',
        ],
      },
      {
        name: 'Treino B - Superiores & Abdômen',
        dayOfWeek: 'WEDNESDAY',
        presetExercises: [
          'Puxada frontal no pulley (pegada aberta pronada)',
          'Remada baixa no cabo com triângulo (Seated Cable Row)',
          'Supino inclinado com halteres',
          'Desenvolvimento de ombros na máquina articulada (Shoulder Press Machine)',
          'Elevação lateral unilateral na polia baixa (cabo)',
          'Tríceps pulley no cabo com corda',
          'Abdominal na máquina articulada (Abdominal Machine)',
        ],
      },
      {
        name: 'Treino C - Quadríceps & Glúteos',
        dayOfWeek: 'FRIDAY',
        presetExercises: [
          'Agachamento no Hack Machine articulado (Hack Squat)',
          'Leg Press 45° articulado tradicional',
          'Cadeira extensora (Leg Extension Machine)',
          'Avanço / Passada caminhando com halteres',
          'Elevação pélvica na máquina articulada (Hip Thrust Machine)',
          'Panturrilha na máquina sentado (Gêmeos sentado / Sóleo)',
        ],
      },
    ],
  },
  {
    id: 'full_body_3x',
    title: 'Full Body 3x (Força & Eficiência Metabólica)',
    badge: 'Unissex · Geral 3x por semana',
    description: '3 dias com o corpo inteiro, excelente para ganho de força e rotinas dinâmicas.',
    targetGender: 'UNISEX',
    days: [
      { name: 'Treino A - Full Body (Base Pesada)', dayOfWeek: 'MONDAY' },
      { name: 'Treino B - Full Body (Hipertrofia & Máquinas)', dayOfWeek: 'WEDNESDAY' },
      { name: 'Treino C - Full Body (Tensão Contínua & Cabos)', dayOfWeek: 'FRIDAY' },
    ],
  },
];

const daysOfWeekOptions: { id: DayOfWeek; label: string }[] = [
  { id: 'MONDAY', label: 'Segunda-feira' },
  { id: 'TUESDAY', label: 'Terça-feira' },
  { id: 'WEDNESDAY', label: 'Quarta-feira' },
  { id: 'THURSDAY', label: 'Quinta-feira' },
  { id: 'FRIDAY', label: 'Sexta-feira' },
  { id: 'SATURDAY', label: 'Sábado' },
  { id: 'SUNDAY', label: 'Domingo' },
];

const WORKOUT_STORAGE_KEY = 'nutriplan_saved_workout_days';
const WORKOUT_STORAGE_NAME_KEY = 'nutriplan_saved_workout_name';

/**
 * Analisador Estrito de Grupos Musculares do Treino Ativo:
 * Retorna ESTRITAMENTE os grupos musculares que compõem o dia selecionado.
 */
export function getStrictMuscleGroupsForWorkout(dayName: string): string[] {
  const lower = dayName.toLowerCase();
  const detected: string[] = [];

  const isFullBody = lower.includes('full body') || lower.includes('corpo inteiro') || lower.includes('geral');
  if (isFullBody) {
    return ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS'];
  }

  // 1. Peitoral
  if (lower.includes('peito') || lower.includes('peitoral')) {
    if (!detected.includes('CHEST')) detected.push('CHEST');
  }

  // 2. Costas / Dorsais / Trapézio
  if (lower.includes('costas') || lower.includes('dorsal') || lower.includes('dorsais') || lower.includes('puxar')) {
    if (!detected.includes('BACK')) detected.push('BACK');
  }

  // 3. Deltoides / Ombros
  if (lower.includes('ombro') || lower.includes('ombros') || lower.includes('deltoide') || lower.includes('deltoides')) {
    if (!detected.includes('SHOULDERS')) detected.push('SHOULDERS');
  }

  // 4. Trapézio explícito
  if (lower.includes('trapézio') || lower.includes('trapezio')) {
    if (!detected.includes('BACK')) detected.push('BACK');
    if (!detected.includes('SHOULDERS')) detected.push('SHOULDERS');
  }

  // 5. Braços / Bíceps / Tríceps / Antebraço
  if (lower.includes('braço') || lower.includes('braços') || lower.includes('braco') || lower.includes('bracos')) {
    if (!detected.includes('BICEPS')) detected.push('BICEPS');
    if (!detected.includes('TRICEPS')) detected.push('TRICEPS');
    if (!detected.includes('FOREARMS')) detected.push('FOREARMS');
  }
  if (lower.includes('bíceps') || lower.includes('biceps')) {
    if (!detected.includes('BICEPS')) detected.push('BICEPS');
    if (!detected.includes('FOREARMS')) detected.push('FOREARMS');
  }
  if (lower.includes('tríceps') || lower.includes('triceps')) {
    if (!detected.includes('TRICEPS')) detected.push('TRICEPS');
  }

  // 6. Padrões Push / Pull / Legs
  if (lower.includes('push') || lower.includes('empurrar')) {
    if (!detected.includes('CHEST')) detected.push('CHEST');
    if (!detected.includes('SHOULDERS')) detected.push('SHOULDERS');
    if (!detected.includes('TRICEPS')) detected.push('TRICEPS');
  }
  if (lower.includes('pull')) {
    if (!detected.includes('BACK')) detected.push('BACK');
    if (!detected.includes('BICEPS')) detected.push('BICEPS');
    if (!detected.includes('FOREARMS')) detected.push('FOREARMS');
    if (!detected.includes('SHOULDERS')) detected.push('SHOULDERS'); // Deltoide posterior
  }

  // 7. Pernas / Membros Inferiores / Quadríceps / Posterior / Glúteos / Panturrilhas
  if (
    lower.includes('perna') ||
    lower.includes('pernas') ||
    lower.includes('legs') ||
    lower.includes('inferior') ||
    lower.includes('inferiores')
  ) {
    if (!detected.includes('QUADRICEPS')) detected.push('QUADRICEPS');
    if (!detected.includes('HAMSTRINGS')) detected.push('HAMSTRINGS');
    if (!detected.includes('GLUTES')) detected.push('GLUTES');
    if (!detected.includes('CALVES')) detected.push('CALVES');
  } else {
    if (lower.includes('quadríceps') || lower.includes('quadriceps')) {
      if (!detected.includes('QUADRICEPS')) detected.push('QUADRICEPS');
    }
    if (lower.includes('posterior') || lower.includes('isquiotibiais')) {
      if (!detected.includes('HAMSTRINGS')) detected.push('HAMSTRINGS');
    }
    if (lower.includes('glúteo') || lower.includes('gluteos') || lower.includes('gluteo') || lower.includes('glúteos')) {
      if (!detected.includes('GLUTES')) detected.push('GLUTES');
    }
    if (lower.includes('panturrilha') || lower.includes('panturrilhas')) {
      if (!detected.includes('CALVES')) detected.push('CALVES');
    }
  }

  // 8. Superiores Geral
  if (lower.includes('superior') || lower.includes('superiores') || lower.includes('upper')) {
    if (!detected.includes('CHEST')) detected.push('CHEST');
    if (!detected.includes('BACK')) detected.push('BACK');
    if (!detected.includes('SHOULDERS')) detected.push('SHOULDERS');
    if (!detected.includes('BICEPS')) detected.push('BICEPS');
    if (!detected.includes('TRICEPS')) detected.push('TRICEPS');
  }

  // 9. Abdômen & Core
  if (lower.includes('abdômen') || lower.includes('abdomen') || lower.includes('core') || lower.includes('abdominal')) {
    if (!detected.includes('ABS')) detected.push('ABS');
  }

  return detected;
}

/**
 * Filtra dinamicamente as tags de grupos musculares pertinentes ao treino ativo
 */
export function getRelevantMusclesForWorkout(dayName: string): { id: string; label: string }[] {
  const strictGroups = getStrictMuscleGroupsForWorkout(dayName);

  if (strictGroups.length > 0) {
    return [
      { id: 'ALL', label: 'Todos do Treino' },
      ...strictGroups.map((k) => ({ id: k, label: muscleGroupLabelsPtBr[k] || k })),
    ];
  }

  return [
    { id: 'ALL', label: 'Todos os Músculos' },
    { id: 'CHEST', label: 'Peitoral' },
    { id: 'BACK', label: 'Dorsal / Costas' },
    { id: 'SHOULDERS', label: 'Deltoides / Ombros' },
    { id: 'BICEPS', label: 'Bíceps' },
    { id: 'TRICEPS', label: 'Tríceps' },
    { id: 'QUADRICEPS', label: 'Quadríceps' },
    { id: 'HAMSTRINGS', label: 'Posterior de Coxa' },
    { id: 'GLUTES', label: 'Glúteos' },
    { id: 'CALVES', label: 'Panturrilhas' },
    { id: 'ABS', label: 'Abdômen & Core' },
  ];
}

/**
 * Assistente Inteligente de Treino MULTI-DIAS com Restrição Estrita:
 * Sugere exercícios que OBRIGATORIAMENTE fazem parte da divisão do treino do dia ativo.
 */
export function getSmartExerciseSuggestions(
  currentDayIdx: number,
  allDays: LocalWorkoutDay[],
  allExercises: Exercise[]
): { reason: string; exercise: Exercise }[] {
  if (allDays.length === 0 || allExercises.length === 0) return [];

  const currentDay = allDays[currentDayIdx];
  if (!currentDay) return [];

  const currentDayName = currentDay.name;
  const allowedGroups = new Set(getStrictMuscleGroupsForWorkout(currentDayName));
  const currentSessionExercises = currentDay.exercises || [];

  // Mapeia todos os exercícios cadastrados na rotina inteira
  const allRoutineExerciseNames = new Set<string>();
  allDays.forEach((d) => {
    d.exercises.forEach((e) => allRoutineExerciseNames.add(e.exerciseName.toLowerCase()));
  });

  const presentGroupsInCurrentSession = new Set(
    currentSessionExercises.map((e) => e.muscleGroup)
  );

  const suggestions: { reason: string; exercise: Exercise }[] = [];

  // Helper de validação: só adiciona se pertencer estritamente aos grupos do dia
  const addSafeSuggestion = (reason: string, ex: Exercise | undefined) => {
    if (!ex) return;
    if (allowedGroups.size > 0 && !allowedGroups.has(ex.muscleGroup)) return; // Trava estrita!
    if (allRoutineExerciseNames.has(ex.name.toLowerCase())) return;
    suggestions.push({ reason, exercise: ex });
  };

  // 1. ANÁLISE DE MEMBROS INFERIORES
  if (allowedGroups.has('QUADRICEPS') || allowedGroups.has('HAMSTRINGS') || allowedGroups.has('GLUTES')) {
    // Se o treino contempla posterior e ainda não tem
    if (allowedGroups.has('HAMSTRINGS') && !presentGroupsInCurrentSession.has('HAMSTRINGS')) {
      const hamEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'HAMSTRINGS' &&
          (e.name.toLowerCase().includes('mesa flexora') ||
            e.name.toLowerCase().includes('cadeira flexora') ||
            e.name.toLowerCase().includes('stiff')) &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Equilíbrio articular joelho/quadril: adicione um exercício de Posterior de Coxa', hamEx);
    }

    // Se o treino contempla glúteos e ainda não tem
    if (allowedGroups.has('GLUTES') && !presentGroupsInCurrentSession.has('GLUTES')) {
      const gluteEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'GLUTES' &&
          (e.name.toLowerCase().includes('elevação pélvica') || e.name.toLowerCase().includes('glúteo no cabo')) &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Ativação primária de glúteo máximo: adicione Elevação Pélvica', gluteEx);
    }

    // Se o treino contempla panturrilhas e ainda não tem
    if (allowedGroups.has('CALVES') && !presentGroupsInCurrentSession.has('CALVES')) {
      const calfEx = allExercises.find(
        (e) => e.muscleGroup === 'CALVES' && !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Finalização da cadeia inferior: adicione Panturrilhas', calfEx);
    }

    // Se tem quadríceps mas falta isolamento
    if (allowedGroups.has('QUADRICEPS') && !currentSessionExercises.some((e) => e.exerciseName.toLowerCase().includes('extensora'))) {
      const extEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'QUADRICEPS' &&
          e.name.toLowerCase().includes('extensora') &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Isolamento de reto femoral e pico de contração: adicione Cadeira Extensora', extEx);
    }
  }

  // 2. ANÁLISE DE PEITORAL
  if (allowedGroups.has('CHEST')) {
    const hasInclineChest = currentSessionExercises.some((e) => e.exerciseName.toLowerCase().includes('inclinado'));
    if (!hasInclineChest) {
      const incChestEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'CHEST' &&
          e.name.toLowerCase().includes('inclinado') &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Desenvolvimento do feixe clavicular (porção superior do peito): adicione Supino Inclinado', incChestEx);
    }

    if (allowedGroups.has('TRICEPS') && !presentGroupsInCurrentSession.has('TRICEPS')) {
      const triEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'TRICEPS' &&
          (e.name.toLowerCase().includes('corda') || e.name.toLowerCase().includes('francês')) &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Sinergista do padrão de empurrar: finalize com Tríceps isolado', triEx);
    }
  }

  // 3. ANÁLISE DE COSTAS & BÍCEPS
  if (allowedGroups.has('BACK')) {
    if (allowedGroups.has('BICEPS') && !presentGroupsInCurrentSession.has('BICEPS')) {
      const bicEx = allExercises.find(
        (e) =>
          e.muscleGroup === 'BICEPS' &&
          (e.name.toLowerCase().includes('scott') || e.name.toLowerCase().includes('martelo') || e.name.toLowerCase().includes('rosca')) &&
          !allRoutineExerciseNames.has(e.name.toLowerCase())
      );
      addSafeSuggestion('Sinergista do padrão de puxar: complemente com Bíceps', bicEx);
    }
  }

  // 4. ANÁLISE DE OMBROS / DELTOIDES
  if (allowedGroups.has('SHOULDERS') && !presentGroupsInCurrentSession.has('SHOULDERS')) {
    const shEx = allExercises.find(
      (e) =>
        e.muscleGroup === 'SHOULDERS' &&
        (e.name.toLowerCase().includes('elevação lateral') || e.name.toLowerCase().includes('desenvolvimento')) &&
        !allRoutineExerciseNames.has(e.name.toLowerCase())
    );
    addSafeSuggestion('Largura de ombro e aspecto em V: adicione Elevação Lateral', shEx);
  }

  // 5. ANÁLISE DE ABDÔMEN & CORE
  if (allowedGroups.has('ABS') && !presentGroupsInCurrentSession.has('ABS')) {
    const absEx = allExercises.find(
      (e) => e.muscleGroup === 'ABS' && !allRoutineExerciseNames.has(e.name.toLowerCase())
    );
    addSafeSuggestion('Estabilidade central de tronco: adicione Abdômen & Core', absEx);
  }

  return suggestions.slice(0, 3);
}

export const WorkoutPlanner: React.FC = () => {
  const { user } = useAuth();
  
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

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showAllMusclesOverride, setShowAllMusclesOverride] = useState(false);

  // Filtra os presets disponíveis com base no sexo do usuário
  const userGender = (user?.gender || '').toLowerCase();
  const availablePresets = useMemo(() => {
    if (userGender === 'male' || userGender === 'masculino') {
      return trainingPresets.filter((p) => p.targetGender === 'MALE' || p.targetGender === 'UNISEX');
    }
    if (userGender === 'female' || userGender === 'feminino') {
      return trainingPresets.filter((p) => p.targetGender === 'FEMALE' || p.targetGender === 'UNISEX');
    }
    return trainingPresets;
  }, [userGender]);

  const defaultPreset = availablePresets[0] || trainingPresets[0];

  const [routineName, setRoutineName] = useState(() => {
    return localStorage.getItem(WORKOUT_STORAGE_NAME_KEY) || defaultPreset.title;
  });

  const [workoutDays, setWorkoutDays] = useState<LocalWorkoutDay[]>(() => {
    try {
      const saved = localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPreset.days.map((d) => ({ ...d, exercises: [] }));
  });

  const navigate = useNavigate();
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLimitationModalOpen, setIsLimitationModalOpen] = useState<boolean>(false);
  const [pendingExerciseForAdd, setPendingExerciseForAdd] = useState<Exercise | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentlyAddedExerciseId, setRecentlyAddedExerciseId] = useState<string | null>(null);
  const [recentlyAddedMsg, setRecentlyAddedMsg] = useState<string | null>(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState<boolean>(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState<boolean>(true);
  const [exerciseLoadError, setExerciseLoadError] = useState<string | null>(null);

  const checkCanAddExercise = (pendingEx?: Exercise): boolean => {
    if (!condicoesELimitacoesPreenchidas(user)) {
      if (pendingEx) {
        setPendingExerciseForAdd(pendingEx);
      }
      setIsLimitationModalOpen(true);
      return false;
    }
    return true;
  };

  const isInitialSyncDone = useRef(false);

  // Músculos relevantes contextuais baseados no nome do treino atual
  const currentDayName = workoutDays[activeDayIdx]?.name || '';
  const strictAllowedGroups = useMemo(() => {
    return getStrictMuscleGroupsForWorkout(currentDayName);
  }, [currentDayName]);

  const relevantMuscleGroups = useMemo(() => {
    if (showAllMusclesOverride) {
      return [
        { id: 'ALL', label: 'Todos os Músculos' },
        { id: 'CHEST', label: 'Peitoral' },
        { id: 'BACK', label: 'Dorsal / Costas' },
        { id: 'SHOULDERS', label: 'Deltoides / Ombros' },
        { id: 'BICEPS', label: 'Bíceps' },
        { id: 'TRICEPS', label: 'Tríceps' },
        { id: 'FOREARMS', label: 'Antebraço' },
        { id: 'QUADRICEPS', label: 'Quadríceps' },
        { id: 'HAMSTRINGS', label: 'Posterior de Coxa' },
        { id: 'GLUTES', label: 'Glúteos' },
        { id: 'CALVES', label: 'Panturrilhas' },
        { id: 'ABS', label: 'Abdômen & Core' },
        { id: 'CARDIO', label: 'Cardiorrespiratório' },
      ];
    }
    return getRelevantMusclesForWorkout(currentDayName);
  }, [currentDayName, showAllMusclesOverride]);

  // Carrega catálogo de exercícios via exerciseService resiliente
  const fetchExercises = useCallback(async () => {
    setIsLoadingExercises(true);
    setExerciseLoadError(null);
    try {
      const data = await exerciseService.getExercises();
      setExercises(data || []);
    } catch (err) {
      console.error('Falha ao carregar exercícios', err);
      setExerciseLoadError('Não foi possível carregar o catálogo de exercícios.');
    } finally {
      setIsLoadingExercises(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Sugestões inteligentes multi-dias que consideram a rotina inteira
  const smartSuggestions = useMemo(() => {
    return getSmartExerciseSuggestions(activeDayIdx, workoutDays, exercises);
  }, [activeDayIdx, workoutDays, exercises]);

  // Carrega rotinas ativas da API e sincroniza sem perder dados
  const fetchRoutines = async () => {
    try {
      const { data } = await api.get('/routines');
      if (data && data.length > 0) {
        const active = data.find((r: any) => r.isActive) || data[0];
        if (active && active.days && active.days.length > 0) {
          const hasExercisesInApi = active.days.some((d: any) => d.exercises && d.exercises.length > 0);
          if (hasExercisesInApi) {
            setRoutineName(active.name);
            const loadedDays: LocalWorkoutDay[] = active.days.map((d: any) => ({
              name: d.name,
              dayOfWeek: d.dayOfWeek,
              exercises: (d.exercises || []).map((e: any) => ({
                exerciseId: e.exerciseId,
                exerciseName: e.exercise?.name || 'Exercício',
                muscleGroup: e.exercise?.muscleGroup || 'GERAL',
                equipment: e.exercise?.equipment || null,
                notes: e.notes || '',
                sets: (e.sets || []).map((s: any) => ({
                  setNumber: s.setNumber,
                  reps: s.reps,
                  weightKg: s.weightKg,
                  restSeconds: s.restSeconds,
                  rpe: s.rpe || 8,
                  technique: s.technique || 'NORMAL',
                })),
              })),
            }));
            setWorkoutDays(loadedDays);
            localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(loadedDays));
            localStorage.setItem(WORKOUT_STORAGE_NAME_KEY, active.name);
          }
        }
      }
    } catch (err) {
      console.error('Falha ao sincronizar rotinas', err);
    } finally {
      isInitialSyncDone.current = true;
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  // Autosave da rotina
  const triggerWorkoutAutoSave = useCallback(
    async (nameToSave: string, daysToSave: LocalWorkoutDay[]) => {
      setSaveStatus('saving');
      try {
        localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(daysToSave));
        localStorage.setItem(WORKOUT_STORAGE_NAME_KEY, nameToSave);

        const payload = {
          name: nameToSave,
          workoutDays: daysToSave.map((d) => ({
            name: d.name,
            dayOfWeek: d.dayOfWeek,
            exercises: d.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              notes: e.notes || '',
              sets: e.sets.map((s) => ({
                setNumber: s.setNumber,
                reps: Number(s.reps) || 10,
                weightKg: Number(s.weightKg) || 0,
                restSeconds: Number(s.restSeconds) || 60,
                rpe: s.rpe ? Number(s.rpe) : 8,
                technique: s.technique || 'NORMAL',
              })),
            })),
          })),
        };

        await api.post('/routines', payload);
        setSaveStatus('saved');
        gamificationService.recordAction(user?.id || 'guest', 'WORKOUT_DONE');
      } catch (err) {
        console.error('Erro no salvamento automático de treino', err);
        setSaveStatus('error');
      }
    },
    [user]
  );

  useEffect(() => {
    if (!isInitialSyncDone.current) return;

    const timer = setTimeout(() => {
      triggerWorkoutAutoSave(routineName, workoutDays);
    }, 800);

    return () => clearTimeout(timer);
  }, [workoutDays, routineName, triggerWorkoutAutoSave]);

  // Filtragem flexível e resiliente dos exercícios na busca
  const filteredExercises = useMemo(() => {
    const searchLower = exerciseSearch.trim().toLowerCase();
    const targetGroup = selectedMuscle.toUpperCase();
    const allowedUpper = strictAllowedGroups.map((g) => g.toUpperCase());

    return exercises.filter((ex) => {
      const exName = (ex.name || '').toLowerCase();
      const exEquipment = (ex.equipment || '').toLowerCase();
      const exMuscle = (ex.muscleGroup || '').toUpperCase();

      // 1. Filtro de texto de busca (nome e equipamento)
      if (searchLower) {
        const matchesSearch = exName.includes(searchLower) || exEquipment.includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 2. Se o usuário selecionou uma tag específica (ex: CHEST, BICEPS...)
      if (targetGroup !== 'ALL') {
        return exMuscle === targetGroup;
      }

      // 3. Se selecionou 'ALL' (Todos do Treino) e NÃO clicou em "Ver todos os outros grupos"
      if (!showAllMusclesOverride && allowedUpper.length > 0) {
        return allowedUpper.includes(exMuscle);
      }

      return true;
    });
  }, [exercises, exerciseSearch, selectedMuscle, showAllMusclesOverride, strictAllowedGroups]);

  // Aplica preset
  const applyPreset = async (preset: TrainingPreset) => {
    if (!checkCanAddExercise()) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Aplicar Estratégia',
      message: `Carregar a estratégia "${preset.title}"? Isso preencherá os dias e a seleção científica de exercícios.`,
      onConfirm: () => {
        setRoutineName(preset.title);

        const newDays: LocalWorkoutDay[] = preset.days.map((d) => {
          const loadedPresetExs: LocalExerciseEntry[] = [];
          if (d.presetExercises && d.presetExercises.length > 0) {
            d.presetExercises.forEach((exName) => {
              const matched = exercises.find(
                (e) => e.name.toLowerCase() === exName.toLowerCase()
              );
              if (matched) {
                loadedPresetExs.push({
                  exerciseId: matched.id,
                  exerciseName: matched.name,
                  muscleGroup: matched.muscleGroup,
                  equipment: matched.equipment,
                  sets: [
                    { setNumber: 1, reps: 10, weightKg: 30, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
                    { setNumber: 2, reps: 10, weightKg: 30, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
                    { setNumber: 3, reps: 8, weightKg: 35, restSeconds: 90, rpe: 9, technique: 'NORMAL' },
                  ],
                });
              }
            });
          }

          return {
            name: d.name,
            dayOfWeek: d.dayOfWeek,
            exercises: loadedPresetExs,
          };
        });

        setWorkoutDays(newDays);
        setActiveDayIdx(0);
        setIsSearchOpen(false);
        triggerWorkoutAutoSave(preset.title, newDays);
        setStatusMsg({ type: 'success', text: `Estratégia "${preset.title}" aplicada com sucesso!` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    });
  };

  // Adiciona novo dia de treino
  const addNewWorkoutDay = () => {
    setInputDialog({
      isOpen: true,
      title: 'Novo Dia de Treino',
      message: 'Nome do novo dia de treino:',
      placeholder: 'ex: Treino D - Ombros e Abdômen',
      onConfirm: (dayName) => {
        if (dayName?.trim()) {
          setWorkoutDays((prev) => [
            ...prev,
            {
              name: dayName.trim(),
              dayOfWeek: 'THURSDAY',
              exercises: [],
            },
          ]);
          setActiveDayIdx(workoutDays.length);
        }
      }
    });
  };

  // Remove dia de treino
  const removeWorkoutDay = (idx: number) => {
    if (workoutDays.length <= 1) {
      alert('A rotina deve conter pelo menos 1 dia de treino.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Dia',
      message: `Deseja excluir o "${workoutDays[idx]?.name}"?`,
      variant: 'danger',
      onConfirm: () => {
        const updated = [...workoutDays];
        updated.splice(idx, 1);
        setWorkoutDays(updated);
        setActiveDayIdx(Math.max(0, idx - 1));
      }
    });
  };

  // Adiciona exercício com 1 clique/toque no card
  const handleSelectExercise = (ex: Exercise) => {
    if (!checkCanAddExercise(ex)) return;
    if (activeDayIdx < 0 || activeDayIdx >= workoutDays.length) return;

    triggerHapticFeedback();

    const updated = [...workoutDays];
    const newEntry: LocalExerciseEntry = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
        { setNumber: 2, reps: 10, weightKg: 20, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
        { setNumber: 3, reps: 10, weightKg: 20, restSeconds: 90, rpe: 9, technique: 'NORMAL' },
      ],
    };
    updated[activeDayIdx].exercises.push(newEntry);
    setWorkoutDays(updated);

    // Feedback visual imediato inline (para mobile e desktop)
    setRecentlyAddedExerciseId(ex.id);
    const msg = `"${ex.name}" adicionado a ${workoutDays[activeDayIdx].name}!`;
    setRecentlyAddedMsg(msg);
    setStatusMsg({ type: 'success', text: msg });

    setTimeout(() => {
      setRecentlyAddedExerciseId(null);
    }, 1500);
    setTimeout(() => {
      setRecentlyAddedMsg(null);
      setStatusMsg(null);
    }, 3000);
  };

  // Remove exercício
  const removeExercise = (exIdx: number) => {
    const exName = workoutDays[activeDayIdx]?.exercises[exIdx]?.exerciseName || 'este exercício';
    setConfirmDialog({
      isOpen: true,
      title: 'Remover Exercício',
      message: `Deseja remover "${exName}" do seu treino? Todas as séries e cargas configuradas serão excluídas.`,
      variant: 'danger',
      onConfirm: () => {
        const updated = [...workoutDays];
        updated[activeDayIdx].exercises.splice(exIdx, 1);
        setWorkoutDays(updated);
      },
    });
  };

  // Adiciona série
  const addSetToExercise = (exIdx: number) => {
    const updated = [...workoutDays];
    const currentSets = updated[activeDayIdx].exercises[exIdx].sets;
    const lastSet = currentSets[currentSets.length - 1] || {
      reps: 10,
      weightKg: 20,
      restSeconds: 60,
      rpe: 8,
      technique: 'NORMAL',
    };

    currentSets.push({
      setNumber: currentSets.length + 1,
      reps: lastSet.reps,
      weightKg: lastSet.weightKg,
      restSeconds: lastSet.restSeconds,
      rpe: lastSet.rpe || 8,
      technique: lastSet.technique || 'NORMAL',
    });

    setWorkoutDays(updated);
  };

  // Remove série
  const removeSet = (exIdx: number, sIdx: number) => {
    const updated = [...workoutDays];
    const currentSets = updated[activeDayIdx].exercises[exIdx].sets;
    if (currentSets.length <= 1) {
      removeExercise(exIdx);
      return;
    }
    currentSets.splice(sIdx, 1);
    currentSets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setWorkoutDays(updated);
  };

  // Atualiza campo de uma série
  const updateSet = (
    exIdx: number,
    sIdx: number,
    field: keyof LocalWorkoutSet,
    val: any
  ) => {
    setWorkoutDays((prev) => {
      const updated = [...prev];
      const targetSet = { ...updated[activeDayIdx].exercises[exIdx].sets[sIdx], [field]: val };
      updated[activeDayIdx].exercises[exIdx].sets[sIdx] = targetSet;
      return updated;
    });
  };

  // Volume total da sessão atual
  const currentDayVolume = useMemo(() => {
    const current = workoutDays[activeDayIdx];
    if (!current) return 0;
    return current.exercises.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, s) => {
          const reps = Number(s.reps) || 0;
          const w = Number(s.weightKg) || 0;
          return exTotal + reps * w;
        }, 0)
      );
    }, 0);
  }, [workoutDays, activeDayIdx]);

  // Exportar rotina para JSON
  const handleExportJson = () => {
    const exportData = {
      name: routineName,
      exportedAt: new Date().toISOString(),
      workoutDays,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routineName.toLowerCase().replace(/\s+/g, '_')}_treino.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Regra do Nutri Hero: Concluir o treino de hoje desbloqueia Baú do Titã (+1 Força)
  const handleCompleteWorkout = async () => {
    if (!user?.id) return;
    try {
      const res = await idleGameService.taskCheckin(user.id, 'workout');
      triggerHapticFeedback();
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: `🎉 Treino concluído! Recompensa desbloqueada: ${res.attributeGained}! O baú foi adicionado à sua Mochila 🎒.`,
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: res.message,
        });
      }
      setTimeout(() => setStatusMsg(null), 5000);
    } catch {
      // silencioso
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span>Montador de Treino com IA & Biomecânica</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sugestões inteligentes conscientes da rotina semanal, técnicas avançadas e catálogo de máquinas
          </p>
        </div>

        {/* Status de Salvamento e Ações */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-400">Salvando alterações...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400">Salvo automaticamente</span>
              </>
            ) : (
              <span className="text-slate-400">Pronto</span>
            )}
          </div>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handleCompleteWorkout}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
            title="Concluir treino e resgatar Baú do Titã (+1 Força)"
          >
            <Check className="w-4 h-4" />
            <span>Concluir Treino de Hoje</span>
          </button>
        </div>
      </div>

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

      {/* Banner de Condições e Limitações Físicas / Biomecânica */}
      {(() => {
        const isFilled = condicoesELimitacoesPreenchidas(user);
        const hasPainOrInjury =
          user?.hasJointPain === 'YES' ||
          user?.hasMuscleInjuries === 'YES' ||
          user?.hasExercisePain === 'YES' ||
          (user?.affectedJoints && user.affectedJoints.length > 0) ||
          (user?.affectedMuscles && user.affectedMuscles.length > 0);

        if (!isFilled) {
          return (
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1F2937] text-slate-400 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  <strong>Limitações físicas não informadas:</strong> Responda às perguntas para ativar a checagem biomecânica de segurança e alertas de sobrecarga.
                </span>
              </div>
              <button
                onClick={() => setIsLimitationModalOpen(true)}
                className="text-[11px] font-bold text-blue-400 hover:text-white underline whitespace-nowrap cursor-pointer"
              >
                Informar agora
              </button>
            </div>
          );
        }

        if (hasPainOrInjury) {
          const regions = [
            ...(user?.affectedJoints || []),
            ...(user?.affectedMuscles || []),
          ].filter(Boolean);

          return (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Filtro Biomecânico Ativo:</strong> Exercícios de alto impacto para{' '}
                  <span className="underline font-bold text-white">
                    {regions.length > 0
                      ? regions.slice(0, 3).join(', ') + (regions.length > 3 ? ` (+${regions.length - 3})` : '')
                      : 'suas articulações/músculos'}
                  </span>{' '}
                  serão sinalizados e prevenidos na montagem do seu treino.
                </span>
              </div>
              <button
                onClick={() => setIsLimitationModalOpen(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-white underline whitespace-nowrap cursor-pointer"
              >
                Editar
              </button>
            </div>
          );
        }

        return null;
      })()}

      {/* Banner de Conexão com Personal Trainers Credenciados */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#111827] to-surface border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Dúvidas sobre postura, biomecânica ou periodização de cargas?
            </h4>
            <p className="text-[11px] text-slate-300">
              Conecte-se diretamente com Personal Trainers credenciados no CREF pelo chat do aplicativo.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/professionals?type=TRAINER')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
        >
          <span>Consultar Treinadores</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* PAINEL RECOLHÍVEL DE RECOMENDAÇÕES DE TREINO */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl transition-all">
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback();
            setIsRecommendationsOpen(!isRecommendationsOpen);
          }}
          className="w-full flex items-center justify-between text-left group active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Recomendações & Estratégias Científicas</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                  {availablePresets.length} rotinas
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Toque para {isRecommendationsOpen ? 'recolher' : 'expandir'} estratégias pré-montadas para o seu perfil
              </p>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
            {isRecommendationsOpen ? (
              <ChevronDown className="w-4 h-4 text-blue-400" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </button>

        {isRecommendationsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Estratégias calibradas para seu objetivo {user?.gender ? `(${user.gender === 'male' || user.gender === 'MALE' ? 'Masculino' : 'Feminino'})` : ''}
              </span>
              <span>Clique para carregar a rotina completa</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {availablePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all group flex flex-col justify-between active:scale-98"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] text-slate-500">{preset.days.length} sessões</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-semibold text-[11px]">Aplicar Estratégia</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cabeçalho da Rotina e Dias */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nome da Rotina de Treino
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Abas dos Dias de Treino */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dias da Rotina ({workoutDays.length} dias configurados)
            </label>
            <button
              onClick={addNewWorkoutDay}
              className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Novo Dia de Treino</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {workoutDays.map((day, idx) => (
              <div key={idx} className="flex items-center">
                <button
                  onClick={() => {
                    setActiveDayIdx(idx);
                    setIsSearchOpen(false);
                    setShowAllMusclesOverride(false);
                    setSelectedMuscle('ALL');
                  }}
                  className={`px-4 py-2.5 rounded-l-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDayIdx === idx
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{day.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 text-[10px]">
                    {day.exercises.length} ex
                  </span>
                </button>
                <button
                  onClick={() => removeWorkoutDay(idx)}
                  className={`px-2.5 py-2.5 rounded-r-2xl border-y border-r text-xs transition-colors ${
                    activeDayIdx === idx
                      ? 'bg-blue-600 border-blue-400 text-white hover:bg-rose-600'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-900'
                  }`}
                  title="Excluir este dia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações do Dia Ativo e Tonelagem */}
        {workoutDays[activeDayIdx] && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nome da Sessão:
                </label>
                <input
                  type="text"
                  value={workoutDays[activeDayIdx].name}
                  onChange={(e) => {
                    const updated = [...workoutDays];
                    updated[activeDayIdx].name = e.target.value;
                    setWorkoutDays(updated);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Dia da Semana:
                </label>
                <select
                  value={workoutDays[activeDayIdx].dayOfWeek}
                  onChange={(e) => {
                    const updated = [...workoutDays];
                    updated[activeDayIdx].dayOfWeek = e.target.value as DayOfWeek;
                    setWorkoutDays(updated);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-semibold focus:outline-none"
                >
                  {daysOfWeekOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Tonelagem Total da Sessão
                </span>
                <span className="text-sm font-extrabold text-blue-400">
                  {currentDayVolume.toLocaleString('pt-BR')} kg
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sugestões Inteligentes Estritas e Complementares */}
      {smartSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">
              Sugestões Inteligentes para o {workoutDays[activeDayIdx]?.name} (Restrito aos Músculos do Treino)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {smartSuggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExercise(sug.exercise)}
                className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-blue-400 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between text-left touch-manipulation select-none active:scale-[0.98]"
              >
                <div>
                  <span className="text-[10px] text-amber-400 font-semibold block mb-1">
                    💡 {sug.reason}
                  </span>
                  <span className="font-extrabold text-xs text-white group-hover:text-blue-300 block transition-colors">
                    {sug.exercise.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {muscleGroupLabelsPtBr[sug.exercise.muscleGroup] || sug.exercise.muscleGroup}{' '}
                    {sug.exercise.equipment && `· ${sug.exercise.equipment}`}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-blue-400 w-full">
                  <span>
                    {recentlyAddedExerciseId === sug.exercise.id ? '✓ Adicionado à sessão!' : 'Adicionar à sessão'}
                  </span>
                  <span>{recentlyAddedExerciseId === sug.exercise.id ? '✓' : '+'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo da Rotina com Pesquisa e Seleção Direta */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Exercícios de {workoutDays[activeDayIdx]?.name}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({workoutDays[activeDayIdx]?.exercises.length || 0} exercícios cadastrados)
            </span>
          </h2>

          <button
            onClick={() => {
              if (!isSearchOpen && !checkCanAddExercise()) return;
              setIsSearchOpen(!isSearchOpen);
            }}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
          >
            {isSearchOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isSearchOpen ? 'Fechar Busca' : 'Buscar Exercício no Catálogo'}</span>
          </button>
        </div>

        {/* Painel de Busca com Tags e Exercícios Estritamente Compatíveis */}
        {isSearchOpen && (
          <div className="bg-slate-900/95 border border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Exercícios compatíveis com {workoutDays[activeDayIdx]?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Busque por máquina ou exercício..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Feedback Visual Inline de Adição */}
            {recentlyAddedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{recentlyAddedMsg}</span>
              </div>
            )}

            {/* Tags Musculares Contextuais */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-1.5 items-center">
                {relevantMuscleGroups.map((group: { id: string; label: string }) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedMuscle(group.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedMuscle === group.id
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {!showAllMusclesOverride && (
                <button
                  onClick={() => setShowAllMusclesOverride(true)}
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Filter className="w-3 h-3" />
                  <span>Ver outros grupos musculares</span>
                </button>
              )}
            </div>

            {/* Resultados Clicáveis Diretamente com Análise de Compatibilidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {isLoadingExercises ? (
                <div className="col-span-full py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs font-medium">Carregando catálogo de exercícios...</span>
                </div>
              ) : exerciseLoadError ? (
                <div className="col-span-full py-8 px-4 text-center rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                  <p className="text-xs text-rose-300">{exerciseLoadError}</p>
                  <button
                    type="button"
                    onClick={() => fetchExercises()}
                    className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              ) : filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => {
                  const compat = verificarCompatibilidade(user, ex);
                  const isRecentlyAdded = recentlyAddedExerciseId === ex.id;

                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleSelectExercise(ex)}
                      className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group touch-manipulation select-none active:scale-[0.98] ${
                        isRecentlyAdded
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                          : 'bg-slate-950 hover:bg-blue-950/40 active:bg-blue-900/50 border-slate-800 hover:border-blue-500/60'
                      }`}
                    >
                      <div className="flex-1 pr-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-white group-hover:text-blue-300 block transition-colors truncate">
                            {ex.name}
                          </span>
                          {compat.level !== 'NONE' && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${compat.badgeBg} ${compat.badgeColor} ${compat.badgeBorder}`}
                              title={compat.reasons.join(' ')}
                            >
                              {compat.badgeLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-blue-400 font-semibold">
                            {muscleGroupLabelsPtBr[ex.muscleGroup] || ex.muscleGroup}
                          </span>
                          {ex.equipment && (
                            <span className="text-[10px] text-slate-400 truncate">{ex.equipment}</span>
                          )}
                        </div>
                      </div>

                      {/* Botão de adicionar visível no celular e desktop com feedback */}
                      <span
                        className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          isRecentlyAdded
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white sm:opacity-90'
                        }`}
                      >
                        {isRecentlyAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <span>Adicionar</span>
                            <Plus className="w-3.5 h-3.5" />
                          </>
                        )}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <span>Nenhum exercício encontrado para os filtros selecionados.</span>
                  <div className="flex items-center gap-2 mt-1">
                    {exerciseSearch && (
                      <button
                        type="button"
                        onClick={() => setExerciseSearch('')}
                        className="px-3 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold"
                      >
                        Limpar busca
                      </button>
                    )}
                    {!showAllMusclesOverride && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllMusclesOverride(true);
                          setSelectedMuscle('ALL');
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 text-[11px] font-semibold"
                      >
                        Ver todos os grupos musculares
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de Exercícios com Técnicas Avançadas e Alertas de Segurança */}
        <div className="space-y-4">
          {workoutDays[activeDayIdx]?.exercises.map((ex, exIdx) => {
            const compat = verificarCompatibilidade(user, {
              name: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              equipment: ex.equipment,
            });

            return (
              <div
                key={exIdx}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                      {exIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-white text-base">{ex.exerciseName}</h4>
                        {compat.level !== 'NONE' && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${compat.badgeBg} ${compat.badgeColor} ${compat.badgeBorder}`}
                          >
                            {compat.badgeLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-blue-400 font-semibold">
                          {muscleGroupLabelsPtBr[ex.muscleGroup] || ex.muscleGroup}
                        </span>
                        {ex.equipment && (
                          <span className="text-xs text-slate-400">&middot; {ex.equipment}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeExercise(exIdx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remover exercício"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Alerta de Segurança Contextual do Exercício (se aplicável) */}
                {compat.level !== 'NONE' && (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${compat.badgeBg} ${compat.badgeBorder}`}>
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <ShieldAlert className={`w-4 h-4 ${compat.badgeColor}`} />
                      <span>Orientações de Segurança Biomecânica</span>
                    </div>
                    {compat.reasons.map((r, rIdx) => (
                      <p key={rIdx} className="text-slate-300 pl-6 text-[11px] leading-relaxed">
                        &bull; {r}
                      </p>
                    ))}
                    {compat.recommendation && (
                      <p className="text-slate-400 pl-6 text-[11px] italic">
                        💡 {compat.recommendation}
                      </p>
                    )}
                  </div>
                )}

              {/* Tabela de Séries com Técnicas Avançadas */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  <span className="col-span-1">Série</span>
                  <span className="col-span-3">Técnica Avançada</span>
                  <span className="col-span-2">Reps</span>
                  <span className="col-span-2">Carga (kg)</span>
                  <span className="col-span-2">Descanso</span>
                  <span className="col-span-1">RPE</span>
                  <span className="col-span-1 text-right">Ação</span>
                </div>

                {ex.sets.map((set, sIdx) => {
                  const activeTech = set.technique || 'NORMAL';
                  const techInfo = techniqueDetails[activeTech];

                  return (
                    <div
                      key={sIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border text-xs transition-colors ${
                        activeTech !== 'NORMAL'
                          ? `${techInfo.bg} ${techInfo.border}`
                          : 'bg-slate-950/60 border-slate-800/60'
                      }`}
                    >
                      <div className="col-span-1 flex items-center gap-1 font-bold text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] flex items-center justify-center border border-slate-800">
                          {set.setNumber}
                        </span>
                      </div>

                      {/* Seletor de Técnicas Avançadas */}
                      <div className="col-span-3">
                        <select
                          value={activeTech}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, 'technique', e.target.value as TrainingTechnique)
                          }
                          className={`w-full px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${techInfo.bg} ${techInfo.color} ${techInfo.border}`}
                          title={techInfo.desc}
                        >
                          {Object.entries(techniqueDetails).map(([key, val]) => (
                            <option key={key} value={key} className="bg-slate-950 text-slate-200">
                              {val.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={set.reps}
                          onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-center focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={set.weightKg}
                          onChange={(e) => updateSet(exIdx, sIdx, 'weightKg', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-center focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={set.restSeconds}
                          onChange={(e) => updateSet(exIdx, sIdx, 'restSeconds', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-center focus:outline-none focus:border-blue-500 text-[11px]"
                        />
                      </div>

                      <div className="col-span-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={set.rpe ?? 8}
                          onChange={(e) => updateSet(exIdx, sIdx, 'rpe', e.target.value)}
                          className="w-full px-1 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold text-center focus:outline-none focus:border-blue-500 text-[11px]"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => removeSet(exIdx, sIdx)}
                          className="p-1 text-slate-400 opacity-40 hover:opacity-100 hover:text-red-400 transition-opacity"
                          title="Remover série"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => addSetToExercise(exIdx)}
                  className="w-full py-2 rounded-xl border border-dashed border-slate-800 hover:border-blue-500/40 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Série neste Exercício</span>
                </button>
              </div>
            </div>
            );
          })}

          {workoutDays[activeDayIdx]?.exercises.length === 0 && (
            <div className="p-12 rounded-3xl bg-slate-900/40 border-2 border-dashed border-slate-800 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-300">
                Nenhum exercício adicionado neste treino ainda.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clique no botão abaixo para buscar e incluir exercícios diretamente nesta sessão.
              </p>
              <button
                onClick={() => {
                  if (!checkCanAddExercise()) return;
                  setIsSearchOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeiro Exercício</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Interativo de Condições e Limitações na Mesma Página */}
      <WorkoutLimitationsModal
        isOpen={isLimitationModalOpen}
        onClose={() => {
          setIsLimitationModalOpen(false);
          setPendingExerciseForAdd(null);
        }}
        onSuccess={() => {
          setIsLimitationModalOpen(false);
          if (pendingExerciseForAdd) {
            handleSelectExercise(pendingExerciseForAdd);
            setPendingExerciseForAdd(null);
          } else {
            setIsSearchOpen(true);
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
