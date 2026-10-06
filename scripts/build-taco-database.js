const fs = require('fs');
const path = require('path');
const https = require('https');

const existingExportPath = path.resolve(__dirname, '..', 'api', 'firebase-export', 'foods.json');
const targetExportPath = path.resolve(__dirname, '..', 'api', 'firebase-export', 'foods.json');
const targetWebPath = path.resolve(__dirname, '..', 'web', 'src', 'data', 'tacoFoods.json');
const targetLocalCache = path.resolve(__dirname, '..', 'api', 'local-cache', 'foods.json');

let existingFoods;
try {
  const gitShow = require('child_process').execSync('git show HEAD:api/firebase-export/foods.json', { maxBuffer: 10 * 1024 * 1024 }).toString();
  existingFoods = JSON.parse(gitShow);
} catch {
  existingFoods = JSON.parse(fs.readFileSync(existingExportPath, 'utf8'));
}
console.log(`Carregados ${existingFoods.length} alimentos da base de referência.`);

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

    function cleanAndNaturalizeName(rawName, category) {
      if (!rawName || typeof rawName !== 'string') return { name: rawName, subCategory: null };

      let cleaned = rawName.trim();
      let subCategory = null;

      // 1. Inversões e correções semânticas da TACO
      if (/^Cana,\s*caldo\s*de/i.test(cleaned) || /^Cana\s+caldo\s+de/i.test(cleaned)) {
        cleaned = 'Caldo de cana';
      } else if (/^Cana,\s*aguardente/i.test(cleaned) || /^Cana\s+aguardente/i.test(cleaned)) {
        cleaned = 'Aguardente de cana (cachaça)';
      } else if (/^Café,\s*infusão/i.test(cleaned) || /^Café\s+infusão/i.test(cleaned)) {
        cleaned = 'Café preto coado';
      } else if (/^Chá,\s*erva-doce/i.test(cleaned) || /^Chá\s+erva-doce\s*(?:infusão)?\s*(?:\d+%)?$/i.test(cleaned)) {
        cleaned = 'Chá de erva-doce';
      } else if (/^Chá,\s*mate,?\s*infusão/i.test(cleaned) || /^Chá,\s*mate\s*$/i.test(cleaned) || /^Chá\s+mate\s*(?:infusão)?\s*(?:\d+%)?$/i.test(cleaned)) {
        cleaned = 'Chá mate';
      } else if (/^Chá,\s*preto,?\s*infusão/i.test(cleaned) || /^Chá,\s*preto\s*$/i.test(cleaned) || /^Chá\s+preto\s*(?:infusão)?\s*(?:\d+%)?$/i.test(cleaned)) {
        cleaned = 'Chá preto';
      } else if (/^Milho,\s*amido/i.test(cleaned) || /^Milho\s+amido/i.test(cleaned)) {
        cleaned = 'Amido de milho cru';
      } else if (/^Tomate,\s*extrato/i.test(cleaned) || /^Tomate\s+extrato/i.test(cleaned)) {
        cleaned = 'Extrato de tomate';
      } else if (/^Tomate,\s*molho/i.test(cleaned) || /^Tomate\s+molho/i.test(cleaned)) {
        cleaned = 'Molho de tomate industrializado';
      } else if (/^Tomate,\s*purê/i.test(cleaned) || /^Tomate\s+purê/i.test(cleaned)) {
        cleaned = 'Purê de tomate';
      } else if (/^Soja,\s*extrato\s*solúvel\s*em\s*pó/i.test(cleaned) || /^Soja\s+extrato\s+solúvel\s+em\s+pó/i.test(cleaned)) {
        cleaned = 'Extrato de soja solúvel em pó';
      } else if (/^Soja,\s*extrato\s*solúvel/i.test(cleaned) || /^Soja\s+extrato\s+solúvel/i.test(cleaned)) {
        cleaned = 'Extrato de soja solúvel fluido';
      } else if (/^Bolo,\s*mistura\s*para/i.test(cleaned)) {
        const rest = cleaned.replace(/^Bolo,\s*mistura\s*para,?\s*/i, '').trim();
        cleaned = rest ? `Mistura para bolo (${rest})` : 'Mistura para bolo';
      } else if (/^Curau,\s*milho\s*verde,\s*mistura\s*para/i.test(cleaned)) {
        cleaned = 'Mistura para curau de milho verde';
      }

      // Sucos invertidos
      const mJuiceConc = cleaned.match(/^(.+?)(?:,\s*|\s+)suco\s+concentrado(.*)/i);
      const mJuiceSimple = cleaned.match(/^(.+?)(?:,\s*|\s+)suco$/i);
      if (mJuiceConc && !cleaned.toLowerCase().startsWith('suco')) {
        cleaned = `Suco de ${mJuiceConc[1].trim()} concentrado${mJuiceConc[2] ? ' ' + mJuiceConc[2].trim() : ''}`;
      } else if (mJuiceSimple && !cleaned.toLowerCase().startsWith('suco')) {
        cleaned = `Suco de ${mJuiceSimple[1].trim()}`;
      }

      // 2. Remove notas laboratoriais de infusão (5%, 10%) e tempo
      cleaned = cleaned.replace(/\s*infusão\s*\d+%/gi, '');
      cleaned = cleaned.replace(/\/10minutos/gi, '');

      // 3. Preposições e conexões
      cleaned = cleaned.replace(/,\s*pó(?:\s|$)/gi, ' em pó ');
      cleaned = cleaned.replace(/,\s*conserva(?:\s|$)/gi, ' em conserva ');
      cleaned = cleaned.replace(/,\s*de\s+/gi, ' de ');
      cleaned = cleaned.replace(/,\s*da\s+/gi, ' da ');
      cleaned = cleaned.replace(/,\s*do\s+/gi, ' do ');
      cleaned = cleaned.replace(/,\s*com\s+/gi, ' com ');
      cleaned = cleaned.replace(/,\s*sem\s+/gi, ' sem ');
      cleaned = cleaned.replace(/,\s*em\s+/gi, ' em ');
      cleaned = cleaned.replace(/,\s*para\s+/gi, ' para ');
      cleaned = cleaned.replace(/,\s*ao\s+/gi, ' ao ');
      cleaned = cleaned.replace(/,\s*à\s+/gi, ' à ');

      // 4. Limpeza de vírgulas restantes
      cleaned = cleaned.replace(/,\s*/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      // 5. Carnes e sub-tags (Bovina, Suína, Aves, Embutidos)
      if (category === 'Carnes e derivados') {
        if (/^Carne\s+bovina\s+/i.test(cleaned)) {
          subCategory = 'Carne bovina';
          cleaned = cleaned.replace(/^Carne\s+bovina\s+/i, '');
        } else if (/^Carne\s+suína\s+/i.test(cleaned) || /^Carne\s+suina\s+/i.test(cleaned)) {
          subCategory = 'Carne suína';
          cleaned = cleaned.replace(/^Carne\s+su[íi]na\s+/i, '');
        } else if (/^Porco\s+/i.test(cleaned)) {
          subCategory = 'Carne suína';
          cleaned = cleaned.replace(/^Porco\s+/i, '') + ' (suíno)';
        } else if (/frango|galinha|peru|pato/i.test(cleaned)) {
          subCategory = 'Aves';
        } else if (/linguiça|lingüiça|salame|presunto|mortadela|apresuntado|salsicha/i.test(cleaned)) {
          subCategory = 'Embutidos e frios';
        } else if (/patinho|acém|músculo|picanha|contrafilé|contra-filé|alcatra|filé mignon|lagarto|cupim|costela|maminha/i.test(cleaned)) {
          subCategory = 'Carne bovina';
        } else {
          subCategory = 'Carnes e preparações';
        }
      }

      // Pescados e sub-tags
      if (category === 'Pescados e frutos do mar') {
        if (/camarão|lula|polvo|siri|caranguejo|marisco|ostra/i.test(cleaned)) {
          subCategory = 'Frutos do mar';
        } else {
          subCategory = 'Peixes';
        }
      }

      // Cereais e sub-tags
      if (category === 'Cereais e derivados') {
        if (/arroz/i.test(cleaned)) subCategory = 'Arroz';
        else if (/pão|pao/i.test(cleaned)) subCategory = 'Pães';
        else if (/macarrão|macarrao|lasanha/i.test(cleaned)) subCategory = 'Massas';
        else if (/aveia/i.test(cleaned)) subCategory = 'Aveia';
        else if (/biscoito|bolacha/i.test(cleaned)) subCategory = 'Biscoitos';
        else if (/farinha/i.test(cleaned)) subCategory = 'Farinhas';
        else subCategory = 'Cereais';
      }

      // Suplementos
      if (category === 'Suplementos') {
        if (/whey/i.test(cleaned)) subCategory = 'Proteína em pó';
        else if (/creatina/i.test(cleaned)) subCategory = 'Creatina';
        else subCategory = 'Suplemento';
      }

      // Primeira letra maiúscula
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

      return { name: cleaned, subCategory };
    }

    function computeNutritionalTags(calories, protein, carbs, fat, fiber, name, category) {
      const tags = [];
      const p = Number(protein) || 0;
      const c = Number(carbs) || 0;
      const g = Number(fat) || 0;
      const fib = Number(fiber) || 0;
      const kcal = Number(calories) || 0;
      const nameLower = (name || '').toLowerCase();

      // Proteína
      if (p >= 15) tags.push('alto-proteina');
      else if (p >= 6) tags.push('fonte-proteina');

      // Carboidrato
      if (c <= 0.5) tags.push('zero-carb');
      else if (c >= 20) tags.push('fonte-carboidrato');

      // Gordura
      if (g <= 0.5) tags.push('zero-gordura');
      else if (g >= 15) tags.push('fonte-gordura');

      // Fibras
      if (fib >= 3) tags.push('rico-fibras');

      // Açúcar (sem açúcar vs com açúcar)
      const isSugaryCategory = category === 'Produtos açucarados';
      const hasAddedSugarWord = nameLower.includes('açúcar') || nameLower.includes('acucar') || nameLower.includes('doce') || nameLower.includes('achocolatado') || nameLower.includes('recheado') || nameLower.includes('refrigerante tradicional') || nameLower.includes('coca-cola original');
      const isExplicitlyZeroSugar = nameLower.includes('sem açúcar') || nameLower.includes('sem acucar') || nameLower.includes('zero açúcar') || nameLower.includes('zero acucar') || nameLower.includes('zero');

      if (isSugaryCategory || hasAddedSugarWord) {
        if (!isExplicitlyZeroSugar) {
          tags.push('com-acucar');
        } else {
          tags.push('sem-acucar');
        }
      } else {
        if (category === 'Carnes e derivados' || category === 'Pescados e frutos do mar' || category === 'Ovos e derivados' || category === 'Gorduras e óleos' || category === 'Verduras, hortaliças e derivados' || c <= 1 || isExplicitlyZeroSugar) {
          tags.push('sem-acucar');
        }
      }

      // Baixa Caloria
      if (kcal <= 50) tags.push('baixa-caloria');

      return tags;
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
      existingByNorm.set(normalize(e.name), e);
      if (e.legacyId) existingByNorm.set(e.legacyId, e);
    });

    const tacoNormSet = new Set();
    const finalFoods = [];

    // 1. Processa todos os 597 alimentos da TACO com escrita natural, sub-tags e tags nutricionais
    tacoList.forEach(t => {
      let { name: cleanedName, subCategory } = cleanAndNaturalizeName(t.description, t.category);

      if (t.id === 468 && t.category === 'Leite e derivados') {
        cleanedName = 'Maria mole láctea';
      } else if (t.id === 504 && t.category === 'Produtos açucarados') {
        cleanedName = 'Maria mole doce tradicional';
      }

      const norm = normalize(cleanedName);
      tacoNormSet.add(norm);
      tacoNormSet.add(normalize(t.description));

      const matchExisting = existingByNorm.get(norm) || existingByNorm.get(normalize(t.description));

      const calories = parseNum(t.energy_kcal, 0);
      const protein = parseNum(t.protein_g, 1);
      const carbs = parseNum(t.carbohydrate_g, 1);
      const fat = parseNum(t.lipid_g, 1);
      const fiber = parseNum(t.fiber_g, 1);

      const tags = computeNutritionalTags(calories, protein, carbs, fat, fiber, cleanedName, t.category);

      finalFoods.push({
        id: 'taco-' + t.id,
        legacyId: matchExisting ? matchExisting.id : undefined,
        name: cleanedName,
        category: t.category,
        subCategory: subCategory || null,
        tags,
        source: 'TACO',
        caloriesPer100g: calories,
        proteinPer100g: protein,
        carbsPer100g: carbs,
        fatPer100g: fat,
        fiberPer100g: fiber,
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

    // 2. Adiciona alimentos suplementares/personalizados preservados
    let preservedCount = 0;
    existingFoods.forEach(e => {
      if (!e.id.startsWith('taco-')) {
        preservedCount++;
        const cat = e.category || guessCategory(e.name);
        let { name: cleanedName, subCategory } = cleanAndNaturalizeName(e.name, cat);

        const calories = parseNum(e.caloriesPer100g, 0);
        const protein = parseNum(e.proteinPer100g, 1);
        const carbs = parseNum(e.carbsPer100g, 1);
        const fat = parseNum(e.fatPer100g, 1);
        const fiber = parseNum(e.fiberPer100g, 1);
        const tags = computeNutritionalTags(calories, protein, carbs, fat, fiber, cleanedName, cat);

        finalFoods.push({
          id: e.id,
          name: cleanedName,
          category: cat,
          subCategory: subCategory || e.subCategory || null,
          tags,
          source: (cleanedName.toLowerCase().includes('whey') || cleanedName.toLowerCase().includes('creatina')) ? 'SUPPLEMENT' : (e.source || 'CUSTOM'),
          caloriesPer100g: calories,
          proteinPer100g: protein,
          carbsPer100g: carbs,
          fatPer100g: fat,
          fiberPer100g: fiber,
          micronutrients: e.micronutrients || null,
          isVerified: true
        });
      }
    });

    console.log(`TACO processados: ${tacoList.length}`);
    console.log(`Alimentos preservados: ${preservedCount}`);
    console.log(`Total final de alimentos: ${finalFoods.length}`);

    const jsonOutput = JSON.stringify(finalFoods, null, 2);
    fs.writeFileSync(targetExportPath, jsonOutput, 'utf8');
    fs.writeFileSync(targetWebPath, jsonOutput, 'utf8');
    if (fs.existsSync(path.dirname(targetLocalCache))) {
      fs.writeFileSync(targetLocalCache, jsonOutput, 'utf8');
    }

    console.log(`Base de dados regenerada com sucesso com sub-tags e tags nutricionais!`);
  });
});
