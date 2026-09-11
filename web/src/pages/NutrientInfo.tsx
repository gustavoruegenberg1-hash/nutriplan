import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Flame,
  Beef,
  Droplet,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  HeartPulse,
  Apple,
  Wheat,
} from 'lucide-react';

export type NutrientType = 'calories' | 'protein' | 'fat' | 'fiber' | 'carbs';

export interface NutrientGuide {
  id: NutrientType;
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  whatIsIt: string;
  whatIsItDetails: string[];
  whatIsItFor: string;
  mainFunctions: string[];
  whenLow: string;
  lowConsequences: string[];
  whenExcess: string;
  excessConsequences: string[];
  healthySources: string[];
  recommendationTip: string;
}

export const nutrientGuides: Record<NutrientType, NutrientGuide> = {
  calories: {
    id: 'calories',
    name: 'Calorias (Valor Energético)',
    subtitle: 'A moeda de energia que abastece o funcionamento do seu corpo',
    icon: Flame,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
    whatIsIt:
      'Caloria (kcal) é a unidade de medida da energia fornecida pelos alimentos. Cada macronutriente possui uma densidade calórica específica calculada pela fórmula Atwater: proteínas (4 kcal/g), carboidratos (4 kcal/g) e gorduras (9 kcal/g).',
    whatIsItDetails: [
      'Unidade que mede a energia química dos alimentos.',
      'Sua Taxa Metabólica Basal (TMB) é a quantidade mínima de calorias que seu corpo gasta em repouso absoluto.',
      'O Gasto Energético Total Diário (TDEE/GET) soma sua TMB à energia gasta com trabalho, digestão e treinos.',
    ],
    whatIsItFor:
      'As calorias fornecem o combustível indispensável para todas as reações celulares, respiração, batimentos cardíacos, atividade cerebral e desempenho nos treinos físicos.',
    mainFunctions: [
      'Manutenção das funções vitais em repouso (órgãos e cérebro).',
      'Fornecimento de energia para contração muscular e exercícios intensos.',
      'Termorregulação corporal e síntese de novos tecidos e hormônios.',
    ],
    whenLow:
      'Consumir calorias muito abaixo do gasto energético por tempo prolongado pode desencadear mecanismos de sobrevivência e perda de tecidos nobres.',
    lowConsequences: [
      'Perda de massa muscular (catabolismo acelerado).',
      'Fadiga física e mental crônica, fraqueza e tontura.',
      'Desaceleração da taxa metabólica (adaptação termogênica).',
      'Queda de rendimento nos treinos e perda de força.',
      'Alterações no humor, sono e regulação hormonal.',
    ],
    whenExcess:
      'Consumir calorias em excesso sem controle resulta em superávit acumulado, estocado em forma de tecido adiposo.',
    excessConsequences: [
      'Ganho indesejado de gordura corporal visceral e subcutânea.',
      'Sobrecarga cardiovascular e metabólica.',
      'Aumento da resistência à insulina a longo prazo se associado ao sedentarismo.',
      'Sensação de peso, letargia e piora na digestão.',
    ],
    healthySources: [
      'Fontes integrais e ricas em nutrientes (arroz integral, batata, aveia, ovos, carnes magras, azeite de oliva e frutas).',
    ],
    recommendationTip:
      'Para emagrecer com saúde, mantenha um déficit calórico moderado (15% a 20% abaixo do TDEE). Para hipertrofia, um superávit leve (10% a 15% acima do TDEE) maximiza ganhos musculares sem acúmulo excessivo de gordura.',
  },
  protein: {
    id: 'protein',
    name: 'Proteínas',
    subtitle: 'Os blocos fundamentais para a construção e manutenção dos músculos',
    icon: Beef,
    color: 'text-[#F43F5E]',
    bg: 'bg-[#F43F5E]/10',
    border: 'border-[#F43F5E]/30',
    whatIsIt:
      'Proteínas são macromoléculas compostas por cadeias de aminoácidos. O corpo humano necessita de aminoácidos essenciais (que não são produzidos pelo organismo e devem ser obtidos na alimentação diária).',
    whatIsItDetails: [
      'Compostas por 20 aminoácidos diferentes (sendo 9 essenciais).',
      'Fornecem 4 kcal por grama consumida.',
      'Possuem o maior efeito térmico dos alimentos (gasta cerca de 20-30% de suas calorias apenas para serem digeridas).',
    ],
    whatIsItFor:
      'Atuam como tijolos estruturais do corpo, essenciais para reparar as microlesões musculares provocadas pelos treinos de força e manter a integridade dos órgãos, pele, cabelo e sistema de defesa.',
    mainFunctions: [
      'Síntese e regeneração do tecido muscular esquelético (hipertrofia).',
      'Produção de enzimas digestivas, neurotransmissores e hormônios peptídicos.',
      'Formação de anticorpos e fortalecimento do sistema imunológico.',
      'Prolongamento da saciedade entre as refeições.',
    ],
    whenLow:
      'A ingestão insuficiente de proteínas impede o corpo de reparar os tecidos danificados, comprometendo a estética corporal e a saúde.',
    lowConsequences: [
      'Perda de massa muscular (sarcopenia e flacidez).',
      'Recuperação lenta e dores musculares excessivas pós-treino.',
      'Fraqueza, queda na imunidade e maior suscetibilidade a infecções.',
      'Fome constante e dificuldade no controle do apetite.',
      'Unhas fracas e queda de cabelo.',
    ],
    whenExcess:
      'Em indivíduos saudáveis, o consumo proteico elevado é seguro, mas consumos desproporcionais não trazem benefícios adicionais.',
    excessConsequences: [
      'Desconforto gástrico, sensação de estufamento ou constipação se não acompanhado de fibras e água.',
      'Calorias extras que podem dificultar o déficit calórico.',
      'Atenção especial recomendada apenas para indivíduos com doença renal crônica pré-existente.',
    ],
    healthySources: [
      'Peito de frango, ovos inteiros, clara de ovo, carne bovina magra (patinho), peixes (tilápia, atum, salmão), leite desnatado, iogurte grego e Whey Protein.',
    ],
    recommendationTip:
      'Para praticantes de musculação e atletas, a literatura científica recomenda entre 1.6g e 2.2g de proteína por kg de peso corporal ao dia, distribuídos em 3 a 5 refeições.',
  },
  fat: {
    id: 'fat',
    name: 'Gorduras (Lipídios)',
    subtitle: 'Fundamentais para a produção hormonal, absorção de vitaminas e saúde celular',
    icon: Droplet,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
    whatIsIt:
      'Gorduras são compostos orgânicos essenciais divididos principalmente em insaturadas (mono e poli-insaturadas), saturadas e trans. Cada grama de gordura fornece 9 kcal.',
    whatIsItDetails: [
      'Macronutriente mais denso em energia (9 kcal/g).',
      'Essenciais para a produção de colesterol bom e síntese de hormônios esteróides.',
      'As gorduras insaturadas (ômega-3 e azeite) são comprovadamente cardioprotetoras.',
    ],
    whatIsItFor:
      'As gorduras são indispensáveis para a fabricação de hormônios vitais (incluindo testosterona, estrogênio e cortisol), para a absorção das vitaminas lipossolúveis (A, D, E, K) e para a proteção dos órgãos.',
    mainFunctions: [
      'Produção e equilíbrio de hormônios anabólicos e reguladores.',
      'Veículo obrigatório para absorção e transporte das vitaminas A, D, E e K.',
      'Isolamento térmico e proteção mecânica contra choques em órgãos nobres.',
      'Estrutura fundamental da membrana de todas as células do corpo e do cérebro.',
    ],
    whenLow:
      'Dietas com gorduras extremamente baixas (abaixo de 0.5g/kg) podem desregular severamente o sistema hormonal e a absorção vitamínica.',
    lowConsequences: [
      'Queda drástica na produção natural de testosterona e outros hormônios.',
      'Deficiência clínica de vitaminas lipossolúveis (pele ressecada, queda de cabelo, imunidade baixa).',
      'Desregulação do ciclo menstrual em mulheres (risco de amenorreia).',
      'Fadiga mental, perda de foco e variações de humor.',
      'Maior suscetibilidade a processos inflamatórios.',
    ],
    whenExcess:
      'O excesso de gordura, especialmente de fontes ultraprocessadas ou saturadas em demasia, pode elevar o risco cardiovascular e dificultar o déficit calórico.',
    excessConsequences: [
      'Fácil extrapolação das metas calóricas diárias devido à sua alta densidade (9 kcal/g).',
      'Aumento do colesterol LDL e perfil lipídico desfavorável.',
      'Digestão lenta e sensação de estufamento gástrico pesado.',
    ],
    healthySources: [
      'Azeite de oliva extravirgem, abacate, pasta de amendoim, castanhas do Pará, nozes, amêndoas, gema de ovo e peixes gordos (salmão/sardinha).',
    ],
    recommendationTip:
      'Mantenha a ingestão diária de gorduras entre 0.7g e 1.0g por kg de peso corporal, priorizando fontes monoinsaturadas e poli-insaturadas ricas em Ômega-3.',
  },
  fiber: {
    id: 'fiber',
    name: 'Fibras Alimentares',
    subtitle: 'Essenciais para a saúde digestiva, controle da glicemia e microbiota intestinal',
    icon: Sparkles,
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/30',
    whatIsIt:
      'Fibras alimentares são carboidratos complexos de origem vegetal que não são digeridos pelas enzimas do trato gastrointestinal humano, divididas em solúveis e insolúveis.',
    whatIsItDetails: [
      'Fibras Solúveis: dissolvem-se em água formando um gel que desacelera a digestão e absorção de glicose.',
      'Fibras Insolúveis: aumentam o volume fecal e aceleram o trânsito intestinal.',
      'Não agregam calorias significativas diretas à dieta.',
    ],
    whatIsItFor:
      'Garantem o trânsito intestinal regular, atuam como alimento para as bactérias benéficas do intestino (efeito prebiótico), auxiliam no controle do colesterol sanguíneo e promovem saciedade duradoura.',
    mainFunctions: [
      'Regulação completa do trânsito intestinal prevenindo constipação.',
      'Alimentação das bactérias benéficas da microbiota intestinal (produção de ácidos graxos de cadeia curta).',
      'Redução da velocidade de absorção de carboidratos, evitando picos de glicose e insulina.',
      'Aumento da saciedade física ao reter água no estômago.',
    ],
    whenLow:
      'Ingestão baixa de fibras é uma das principais causas de problemas digestivos e dificuldade de adesão à dieta.',
    lowConsequences: [
      'Constipação intestinal, fezes ressecadas e desconforto abdominal.',
      'Picos rápidos de fome pouco tempo após as refeições.',
      'Oscilações acentuadas na glicemia pós-prandial.',
      'Piora da saúde da microbiota intestinal.',
    ],
    whenExcess:
      'Aumentar o consumo de fibras bruscamente ou consumir quantidades excessivas sem hidratação adequada pode causar desconfortos.',
    excessConsequences: [
      'Gases excessivos, inchaço abdominal e cólicas intestinais.',
      'Obstrução ou piora da constipação se não houver ingestão proporcional de água.',
      'Possível redução na absorção de minerais como zinco, ferro e cálcio.',
    ],
    healthySources: [
      'Aveia em flocos, sementes de chia e linhaça, feijão, lentilha, grão de bico, brócolis, maçã com casca, mamão e folhas verdes.',
    ],
    recommendationTip:
      'Aponte para uma meta entre 25g e 35g de fibras por dia para adultos. Aumente o consumo de forma gradual e beba pelo menos 35ml a 40ml de água por kg de peso para que as fibras desempenhem seu papel com perfeição.',
  },
  carbs: {
    id: 'carbs',
    name: 'Carboidratos',
    subtitle: 'A principal fonte de energia de rápida utilização para o cérebro e para o treino de alta intensidade',
    icon: Wheat,
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/30',
    whatIsIt:
      'Carboidratos são moléculas orgânicas compostas por carbono, hidrogênio e oxigênio, divididos em simples e complexos. Fornecem 4 kcal por grama.',
    whatIsItDetails: [
      'Fonte primária de glicose para o cérebro e sistema nervoso central.',
      'Armazenados nos músculos e fígado sob a forma de glicogênio muscular.',
      'Fornecem 4 kcal/g.',
    ],
    whatIsItFor:
      'São o combustível preferencial para atividades anaeróbicas intensas (como séries pesadas de musculação e sprints), preservando a massa muscular ao evitar o catabolismo proteico.',
    mainFunctions: [
      'Combustível de alta octanagem para treinos pesados de força.',
      'Manutenção dos estoques de glicogênio muscular e hepático.',
      'Poupar as proteínas para que sejam usadas exclusivamente na reparação muscular.',
      'Otimização do desempenho cognitivo e concentração.',
    ],
    whenLow:
      'Dietas muito restritas em carboidratos sem acompanhamento podem impactar a performance e a plenitude muscular.',
    lowConsequences: [
      'Perda de força, rendimento e resistência durante os treinos.',
      'Aspecto muscular "murcho" por menor retenção de glicogênio e água intracelular.',
      'Irritabilidade, névoa mental e dificuldade de foco.',
      'Recuperação mais demorada entre sessões de treino intenso.',
    ],
    whenExcess:
      'Consumo de carboidratos muito acima das necessidades do dia sem o devido gasto energético gerará superávit calórico.',
    excessConsequences: [
      'Ganho de gordura corporal por superávit calórico.',
      'Picos de sonolência pós-refeição se consumidos em excesso na forma simples.',
    ],
    healthySources: [
      'Arroz branco e integral, batata doce, batata inglesa, aveia, frutas frescas, mandioca (aipim) e pão integral.',
    ],
    recommendationTip:
      'Ajuste os carboidratos de acordo com o seu nível de atividade física e objetivo: maiores porções em dias de treino pesado e perto dos horários pré e pós-treino.',
  },
};

export const NutrientInfo: React.FC = () => {
  const { nutrient } = useParams<{ nutrient?: string }>();
  const navigate = useNavigate();

  const selectedNutrient: NutrientType =
    nutrient && nutrient in nutrientGuides
      ? (nutrient as NutrientType)
      : 'calories';

  const guide = nutrientGuides[selectedNutrient];
  const IconComponent = guide.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Botão de Voltar para a Página de Dieta */}
      <div>
        <Link
          to="/diet"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white text-xs font-bold border border-[#1F2937] transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para o Planejador de Dieta</span>
        </Link>
      </div>

      {/* Seletor de Nutrientes em Abas no Topo */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-2 flex flex-wrap gap-1.5 shadow-xl">
        {(['calories', 'protein', 'fat', 'fiber', 'carbs'] as NutrientType[]).map((type) => {
          const item = nutrientGuides[type];
          const ItemIcon = item.icon;
          const isActive = selectedNutrient === type;

          return (
            <button
              key={type}
              onClick={() => navigate(`/diet/info/${type}`)}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-[#1F2937]'
              }`}
            >
              <ItemIcon className="w-3.5 h-3.5" />
              <span>{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Card do Nutriente Selecionado */}
      <div className={`rounded-3xl p-6 sm:p-8 bg-[#111827] border ${guide.border} shadow-2xl space-y-4 relative overflow-hidden`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${guide.bg} ${guide.color} border border-[#1F2937]`}>
            <IconComponent className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Guia Nutricional Educativo
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{guide.name}</h1>
          </div>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {guide.subtitle}
        </p>
      </div>

      {/* Grid de Seções: O que é? & Para que serve? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* O que é? */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-extrabold text-white">O que é?</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{guide.whatIsIt}</p>
          <ul className="space-y-2 pt-2 border-t border-[#1F2937]">
            {guide.whatIsItDetails.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Para que serve? */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">Para que serve?</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{guide.whatIsItFor}</p>
          <ul className="space-y-2 pt-2 border-t border-[#1F2937]">
            {guide.mainFunctions.map((fn, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{fn}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grid de Seções: Quando consumir pouco? & Quando consumir demais? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quando consumir pouco? */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FBBF24]" />
            <h2 className="text-base font-extrabold text-white">Quando consumir pouco? (Riscos)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{guide.whenLow}</p>
          <div className="bg-[#0B0F17] rounded-2xl p-4 border border-[#1F2937] space-y-2">
            <span className="text-[11px] font-bold text-[#FBBF24] block uppercase">
              Consequências da Ingestão Insuficiente:
            </span>
            <ul className="space-y-1.5">
              {guide.lowConsequences.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-[#FBBF24] font-bold">&middot;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quando consumir demais? */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#FB7185]" />
            <h2 className="text-base font-extrabold text-white">Quando consumir demais? (Efeitos)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{guide.whenExcess}</p>
          <div className="bg-[#0B0F17] rounded-2xl p-4 border border-[#1F2937] space-y-2">
            <span className="text-[11px] font-bold text-[#FB7185] block uppercase">
              Efeitos do Consumo Excessivo:
            </span>
            <ul className="space-y-1.5">
              {guide.excessConsequences.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-[#FB7185] font-bold">&middot;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Fontes Saudáveis & Dica Prática */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#111827] to-[#111827] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-extrabold text-white">Fontes Recomendadas & Dica Prática</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1F2937] space-y-1.5">
            <span className="text-xs font-bold text-slate-300 uppercase block">Alimentos Fontes:</span>
            <p className="text-xs text-slate-300 leading-relaxed">{guide.healthySources.join(', ')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F17] border border-emerald-500/20 space-y-1.5">
            <span className="text-xs font-bold text-emerald-400 uppercase block">Dica NutriPlan:</span>
            <p className="text-xs text-slate-300 leading-relaxed">{guide.recommendationTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
