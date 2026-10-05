const fs = require('fs');
const path = require('path');
const https = require('https');

const existingExportPath = path.resolve(__dirname, '..', 'api', 'firebase-export', 'foods.json');
const targetExportPath = path.resolve(__dirname, '..', 'api', 'firebase-export', 'foods.json');
const targetWebPath = path.resolve(__dirname, '..', 'web', 'src', 'data', 'tacoFoods.json');
const targetLocalCache = path.resolve(__dirname, '..', 'api', 'local-cache', 'foods.json');

const existingFoods = JSON.parse(fs.readFileSync(existingExportPath, 'utf8'));

console.log(`Carregados ${existingFoods.length} alimentos da base atual.`);

https.get('https://raw.githubusercontent.com/marcelosanto/tabela_taco/master/tabela_alimentos.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tacoList = JSON.parse(data);
    console.log(`Carregados ${tacoList.length} alimentos oficiais da Tabela TACO (UNICAMP - 4ª Edição).`);

    const normalize = s => (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    function parseNum(v, decimals = 1) {
      if (typeof v === 'number') {
        return decimals === 0 ? Math.round(v) : Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
      }
      if (!v || v === 'Tr' || v === 'NA' || v === 'ND' || v === '*') return 0;
      const num = parseFloat(String(v).replace(',', '.'));
      if (isNaN(num)) return 0;
      return decimals === 0 ? Math.round(num) : Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    function cleanFoodName(rawName) {
      if (!rawName || typeof rawName !== 'string') return rawName;

      let cleaned = rawName.trim();

      // Ajustes específicos de rótulos TACO invertidos
      if (/^Bolo,\s*mistura\s*para/i.test(cleaned)) {
        const rest = cleaned.replace(/^Bolo,\s*mistura\s*para,?\s*/i, '').trim();
        cleaned = rest ? `Mistura para bolo (${rest})` : 'Mistura para bolo';
      } else if (/^Curau,\s*milho\s*verde,\s*mistura\s*para/i.test(cleaned)) {
        cleaned = 'Mistura para curau de milho verde';
      }

      // Substituição de marcadores de pó, conserva e tempo
      cleaned = cleaned.replace(/,\s*pó(?:\s|$)/gi, ' em pó ');
      cleaned = cleaned.replace(/,\s*conserva(?:\s|$)/gi, ' em conserva ');
      cleaned = cleaned.replace(/\/10minutos/gi, '');

      // Conectivos e preposições sem vírgula
      cleaned = cleaned.replace(/,\s*de\s+/gi, ' de ');
      cleaned = cleaned.replace(/,\s*da\s+/gi, ' da ');
      cleaned = cleaned.replace(/,\s*do\s+/gi, ' do ');
      cleaned = cleaned.replace(/,\s*com\s+/gi, ' com ');
      cleaned = cleaned.replace(/,\s*sem\s+/gi, ' sem ');
      cleaned = cleaned.replace(/,\s*em\s+/gi, ' em ');
      cleaned = cleaned.replace(/,\s*para\s+/gi, ' para ');
      cleaned = cleaned.replace(/,\s*ao\s+/gi, ' ao ');
      cleaned = cleaned.replace(/,\s*à\s+/gi, ' à ');

      // Substitui qualquer vírgula restante por espaço limpo
      cleaned = cleaned.replace(/,\s*/g, ' ');

      // Remove espaços múltiplos e limpa bordas
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      // Primeira letra sempre maiúscula
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

      return cleaned;
    }

    function guessCategory(name) {
      const n = (name || '').toLowerCase();
      if (n.includes('whey') || n.includes('creatina') || n.includes('caseína') || n.includes('albumina') || n.includes('shake proteico')) return 'Suplementos';
      if (n.includes('coca') || n.includes('red bull') || n.includes('guaraná') || n.includes('gatorade') || n.includes('suco') || n.includes('café') || n.includes('água de coco') || n.includes('bebida láctea')) return 'Bebidas (alcoólicas e não alcoólicas)';
      if (n.includes('carne') || n.includes('frango') || n.includes('peru') || n.includes('patinho') || n.includes('alcatra') || n.includes('maminha') || n.includes('picanha') || n.includes('contrafilé') || n.includes('costela') || n.includes('lombo')) return 'Carnes e derivados';
      if (n.includes('peixe') || n.includes('atum') || n.includes('salmão') || n.includes('tilápia') || n.includes('camarão') || n.includes('pescada') || n.includes('merluza') || n.includes('lula')) return 'Pescados e frutos do mar';
      if (n.includes('queijo') || n.includes('iogurte') || n.includes('leite') || n.includes('requeijão') || n.includes('manteiga')) return 'Leite e derivados';
      if (n.includes('ovo') || n.includes('clara')) return 'Ovos e derivados';
      if (n.includes('arroz') || n.includes('aveia') || n.includes('pão') || n.includes('macarrão') || n.includes('tapioca') || n.includes('granola') || n.includes('farinha') || n.includes('flocos')) return 'Cereais e derivados';
      if (n.includes('feijão') || n.includes('lentilha') || n.includes('grão-de-bico') || n.includes('soja') || n.includes('ervilha')) return 'Leguminosas e derivados';
      if (n.includes('banana') || n.includes('maçã') || n.includes('pera') || n.includes('uva') || n.includes('manga') || n.includes('morango') || n.includes('abacaxi') || n.includes('abacate') || n.includes('kiwi') || n.includes('laranja') || n.includes('melão') || n.includes('melancia') || n.includes('mamão') || n.includes('limão') || n.includes('goiaba')) return 'Frutas e derivados';
      if (n.includes('alface') || n.includes('tomate') || n.includes('cenoura') || n.includes('brócolis') || n.includes('espinafre') || n.includes('abóbora') || n.includes('batata') || n.includes('mandioca') || n.includes('mandioquinha') || n.includes('inhame') || n.includes('aspargo') || n.includes('pepino')) return 'Verduras, hortaliças e derivados';
      if (n.includes('amendoim') || n.includes('castanha') || n.includes('nozes') || n.includes('chia') || n.includes('linhaça')) return 'Nozes e sementes';
      if (n.includes('azeite') || n.includes('óleo')) return 'Gorduras e óleos';
      if (n.includes('mel') || n.includes('açúcar') || n.includes('chocolate')) return 'Produtos açucarados';
      return 'Outros alimentos industrializados';
    }

    const existingByNorm = new Map();
    existingFoods.forEach(e => {
      existingByNorm.set(normalize(cleanFoodName(e.name)), e);
      existingByNorm.set(normalize(e.name), e);
    });

    const tacoNormSet = new Set();
    const finalFoods = [];

    // 1. Processa todos os 597 alimentos da TACO com escrita limpa e sem vírgulas
    tacoList.forEach(t => {
      let cleanedName = cleanFoodName(t.description);

      // Desambiguação de nomes homônimos da TACO
      if (t.id === 468 && t.category === 'Leite e derivados') {
        cleanedName = 'Maria mole láctea';
      } else if (t.id === 504 && t.category === 'Produtos açucarados') {
        cleanedName = 'Maria mole doce tradicional';
      }

      const norm = normalize(cleanedName);
      tacoNormSet.add(norm);
      tacoNormSet.add(normalize(t.description));

      const matchExisting = existingByNorm.get(norm) || existingByNorm.get(normalize(t.description));

      finalFoods.push({
        id: 'taco-' + t.id,
        legacyId: matchExisting ? matchExisting.id : undefined,
        name: cleanedName,
        category: t.category,
        source: 'TACO',
        caloriesPer100g: parseNum(t.energy_kcal, 0),
        proteinPer100g: parseNum(t.protein_g, 1),
        carbsPer100g: parseNum(t.carbohydrate_g, 1),
        fatPer100g: parseNum(t.lipid_g, 1),
        fiberPer100g: parseNum(t.fiber_g, 1),
        micronutrients: {
          calcium_mg: parseNum(t.calcium_mg, 1),
          iron_mg: parseNum(t.iron_mg, 2),
          sodium_mg: parseNum(t.sodium_mg, 1),
          potassium_mg: parseNum(t.potassium_mg, 1),
          magnesium_mg: parseNum(t.magnesium_mg, 1),
          zinc_mg: parseNum(t.zinc_mg, 2),
          vitaminC_mg: parseNum(t.vitaminC_mg, 1),
        },
        isVerified: true
      });
    });

    // 2. Adiciona alimentos suplementares/personalizados preservados (sem duplicatas)
    let preservedCount = 0;
    existingFoods.forEach(e => {
      const cleanedExistingName = cleanFoodName(e.name);
      const norm = normalize(cleanedExistingName);
      const rawNorm = normalize(e.name);

      if (!tacoNormSet.has(norm) && !tacoNormSet.has(rawNorm)) {
        preservedCount++;
        tacoNormSet.add(norm);

        finalFoods.push({
          id: e.id,
          name: cleanedExistingName,
          category: guessCategory(cleanedExistingName),
          source: (cleanedExistingName.toLowerCase().includes('whey') || cleanedExistingName.toLowerCase().includes('creatina')) ? 'SUPPLEMENT' : (e.source || 'TACO'),
          caloriesPer100g: parseNum(e.caloriesPer100g, 0),
          proteinPer100g: parseNum(e.proteinPer100g, 1),
          carbsPer100g: parseNum(e.carbsPer100g, 1),
          fatPer100g: parseNum(e.fatPer100g, 1),
          fiberPer100g: parseNum(e.fiberPer100g, 1),
          micronutrients: e.micronutrients || null,
          isVerified: true
        });
      }
    });

    console.log(`TACO processados com escrita limpa: ${tacoList.length}`);
    console.log(`Alimentos preservados (suplementos/extras): ${preservedCount}`);
    console.log(`Total final de alimentos: ${finalFoods.length}`);

    // Salvar no backend e no frontend
    const jsonOutput = JSON.stringify(finalFoods, null, 2);
    fs.writeFileSync(targetExportPath, jsonOutput, 'utf8');
    fs.writeFileSync(targetWebPath, jsonOutput, 'utf8');
    if (fs.existsSync(path.dirname(targetLocalCache))) {
      fs.writeFileSync(targetLocalCache, jsonOutput, 'utf8');
    }

    console.log(`Base de alimentos gravada com sucesso em todos os destinos!`);
  });
});
