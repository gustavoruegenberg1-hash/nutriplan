/**
 * Utilitários de Formatação e Apresentação Amigável para o Usuário
 * Transforma identificadores internos técnicos, enums e strings com '_' em nomes amigáveis em português.
 */

const FRIENDLY_DICTIONARY: Record<string, string> = {
  // Metas e Protocolos Nutricionais
  high_protein: 'Alta Proteína',
  lean_protein: 'Proteína Magra',
  low_carb: 'Baixo Carboidrato',
  balanced_diet: 'Dieta Equilibrada',
  meal_plan: 'Plano Alimentar',
  breakfast_option: 'Opção de Café da Manhã',
  lunch_option: 'Opção de Almoço',
  dinner_option: 'Opção de Jantar',
  snack_option: 'Opção de Lanche',

  // Enums de Objetivos
  LOSE_WEIGHT: 'Emagrecimento',
  GAIN_WEIGHT: 'Hipertrofia',
  MAINTAIN: 'Manutenção',
  HYPERTROPHY: 'Hipertrofia',
  STRENGTH: 'Força',
  WEIGHT_LOSS: 'Emagrecimento',
  ENDURANCE: 'Resistência',

  // Níveis de Experiência
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  RETURNING: 'Retornando',

  // Níveis de Atividade
  SEDENTARY: 'Sedentário',
  LIGHTLY_ACTIVE: 'Levemente Ativo',
  MODERATELY_ACTIVE: 'Moderadamente Ativo',
  VERY_ACTIVE: 'Muito Ativo',
  EXTREMELY_ACTIVE: 'Extremamente Ativo',

  // Grupamentos Musculares
  CHEST: 'Peito',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  ABS: 'Abdômen',
  QUADRICEPS: 'Quadríceps',
  HAMSTRINGS: 'Posterior de Coxa',
  GLUTES: 'Glúteos',
  CALVES: 'Panturrilhas',
  FOREARMS: 'Antebraços',
  FULL_BODY: 'Corpo Inteiro',
  CARDIO: 'Cardio',

  // Equipamentos e Tipos
  BARBELL: 'Barra',
  DUMBBELL: 'Halter',
  DUMBBELLS: 'Halteres',
  MACHINE: 'Máquina',
  CABLE: 'Cabo',
  BODYWEIGHT: 'Peso Corporal',
  BODY_WEIGHT: 'Peso Corporal',
  BAND: 'Elástico',
  KETTLEBELL: 'Kettlebell',
  FREE_WEIGHT: 'Peso Livre',
  NONE: 'Livre',
  LIVRE: 'Livre',

  // Níveis e Status
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  COMPLETED: 'Concluído',
  RESTING: 'Descansando',
  RUNNING: 'Em Execução',
  IDLE: 'Pendente',
};

/**
 * Normaliza qualquer texto ou identificador interno para uma apresentação amigável em português,
 * removendo underscores '_' e substituindo termos técnicos ou em inglês.
 */
export function formatFriendlyName(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';

  const trimmed = text.trim();

  // Correspondência direta no dicionário (exata ou uppercase)
  if (FRIENDLY_DICTIONARY[trimmed]) {
    return FRIENDLY_DICTIONARY[trimmed];
  }
  const upper = trimmed.toUpperCase();
  if (FRIENDLY_DICTIONARY[upper]) {
    return FRIENDLY_DICTIONARY[upper];
  }

  // Substituição de palavras conhecidas dentro de frases maiores
  let result = trimmed;
  for (const [key, val] of Object.entries(FRIENDLY_DICTIONARY)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, val);
  }

  // Se ainda contiver underscores '_', converte para espaços e capitaliza
  if (result.includes('_')) {
    result = result
      .split('_')
      .filter(Boolean)
      .map((word) => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }

  return result;
}

/**
 * Converte segundos inteiros no formato MM:SS para exibição em cronômetros
 */
export function formatTimer(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const remSec = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
}
