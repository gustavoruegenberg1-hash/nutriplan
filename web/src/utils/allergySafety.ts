/**
 * Utilitário Centralizado de Segurança Alimentar e Alergênicos
 * Verifica compatibilidade entre alimentos e alergias/intolerâncias cadastradas do usuário.
 */

// Mapeamento de termos e derivados de alérgenos comuns
const allergenKeywords: Record<string, string[]> = {
  amendoim: ['amendoim', 'pasta de amendoim', 'amendoim torrado', 'manteiga de amendoim'],
  leite: [
    'leite',
    'queijo',
    'iogurte',
    'whey',
    'caseína',
    'coalhada',
    'requeijão',
    'manteiga',
    'nata',
    'creme de leite',
    'ricota',
    'parmesão',
    'mussarela',
  ],
  ovos: ['ovo', 'ovos', 'clara de ovo', 'gema de ovo', 'omelete'],
  peixes: ['peixe', 'tilápia', 'salmão', 'atum', 'bacalhau', 'sardinha', 'merluza'],
  'frutos do mar': ['camarão', 'lagosta', 'lula', 'polvo', 'marisco', 'ostra', 'caranguejo', 'siri'],
  'trigo / glúten': ['trigo', 'pão', 'farinha de trigo', 'macarrão', 'biscoito', 'torrada', 'centeio', 'cevada', 'aveia com glúten'],
  soja: ['soja', 'tofu', 'shoyu', 'edamame', 'proteína isolada de soja', 'lecitina de soja'],
  'castanhas / nozes': ['castanha', 'nozes', 'amêndoa', 'avelã', 'pistache', 'macadâmia', 'pecã'],
};

export function checkFoodAllergens(
  foodName: string,
  userAllergies?: string[] | null
): { isAllergen: boolean; matchedAllergens: string[] } {
  if (!userAllergies || userAllergies.length === 0) {
    return { isAllergen: false, matchedAllergens: [] };
  }

  const normalizedFood = foodName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const matched: string[] = [];

  for (const allergy of userAllergies) {
    const allergyKey = allergy.toLowerCase().trim();
    const keywords = allergenKeywords[allergyKey] || [allergyKey];

    const hasMatch = keywords.some((kw) => {
      const normalizedKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedFood.includes(normalizedKw);
    });

    if (hasMatch) {
      matched.push(allergy);
    }
  }

  return {
    isAllergen: matched.length > 0,
    matchedAllergens: matched,
  };
}

export function getAllergyBannerInfo(user: {
  hasFoodAllergies?: boolean | null;
  allergies?: string[];
}): { status: 'NO_INFO' | 'NO_ALLERGIES' | 'HAS_ALLERGIES'; text: string; allergies: string[] } {
  if (user.hasFoodAllergies === null || user.hasFoodAllergies === undefined) {
    return {
      status: 'NO_INFO',
      text: 'Alergias não informadas no perfil (preencha no perfil para ativar a exclusão automática de alérgenos).',
      allergies: [],
    };
  }

  if (user.hasFoodAllergies === false || !user.allergies || user.allergies.length === 0) {
    return {
      status: 'NO_ALLERGIES',
      text: 'Nenhuma alergia alimentar declarada no perfil.',
      allergies: [],
    };
  }

  return {
    status: 'HAS_ALLERGIES',
    text: `Proteção de Alergias Ativa: Alimentos com ${user.allergies.join(', ')} estão sendo filtrados e sinalizados.`,
    allergies: user.allergies,
  };
}
