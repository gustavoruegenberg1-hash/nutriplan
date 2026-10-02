import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Exercise, DayOfWeek } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InputDialog } from '../components/InputDialog';
import { condicoesELimitacoesPreenchidas } from '../utils/formValidation';
import { WorkoutLimitationsModal } from '../components/workout/WorkoutLimitationsModal';
import { CreateWorkoutDayModal, AVAILABLE_MUSCLE_TAGS, QUICK_TAG_COMBOS } from '../components/workout/CreateWorkoutDayModal';
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
  ChevronUp,
  ChevronRight,
  Info,
  Tags,
  Edit3,
  Sparkles,
  Play,
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
  completed?: boolean;
}

export interface LocalWorkoutDay {
  name: string;
  dayOfWeek: DayOfWeek;
  targetMuscles?: string[];
  exercises: LocalExerciseEntry[];
}

export interface TrainingPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  targetGender: 'MALE' | 'FEMALE' | 'UNISEX';
  days: { name: string; dayOfWeek: DayOfWeek; targetMuscles?: string[]; presetExercises?: string[] }[];
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
export function getStrictMuscleGroupsForWorkout(dayOrName: LocalWorkoutDay | string | undefined | null): string[] {
  if (!dayOrName) return [];
  if (typeof dayOrName === 'object') {
    if (Array.isArray(dayOrName.targetMuscles)) {
      return dayOrName.targetMuscles;
    }
    return getStrictMuscleGroupsForWorkout(dayOrName.name);
  }

  const dayName = dayOrName;
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
export function getRelevantMusclesForWorkout(dayOrName: LocalWorkoutDay | string | undefined | null): { id: string; label: string; icon?: string }[] {
  const strictGroups = getStrictMuscleGroupsForWorkout(dayOrName);

  if (strictGroups.length > 0) {
    return [
      { id: 'ALL', label: 'Todos do Treino' },
      ...strictGroups.map((k) => {
        const found = AVAILABLE_MUSCLE_TAGS.find((m) => m.id === k);
        return {
          id: k,
          label: found?.label || muscleGroupLabelsPtBr[k] || k,
          icon: found?.icon || '💪',
        };
      }),
    ];
  }

  return [
    { id: 'ALL', label: 'Todos os Músculos' },
    ...AVAILABLE_MUSCLE_TAGS.map((t) => ({ id: t.id, label: t.label, icon: t.icon })),
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
  const allowedGroups = new Set(getStrictMuscleGroupsForWorkout(currentDay));
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d: any) => ({
            ...d,
            targetMuscles: Array.isArray(d.targetMuscles)
              ? d.targetMuscles
              : getStrictMuscleGroupsForWorkout(d.name),
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPreset.days.map((d) => ({
      ...d,
      targetMuscles: getStrictMuscleGroupsForWorkout(d.name),
      exercises: [],
    }));
  });

  const navigate = useNavigate();
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(true); // Aberto por padrão para montagem direta e ágil
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

  // Estado para controlar a exibição dos detalhes de cada exercício escolhido (oculto por padrão)
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});

  // Recolhe os detalhes ao trocar de dia de treino
  useEffect(() => {
    setExpandedExercises({});
  }, [activeDayIdx]);

  const toggleExpandExercise = (exIdx: number) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exIdx]: !prev[exIdx],
    }));
  };

  const toggleExpandAllExercises = () => {
    const currentExercises = workoutDays[activeDayIdx]?.exercises || [];
    const areAllExpanded =
      currentExercises.length > 0 &&
      currentExercises.every((_, idx) => expandedExercises[idx]);
    if (areAllExpanded) {
      setExpandedExercises({});
    } else {
      const all: Record<number, boolean> = {};
      currentExercises.forEach((_, idx) => {
        all[idx] = true;
      });
      setExpandedExercises(all);
    }
  };

  // Conclui o exercício: oculta seus detalhes e o destaca em verde
  const toggleExerciseCompletion = (exIdx: number) => {
    triggerHapticFeedback();
    const currentExercises = workoutDays[activeDayIdx]?.exercises || [];
    const targetEx = currentExercises[exIdx];
    if (!targetEx) return;

    const willBeCompleted = !targetEx.completed;

    // Assim que pressionado para concluir, oculta os detalhes do exercício
    if (willBeCompleted) {
      setExpandedExercises((prev) => ({
        ...prev,
        [exIdx]: false,
      }));
    }

    const updated = workoutDays.map((d, dIdx) => {
      if (dIdx !== activeDayIdx) return d;
      return {
        ...d,
        exercises: d.exercises.map((e, idx) => {
          if (idx !== exIdx) return e;
          return { ...e, completed: willBeCompleted };
        }),
      };
    });

    setWorkoutDays(updated);
  };

  const isInitialSyncDone = useRef(false);

  // Músculos relevantes contextuais baseados no treino e tags ativas
  const currentDay = workoutDays[activeDayIdx];
  const strictAllowedGroups = useMemo(() => {
    return getStrictMuscleGroupsForWorkout(currentDay);
  }, [currentDay]);

  const relevantMuscleGroups = useMemo(() => {
    if (showAllMusclesOverride) {
      return [
        { id: 'ALL', label: 'Todos os Músculos', icon: '🌐' },
        ...AVAILABLE_MUSCLE_TAGS.map((t) => ({ id: t.id, label: t.label, icon: t.icon })),
      ];
    }
    return getRelevantMusclesForWorkout(currentDay);
  }, [currentDay, showAllMusclesOverride]);

  // Sincroniza automaticamente a seleção de exercício quando as tags forem alteradas
  useEffect(() => {
    if (selectedMuscle !== 'ALL' && !strictAllowedGroups.includes(selectedMuscle) && !showAllMusclesOverride) {
      setSelectedMuscle('ALL');
    }
  }, [strictAllowedGroups, selectedMuscle, showAllMusclesOverride]);

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

            // Preserva as tags musculares salvas localmente caso a API não as retorne
            const savedLocal = localStorage.getItem(WORKOUT_STORAGE_KEY);
            const localTagsMap: Record<string, string[]> = {};
            if (savedLocal) {
              try {
                const parsedLocal = JSON.parse(savedLocal);
                if (Array.isArray(parsedLocal)) {
                  parsedLocal.forEach((pd: any) => {
                    if (pd.name && Array.isArray(pd.targetMuscles)) {
                      localTagsMap[pd.name] = pd.targetMuscles;
                    }
                  });
                }
              } catch (_) {}
            }

            const loadedDays: LocalWorkoutDay[] = active.days.map((d: any) => ({
              name: d.name,
              dayOfWeek: d.dayOfWeek,
              targetMuscles: d.targetMuscles || localTagsMap[d.name] || undefined,
              exercises: (d.exercises || []).map((e: any) => ({
                exerciseId: e.exerciseId,
                exerciseName: e.exercise?.name || 'Exercício',
                muscleGroup: e.exercise?.muscleGroup || 'GERAL',
                equipment: e.exercise?.equipment || null,
                notes: e.notes || '',
                completed: Boolean(e.completed),
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
              completed: Boolean(e.completed),
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
            targetMuscles: getStrictMuscleGroupsForWorkout(d.name),
            exercises: loadedPresetExs,
          };
        });

        setWorkoutDays(newDays);
        setActiveDayIdx(0);
        setIsSearchOpen(true);
        setSelectedMuscle('ALL');
        setShowAllMusclesOverride(false);
        triggerWorkoutAutoSave(preset.title, newDays);
        setStatusMsg({ type: 'success', text: `Estratégia "${preset.title}" aplicada com sucesso!` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    });
  };

  const [isDayConfigModalOpen, setIsDayConfigModalOpen] = useState<boolean>(false);
  const [dayConfigModalMode, setDayConfigModalMode] = useState<'create' | 'edit'>('create');

  // Adiciona novo dia de treino com nome e tags
  const addNewWorkoutDay = () => {
    if (!checkCanAddExercise()) return;
    setDayConfigModalMode('create');
    setIsDayConfigModalOpen(true);
  };

  const handleOpenEditDayModal = () => {
    setDayConfigModalMode('edit');
    setIsDayConfigModalOpen(true);
  };

  const handleSaveDayConfig = (data: { name: string; dayOfWeek: DayOfWeek; targetMuscles: string[] }) => {
    if (dayConfigModalMode === 'create') {
      const newDay: LocalWorkoutDay = {
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        targetMuscles: data.targetMuscles,
        exercises: [],
      };
      const updated = [...workoutDays, newDay];
      setWorkoutDays(updated);
      setActiveDayIdx(updated.length - 1);
      setSelectedMuscle('ALL');
      setShowAllMusclesOverride(false);
      setIsSearchOpen(true);
      setStatusMsg({
        type: 'success',
        text: `Treino "${data.name}" criado! Comece a montagem escolhendo os exercícios abaixo.`,
      });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      const updated = workoutDays.map((day, i) =>
        i === activeDayIdx
          ? {
              ...day,
              name: data.name,
              dayOfWeek: data.dayOfWeek,
              targetMuscles: data.targetMuscles,
            }
          : day
      );
      setWorkoutDays(updated);
      setSelectedMuscle('ALL');
      setShowAllMusclesOverride(false);
      setStatusMsg({
        type: 'success',
        text: `Treino "${data.name}" atualizado com sucesso!`,
      });
      setTimeout(() => setStatusMsg(null), 2500);
    }
  };

  // Alterna tag muscular diretamente na tela do treino ativo com 1 clique e atualiza os exercícios instantaneamente
  const toggleMuscleTagForCurrentDay = (tagId: string) => {
    if (activeDayIdx < 0 || activeDayIdx >= workoutDays.length) return;
    triggerHapticFeedback();
    const currentDay = workoutDays[activeDayIdx];
    const initialTags =
      Array.isArray(currentDay.targetMuscles)
        ? [...currentDay.targetMuscles]
        : [...getStrictMuscleGroupsForWorkout(currentDay.name)];

    const idx = initialTags.indexOf(tagId);
    let newTags: string[];
    if (idx >= 0) {
      newTags = initialTags.filter((t) => t !== tagId);
    } else {
      newTags = [...initialTags, tagId];
    }

    const updated = workoutDays.map((day, i) =>
      i === activeDayIdx ? { ...day, targetMuscles: newTags } : day
    );

    setWorkoutDays(updated);
    setSelectedMuscle('ALL');
    setShowAllMusclesOverride(false);
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

    // Previne inserção duplicada do mesmo exercício no mesmo dia
    const isAlreadyInWorkout = workoutDays[activeDayIdx]?.exercises.some(
      (e) => e.exerciseId === ex.id || e.exerciseName.toLowerCase().trim() === ex.name.toLowerCase().trim()
    );
    if (isAlreadyInWorkout) {
      triggerHapticFeedback();
      setStatusMsg({
        type: 'error',
        text: `"${ex.name}" já está no treino! Ajuste as séries diretamente no treino montado abaixo.`,
      });
      setTimeout(() => setStatusMsg(null), 3500);
      return;
    }

    triggerHapticFeedback();

    const newEntry: LocalExerciseEntry = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      completed: false,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
        { setNumber: 2, reps: 10, weightKg: 20, restSeconds: 60, rpe: 8, technique: 'NORMAL' },
        { setNumber: 3, reps: 10, weightKg: 20, restSeconds: 90, rpe: 9, technique: 'NORMAL' },
      ],
    };

    const updated = workoutDays.map((d, dIdx) => {
      if (dIdx !== activeDayIdx) return d;
      return {
        ...d,
        exercises: [...d.exercises, newEntry],
      };
    });
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
        const updated = workoutDays.map((d, dIdx) => {
          if (dIdx !== activeDayIdx) return d;
          return {
            ...d,
            exercises: d.exercises.filter((_, idx) => idx !== exIdx),
          };
        });
        setWorkoutDays(updated);
        setExpandedExercises((prev) => {
          const next = { ...prev };
          delete next[exIdx];
          return next;
        });
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

      {/* ========================================================================= */}
      {/* CAIXA 1: MONTADOR DE TREINO (Tudo condensado em uma única caixa)         */}
      {/* ========================================================================= */}
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Cabeçalho do Montador e Abas das Sessões da Semana */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243044]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Montador de Treino
              </h2>
              <p className="text-xs text-slate-400">
                Defina o nome, escolha as tags musculares e selecione os exercícios abaixo
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400 hidden sm:inline">Salvo</span>
                </>
              ) : (
                <span className="text-slate-400">Pronto</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Exportar rotina em JSON"
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
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRecommendationsOpen ? 'Fechar Modelos' : 'Modelos Prontos'}</span>
            </button>

            <button
              type="button"
              onClick={addNewWorkoutDay}
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Criar Novo Treino</span>
            </button>
          </div>
        </div>

        {/* Modelos Prontos (se expandido) */}
        {isRecommendationsOpen && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Modelos Prontos Baseados em Evidência
              </span>
              <button onClick={() => setIsRecommendationsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    applyPreset(preset);
                    setIsRecommendationsOpen(false);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {preset.badge}
                    </span>
                    <h4 className="font-extrabold text-xs text-white group-hover:text-blue-300 mt-1">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <span className="text-blue-400 font-bold text-[11px] mt-2 flex items-center gap-1">
                    Carregar Rotina <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Abas das Sessões da Semana */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Sessões Cadastradas:
            </span>
            <span className="text-[11px] text-slate-400">
              (Clique para alternar o treino em edição)
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {workoutDays.map((day, idx) => {
              const isActive = activeDayIdx === idx;
              return (
                <div key={idx} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDayIdx(idx);
                      setSelectedMuscle('ALL');
                      setShowAllMusclesOverride(false);
                    }}
                    className={`px-3.5 py-2 rounded-l-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50'
                        : 'bg-slate-900 text-slate-300 hover:text-white border-y border-l border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{day.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {day.exercises.length} ex
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWorkoutDay(idx)}
                    className={`px-2 py-2 rounded-r-xl border-y border-r text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 border-blue-400 text-white hover:bg-rose-600'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-rose-400'
                    }`}
                    title="Excluir este treino"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuração do Treino Ativo: Nome + Dia da Semana */}
        {workoutDays[activeDayIdx] && (
          <div className="space-y-4 pt-2 border-t border-[#243044]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nome do Treino */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Nome do Treino:
                </label>
                <input
                  type="text"
                  value={workoutDays[activeDayIdx].name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWorkoutDays((prev) =>
                      prev.map((d, i) => (i === activeDayIdx ? { ...d, name: val } : d))
                    );
                  }}
                  placeholder="Ex: Treino A - Peitoral e Tríceps"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Sugestões:</span>
                  {['Treino A', 'Treino B', 'Treino C', 'Push', 'Pull', 'Pernas (Inferiores)'].map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => {
                        setWorkoutDays((prev) =>
                          prev.map((d, i) => (i === activeDayIdx ? { ...d, name: sug } : d))
                        );
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg border bg-slate-900 border-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dia da Semana */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Dia da Semana:
                </label>
                <select
                  value={workoutDays[activeDayIdx].dayOfWeek || 'MONDAY'}
                  onChange={(e) => {
                    const val = e.target.value as DayOfWeek;
                    setWorkoutDays((prev) =>
                      prev.map((d, i) => (i === activeDayIdx ? { ...d, dayOfWeek: val } : d))
                    );
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                >
                  {daysOfWeekOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Combos Rápidos de Tags */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Combos de 1-Toque:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAG_COMBOS.map((combo) => {
                  const currentTags = workoutDays[activeDayIdx]?.targetMuscles || [];
                  const isSelected =
                    combo.tags.length === currentTags.length &&
                    combo.tags.every((t) => currentTags.includes(t));

                  return (
                    <button
                      key={combo.label}
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback();
                        setWorkoutDays((prev) =>
                          prev.map((d, i) => {
                            if (i !== activeDayIdx) return d;
                            return {
                              ...d,
                              targetMuscles: combo.tags,
                              name: !d.name || d.name.startsWith('Treino ') ? combo.defaultName : d.name,
                            };
                          })
                        );
                        setSelectedMuscle('ALL');
                        setShowAllMusclesOverride(false);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {combo.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Tags Musculares */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5 text-blue-400" />
                  <span>Escolha as Tags Alvo do Treino:</span>
                </label>
                <span className="text-[11px] text-blue-400 font-bold">
                  {strictAllowedGroups.length}{' '}
                  {strictAllowedGroups.length === 1 ? 'tag ativa' : 'tags ativas'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_MUSCLE_TAGS.map((tag) => {
                  const isSelected = strictAllowedGroups.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleMuscleTagForCurrentDay(tag.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                      {isSelected ? <Check className="w-3 h-3 text-white" /> : <span className="text-slate-600 text-xs">+</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELEÇÃO DE EXERCÍCIOS CORRESPONDENTES ÀS TAGS (LOGO ABAIXO NA MESMA CAIXA) */}
            <div className="space-y-3 pt-3 border-t border-[#243044]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-blue-400" />
                    <span>Selecione os Exercícios para o Treino:</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {strictAllowedGroups.length > 0
                      ? `Exibindo exercícios correspondentes às tags selecionadas`
                      : 'Todas as tags disponíveis'}
                  </p>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    placeholder="Buscar exercício..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mensagem de Feedback de Adição */}
              {recentlyAddedMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{recentlyAddedMsg}</span>
                </div>
              )}

              {/* Grade de Exercícios para Adicionar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {isLoadingExercises ? (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400 mx-auto mb-2" />
                    Carregando catálogo de exercícios...
                  </div>
                ) : filteredExercises.length > 0 ? (
                  filteredExercises.map((ex) => {
                    const isRecentlyAdded = recentlyAddedExerciseId === ex.id;
                    const isAlreadyInWorkout = workoutDays[activeDayIdx]?.exercises.some(
                      (e) => e.exerciseId === ex.id || e.exerciseName.toLowerCase().trim() === ex.name.toLowerCase().trim()
                    );

                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleSelectExercise(ex)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.98] ${
                          isRecentlyAdded
                            ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                            : isAlreadyInWorkout
                            ? 'bg-slate-950/60 border-blue-500/30'
                            : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex-1 pr-2 min-w-0">
                          <span className="font-extrabold text-xs text-white block truncate">
                            {ex.name}
                          </span>
                          <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">
                            {muscleGroupLabelsPtBr[ex.muscleGroup] || ex.muscleGroup}
                            {ex.equipment ? ` &middot; ${ex.equipment}` : ''}
                          </span>
                        </div>

                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                            isRecentlyAdded
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : isAlreadyInWorkout
                              ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                              : 'bg-blue-500 hover:bg-blue-400 text-white'
                          }`}
                        >
                          {isRecentlyAdded ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Adicionado!</span>
                            </>
                          ) : isAlreadyInWorkout ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Já no Treino</span>
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
                    Nenhum exercício encontrado para as tags selecionadas.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CAIXA 2: TREINO MONTADO (Apenas o nome do exercício até ser iniciado)     */}
      {/* ========================================================================= */}
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Cabeçalho do Treino Montado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243044]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Treino Montado: {workoutDays[activeDayIdx]?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                {workoutDays[activeDayIdx]?.exercises.length || 0}{' '}
                {(workoutDays[activeDayIdx]?.exercises.length || 0) === 1 ? 'exercício' : 'exercícios'}
              </span>
            </div>

            {/* Contador de Conclusão */}
            {workoutDays[activeDayIdx]?.exercises && workoutDays[activeDayIdx].exercises.length > 0 && (() => {
              const totalEx = workoutDays[activeDayIdx].exercises.length;
              const completedEx = workoutDays[activeDayIdx].exercises.filter((e) => e.completed).length;
              const percent = Math.round((completedEx / totalEx) * 100);
              const isAllDone = totalEx > 0 && completedEx === totalEx;

              return (
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <span className={`text-xs font-bold ${isAllDone ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {completedEx} de {totalEx} {totalEx === 1 ? 'exercício concluído' : 'exercícios concluídos'}
                  </span>
                  <div className="w-28 sm:w-36 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${isAllDone ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-400">{percent}%</span>
                  {isAllDone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Treino 100% Concluído
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Botões de Ação Global do Treino Montado */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCompleteWorkout}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Concluir treino e resgatar Baú do Titã (+1 Força)"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Concluir Treino de Hoje</span>
            </button>

            {workoutDays[activeDayIdx]?.exercises && workoutDays[activeDayIdx].exercises.length > 0 && (() => {
              const currentExercises = workoutDays[activeDayIdx].exercises;
              const areAllExpanded = currentExercises.every((_, idx) => expandedExercises[idx]);

              return (
                <button
                  type="button"
                  onClick={toggleExpandAllExercises}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {areAllExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{areAllExpanded ? 'Recolher Todos' : 'Ver Todos Detalhes'}</span>
                </button>
              );
            })()}
          </div>
        </div>

        {/* LISTA DOS EXERCÍCIOS ESCOLHIDOS (APENAS O NOME ATÉ CLICAR PARA INICIAR) */}
        <div className="space-y-2.5">
          {workoutDays[activeDayIdx]?.exercises.map((ex, exIdx) => {
            const isCompleted = Boolean(ex.completed);
            const isExpanded = Boolean(expandedExercises[exIdx]);
            const compat = verificarCompatibilidade(user, {
              name: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              equipment: ex.equipment,
            });

            return (
              <div
                key={exIdx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm shadow-emerald-950/30'
                    : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* LINHA DO EXERCÍCIO: APENAS O NOME DO EXERCÍCIO */}
                <div
                  onClick={() => toggleExpandExercise(exIdx)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Número ou Check */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <span>{exIdx + 1}</span>}
                    </div>

                    {/* APENAS O NOME DO EXERCÍCIO (VERDE SE CONCLUÍDO) */}
                    <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-sm sm:text-base font-extrabold truncate ${
                          isCompleted ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {ex.exerciseName}
                      </span>

                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Concluído
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
                          toggleExpandExercise(exIdx);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isExpanded ? 'Ocultar' : 'Iniciar Exercício'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandExercise(exIdx);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Ocultar' : 'Ver Detalhes'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExercise(exIdx);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remover exercício"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DETALHES EXPANDIDOS (QUANDO O USUÁRIO CLICA PARA INICIAR) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-800/80 space-y-4 bg-slate-950/40 animate-in fade-in duration-150">
                    {/* Alerta Biomecânico */}
                    {compat.level !== 'NONE' && (
                      <div className={`p-3 rounded-xl border text-xs space-y-1 ${compat.badgeBg} ${compat.badgeBorder}`}>
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <ShieldAlert className={`w-3.5 h-3.5 ${compat.badgeColor}`} />
                          <span>Orientações de Segurança Biomecânica</span>
                        </div>
                        {compat.reasons.map((r, rIdx) => (
                          <p key={rIdx} className="text-slate-300 text-[11px] leading-relaxed">
                            &bull; {r}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Tabela de Séries */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        <span className="col-span-1">Série</span>
                        <span className="col-span-3">Técnica</span>
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
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border text-xs ${
                              activeTech !== 'NORMAL' ? `${techInfo.bg} ${techInfo.border}` : 'bg-slate-950/60 border-slate-800/60'
                            }`}
                          >
                            <div className="col-span-1 flex items-center font-bold text-slate-300">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] flex items-center justify-center border border-slate-800">
                                {set.setNumber}
                              </span>
                            </div>
                            <div className="col-span-3">
                              <select
                                value={activeTech}
                                onChange={(e) => updateSet(exIdx, sIdx, 'technique', e.target.value as TrainingTechnique)}
                                className={`w-full px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${techInfo.bg} ${techInfo.color} ${techInfo.border}`}
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
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remover série"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => addSetToExercise(exIdx)}
                        className="w-full py-2 rounded-xl border border-dashed border-slate-800 hover:border-blue-500/40 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Série</span>
                      </button>
                    </div>

                    {/* BOTÃO PARA FINALIZAR O EXERCÍCIO (RECOLHE OS DETALHES E FICA VERDE) */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpandExercise(exIdx)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Recolher Detalhes
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExerciseCompletion(exIdx)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isCompleted ? 'Desmarcar Conclusão' : '✓ Finalizar Exercício'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {workoutDays[activeDayIdx]?.exercises.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-950/40 border-2 border-dashed border-slate-800/80 text-center space-y-2">
              <Dumbbell className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum exercício no treino montado ainda</p>
              <p className="text-xs text-slate-400">
                Selecione as tags acima e clique em "+ Adicionar" para montar a lista deste treino.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé discreto com link para treinadores */}
      <div className="pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 flex-wrap gap-2">
        <span>Planejamento e periodização biomecânica NutriPlan</span>
        <button
          onClick={() => navigate('/professionals?type=TRAINER')}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Dúvidas com o treino? Consulte um Personal Trainer credenciado</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
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

      {/* Modal Intuitivo de Criação e Configuração de Treino com Tags */}
      <CreateWorkoutDayModal
        isOpen={isDayConfigModalOpen}
        onClose={() => setIsDayConfigModalOpen(false)}
        onSave={handleSaveDayConfig}
        initialData={
          dayConfigModalMode === 'edit' && workoutDays[activeDayIdx]
            ? {
                name: workoutDays[activeDayIdx].name || '',
                dayOfWeek: workoutDays[activeDayIdx].dayOfWeek || 'MONDAY',
                targetMuscles: workoutDays[activeDayIdx].targetMuscles || [],
              }
            : null
        }
        mode={dayConfigModalMode}
        existingDayCount={workoutDays.length}
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
