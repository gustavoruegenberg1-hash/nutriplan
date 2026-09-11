import { User, Exercise } from '../types';

export type AlertLevel = 'NONE' | 'ATTENTION' | 'SPECIAL_ATTENTION' | 'AVOID' | 'EQUIPMENT_MISSING';

export interface ExerciseCompatibilityResult {
  level: AlertLevel;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  reasons: string[];
  recommendation: string;
  isCompatible: boolean;
}

// Mapeamento de articulações e movimentos por exercício / grupo muscular
const exerciseBiomechanicsMap: Record<
  string,
  {
    primaryMuscles: string[];
    secondaryMuscles: string[];
    joints: string[];
    movements: string[];
    requiredEquipment: string;
  }
> = {
  // Peitoral
  'Supino Reto com Barra': {
    primaryMuscles: ['CHEST'],
    secondaryMuscles: ['TRICEPS', 'SHOULDERS'],
    joints: ['Ombro direito', 'Ombro esquerdo', 'Cotovelo direito', 'Cotovelo esquerdo', 'Punho direito', 'Punho esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'BARBELL',
  },
  'Supino Inclinado com Halteres': {
    primaryMuscles: ['CHEST', 'SHOULDERS'],
    secondaryMuscles: ['TRICEPS'],
    joints: ['Ombro direito', 'Ombro esquerdo', 'Cotovelo direito', 'Cotovelo esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'DUMBBELLS',
  },
  'Crucifixo no Banco Reto': {
    primaryMuscles: ['CHEST'],
    secondaryMuscles: ['SHOULDERS'],
    joints: ['Ombro direito', 'Ombro esquerdo', 'Cotovelo direito', 'Cotovelo esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'DUMBBELLS',
  },
  'Crossover na Polia Média': {
    primaryMuscles: ['CHEST'],
    secondaryMuscles: ['SHOULDERS'],
    joints: ['Ombro direito', 'Ombro esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'MACHINES',
  },

  // Costas
  'Puxada Alta Frontal no Pulley': {
    primaryMuscles: ['BACK'],
    secondaryMuscles: ['BICEPS', 'FOREARMS'],
    joints: ['Ombro direito', 'Ombro esquerdo', 'Cotovelo direito', 'Cotovelo esquerdo'],
    movements: ['Puxar na vertical (Barra/Puxada)', 'Levantar os braços acima da cabeça'],
    requiredEquipment: 'MACHINES',
  },
  'Remada Curvada com Barra': {
    primaryMuscles: ['BACK'],
    secondaryMuscles: ['BICEPS', 'LOWER_BACK', 'HAMSTRINGS'],
    joints: ['Coluna / Lombar', 'Cotovelo direito', 'Cotovelo esquerdo', 'Quadril direito', 'Quadril esquerdo'],
    movements: ['Puxar na horizontal (Remada)', 'Flexionar o quadril (Stiff/Terra)'],
    requiredEquipment: 'BARBELL',
  },
  'Remada Baixa no Cabo (Triângulo)': {
    primaryMuscles: ['BACK'],
    secondaryMuscles: ['BICEPS', 'LOWER_BACK'],
    joints: ['Cotovelo direito', 'Cotovelo esquerdo', 'Coluna / Lombar'],
    movements: ['Puxar na horizontal (Remada)'],
    requiredEquipment: 'MACHINES',
  },
  'Levantamento Terra (Deadlift)': {
    primaryMuscles: ['BACK', 'GLUTES', 'HAMSTRINGS', 'LOWER_BACK'],
    secondaryMuscles: ['QUADRICEPS', 'FOREARMS', 'ABS'],
    joints: ['Coluna / Lombar', 'Quadril direito', 'Quadril esquerdo', 'Joelho direito', 'Joelho esquerdo'],
    movements: ['Flexionar o quadril (Stiff/Terra)', 'Agachar'],
    requiredEquipment: 'BARBELL',
  },

  // Ombros
  'Desenvolvimento de Ombros com Halteres': {
    primaryMuscles: ['SHOULDERS'],
    secondaryMuscles: ['TRICEPS'],
    joints: ['Ombro direito', 'Ombro esquerdo', 'Cotovelo direito', 'Cotovelo esquerdo', 'Pescoço / Cervical'],
    movements: ['Empurrar na vertical (Desenvolvimento)', 'Levantar os braços acima da cabeça'],
    requiredEquipment: 'DUMBBELLS',
  },
  'Elevação Lateral com Halteres': {
    primaryMuscles: ['SHOULDERS'],
    secondaryMuscles: ['BACK'],
    joints: ['Ombro direito', 'Ombro esquerdo'],
    movements: ['Levantar os braços acima da cabeça'],
    requiredEquipment: 'DUMBBELLS',
  },
  'Crucifixo Invertido no Banco': {
    primaryMuscles: ['SHOULDERS', 'BACK'],
    secondaryMuscles: ['TRICEPS'],
    joints: ['Ombro direito', 'Ombro esquerdo'],
    movements: ['Puxar na horizontal (Remada)'],
    requiredEquipment: 'DUMBBELLS',
  },

  // Pernas
  'Agachamento Livre com Barra': {
    primaryMuscles: ['QUADRICEPS', 'GLUTES'],
    secondaryMuscles: ['LOWER_BACK', 'ABS', 'CALVES', 'HAMSTRINGS'],
    joints: ['Joelho direito', 'Joelho esquerdo', 'Quadril direito', 'Quadril esquerdo', 'Coluna / Lombar', 'Tornozelo direito', 'Tornozelo esquerdo'],
    movements: ['Agachar', 'Flexionar o joelho sob carga'],
    requiredEquipment: 'BARBELL',
  },
  'Leg Press 45°': {
    primaryMuscles: ['QUADRICEPS', 'GLUTES'],
    secondaryMuscles: ['HAMSTRINGS', 'CALVES'],
    joints: ['Joelho direito', 'Joelho esquerdo', 'Quadril direito', 'Quadril esquerdo', 'Tornozelo direito', 'Tornozelo esquerdo'],
    movements: ['Agachar', 'Flexionar o joelho sob carga'],
    requiredEquipment: 'MACHINES',
  },
  'Cadeira Extensora': {
    primaryMuscles: ['QUADRICEPS'],
    secondaryMuscles: [],
    joints: ['Joelho direito', 'Joelho esquerdo'],
    movements: ['Flexionar o joelho sob carga'],
    requiredEquipment: 'MACHINES',
  },
  'Mesa Flexora Deitada': {
    primaryMuscles: ['HAMSTRINGS'],
    secondaryMuscles: ['CALVES'],
    joints: ['Joelho direito', 'Joelho esquerdo'],
    movements: ['Flexionar o joelho sob carga'],
    requiredEquipment: 'MACHINES',
  },
  'Elevação Pélvica com Barra': {
    primaryMuscles: ['GLUTES'],
    secondaryMuscles: ['HAMSTRINGS', 'LOWER_BACK'],
    joints: ['Quadril direito', 'Quadril esquerdo', 'Coluna / Lombar'],
    movements: ['Flexionar o quadril (Stiff/Terra)'],
    requiredEquipment: 'BARBELL',
  },
  'Panturrilha em Pé no Degrau / Máquina': {
    primaryMuscles: ['CALVES'],
    secondaryMuscles: [],
    joints: ['Tornozelo direito', 'Tornozelo esquerdo'],
    movements: ['Saltar'],
    requiredEquipment: 'BODYWEIGHT',
  },

  // Braços
  'Rosca Direta com Barra W': {
    primaryMuscles: ['BICEPS'],
    secondaryMuscles: ['FOREARMS'],
    joints: ['Cotovelo direito', 'Cotovelo esquerdo', 'Punho direito', 'Punho esquerdo'],
    movements: ['Puxar na horizontal (Remada)'],
    requiredEquipment: 'BARBELL',
  },
  'Rosca Martelo com Halteres': {
    primaryMuscles: ['BICEPS', 'FOREARMS'],
    secondaryMuscles: [],
    joints: ['Cotovelo direito', 'Cotovelo esquerdo', 'Punho direito', 'Punho esquerdo'],
    movements: ['Puxar na horizontal (Remada)'],
    requiredEquipment: 'DUMBBELLS',
  },
  'Tríceps na Polia com Corda': {
    primaryMuscles: ['TRICEPS'],
    secondaryMuscles: ['FOREARMS'],
    joints: ['Cotovelo direito', 'Cotovelo esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'MACHINES',
  },
  'Tríceps Testa com Halteres': {
    primaryMuscles: ['TRICEPS'],
    secondaryMuscles: [],
    joints: ['Cotovelo direito', 'Cotovelo esquerdo', 'Ombro direito', 'Ombro esquerdo'],
    movements: ['Empurrar na horizontal (Supino)'],
    requiredEquipment: 'DUMBBELLS',
  },
};

/**
 * Função centralizada para verificar compatibilidade entre o perfil do usuário e um exercício
 */
export function verificarCompatibilidade(
  user: User | null,
  exercise: Exercise | { name: string; muscleGroup?: string; equipment?: string | null }
): ExerciseCompatibilityResult {
  if (!user) {
    return {
      level: 'NONE',
      badgeLabel: 'Compatível',
      badgeColor: 'text-slate-400',
      badgeBg: 'bg-slate-800/40',
      badgeBorder: 'border-slate-700',
      reasons: [],
      recommendation: '',
      isCompatible: true,
    };
  }

  const exName = exercise.name;
  const bio = exerciseBiomechanicsMap[exName] || {
    primaryMuscles: [exercise.muscleGroup || 'CHEST'],
    secondaryMuscles: [],
    joints: [],
    movements: [],
    requiredEquipment: exercise.equipment || 'FULL_GYM',
  };

  const reasons: string[] = [];

  // 1. Exercício explicitamente evitado
  if (user.exercisesToAvoid && user.exercisesToAvoid.some((a) => a.toLowerCase() === exName.toLowerCase())) {
    return {
      level: 'AVOID',
      badgeLabel: '⛔ Exercício Evitado',
      badgeColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/30',
      reasons: ['Você marcou este exercício na lista de preferências para evitar.'],
      recommendation: 'Substitua por uma variação equivalente para o mesmo grupo muscular.',
      isCompatible: false,
    };
  }

  // 2. Equipamento não disponível
  if (
    user.availableEquipment &&
    user.availableEquipment.length > 0 &&
    !user.availableEquipment.includes('FULL_GYM')
  ) {
    const reqEq = bio.requiredEquipment;
    if (reqEq && reqEq !== 'BODYWEIGHT' && !user.availableEquipment.includes(reqEq)) {
      return {
        level: 'EQUIPMENT_MISSING',
        badgeLabel: '⚠️ Equipamento Indisponível',
        badgeColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        reasons: [`Requer equipamento (${reqEq}) não cadastrado no seu perfil.`],
        recommendation: 'Opte por versões com halteres, elásticos ou peso corporal.',
        isCompatible: false,
      };
    }
  }

  // 3. Lesão Muscular Direta (🔴 Atenção Especial)
  if (user.hasMuscleInjuries === 'YES' && user.affectedMuscles && user.affectedMuscles.length > 0) {
    const directInjury = bio.primaryMuscles.filter((m) => user.affectedMuscles!.includes(m));
    if (directInjury.length > 0) {
      reasons.push(
        `Atua diretamente no músculo primário (${directInjury.join(', ')}) onde você reportou lesão/estiramento ativo.`
      );
    }
  }

  // 4. Dor Durante Exercício / Movimento (🔴 Atenção Especial)
  if (
    (user.hasExercisePain === 'YES' || user.hasExercisePain === 'SOMETIMES') &&
    user.painDetails &&
    user.painDetails.length > 0
  ) {
    user.painDetails.forEach((p) => {
      const regionMatch = bio.joints.some((j) => j.toLowerCase().includes(p.region.toLowerCase()));
      const movementMatch = bio.movements.some((m) => m.toLowerCase().includes(p.movement.toLowerCase()));
      if (regionMatch || movementMatch) {
        reasons.push(
          `Envolve movimento/região com dor relatada (${p.region} - ${p.movement}, intensidade ${p.intensity}/10).`
        );
      }
    });
  }

  if (reasons.length > 0) {
    return {
      level: 'SPECIAL_ATTENTION',
      badgeLabel: '🔴 Atenção Especial',
      badgeColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/30',
      reasons,
      recommendation:
        'Recomenda-se realizar com carga reduzida, amplitude controlada sem dor ou substituir por orientação de fisioterapeuta/educador físico.',
      isCompatible: false,
    };
  }

  // 5. Problema Articular ou Deficiência Física (🟡 Atenção Moderada)
  const moderateReasons: string[] = [];

  if (user.hasJointPain === 'YES' && user.affectedJoints && user.affectedJoints.length > 0) {
    const affected = bio.joints.filter((j) => user.affectedJoints!.includes(j));
    if (affected.length > 0) {
      moderateReasons.push(`Envolve a articulação (${affected.join(', ')}) onde você reportou desconforto ou histórico de dor.`);
    }
  }

  if (user.hasPhysicalDisabilities === 'YES' && user.affectedBodyRegions && user.affectedBodyRegions.length > 0) {
    const affected = bio.joints.filter((j) => user.affectedBodyRegions!.includes(j));
    if (affected.length > 0) {
      moderateReasons.push(`Solicita a região anatômica (${affected.join(', ')}) cadastrada com limitação de movimento.`);
    }
  }

  if (user.difficultMovements && user.difficultMovements.length > 0) {
    const matchedMovements = bio.movements.filter((m) => user.difficultMovements!.includes(m));
    if (matchedMovements.length > 0) {
      moderateReasons.push(`Utiliza padrão de movimento (${matchedMovements.join(', ')}) marcado com dificuldade.`);
    }
  }

  if (moderateReasons.length > 0) {
    return {
      level: 'ATTENTION',
      badgeLabel: '🟡 Atenção',
      badgeColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/30',
      reasons: moderateReasons,
      recommendation:
        'Aqueça bem a articulação envolvida, mantenha a postura biomecânica rigorosa e interrompa se sentir qualquer pontada de dor.',
      isCompatible: true,
    };
  }

  // 6. Totalmente Compatível
  return {
    level: 'NONE',
    badgeLabel: '✓ Compatível',
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/20',
    reasons: ['Exercício 100% alinhado com suas condições e equipamentos atuais.'],
    recommendation: '',
    isCompatible: true,
  };
}
