import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { foodService } from '../services/foodService';
import type { FoodItem } from '../types';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Flame,
  X,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Database,
  Target,
  Check,
  Loader2,
} from 'lucide-react';

export const DietPlanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Abas internas
  const validTabs = ['current', 'wizard', 'taco', 'balance'];
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'current';

  const [activeTab, setActiveTab] = useState<'current' | 'wizard' | 'taco' | 'balance'>(initialTab as any);

  // Dados da Dieta Ativa
  const [diets, setDiets] = useState<any[]>([]);
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modais de Dieta e Refeição
  const [isNewDietModalOpen, setIsNewDietModalOpen] = useState(false);
  const [newDietName, setNewDietName] = useState('');
  const [isNewMealModalOpen, setIsNewMealModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');

  // Modal de Adição de Alimento na Dieta Ativa
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [targetMealId, setTargetMealId] = useState<string | null>(null);
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [foodModalError, setFoodModalError] = useState<string | null>(null);
  const [foodSearchLoading, setFoodSearchLoading] = useState(false);

  // Edição inline de gramagem
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editGramsValue, setEditGramsValue] = useState<number>(100);

  // -------------------------------------------------------------
  // ESTADOS DO WIZARD DE MONTAGEM (8 ETAPAS)
  // -------------------------------------------------------------
  const [wizardStarted, setWizardStarted] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardGoal, setWizardGoal] = useState<'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_WEIGHT'>('LOSE_WEIGHT');
  const [wizardAge, setWizardAge] = useState<number>(25);
  const [wizardGender, setWizardGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [wizardWeight, setWizardWeight] = useState<number>(75);
  const [wizardHeight, setWizardHeight] = useState<number>(175);
  const [wizardActivity, setWizardActivity] = useState<string>('MODERATE');
  const [wizardMealsCount, setWizardMealsCount] = useState<number>(4);
  const [wizardRestrictions, setWizardRestrictions] = useState<string[]>([]);
  const [wizardGenerating, setWizardGenerating] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DA ABA BASE TACO
  // -------------------------------------------------------------
  const [tacoFoods, setTacoFoods] = useState<any[]>([]);
  const [tacoCategories, setTacoCategories] = useState<string[]>([]);
  const [tacoSearch, setTacoSearch] = useState('');
  const [tacoCategory, setTacoCategory] = useState('');
  const [tacoTag, setTacoTag] = useState('');
  const [tacoLoading, setTacoLoading] = useState(false);
  const [calcFood, setCalcFood] = useState<any | null>(null);
  const [calcGrams, setCalcGrams] = useState<number>(150);
  const [calculatedPortion, setCalculatedPortion] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dietsRes, profRes] = await Promise.all([
        api.get('/diets'),
        api.get('/profile').catch(() => ({ data: null })),
      ]);

      setDiets(dietsRes.data);
      if (profRes.data) {
        // Preenche defaults do wizard a partir do perfil
        if (profRes.data.profile) {
          if (profRes.data.profile.age) setWizardAge(profRes.data.profile.age);
          if (profRes.data.profile.gender) setWizardGender(profRes.data.profile.gender);
          if (profRes.data.profile.weight) setWizardWeight(profRes.data.profile.weight);
          if (profRes.data.profile.height) setWizardHeight(profRes.data.profile.height);
          if (profRes.data.profile.goal) setWizardGoal(profRes.data.profile.goal);
          if (profRes.data.profile.activityLevel) setWizardActivity(profRes.data.profile.activityLevel);
        }
      }

      if (dietsRes.data.length > 0) {
        const first = dietsRes.data[0];
        const detailRes = await api.get(`/diets/${first.id}`);
        setActiveDiet(detailRes.data);
      } else {
        setActiveDiet(null);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar informações de dieta.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sincroniza query params
  const handleTabChange = (tab: 'current' | 'wizard' | 'taco' | 'balance') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const selectDiet = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/diets/${id}`);
      setActiveDiet(res.data);
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao abrir dieta selecionada.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiet = async () => {
    if (!newDietName.trim()) return;
    try {
      const res = await api.post('/diets', { name: newDietName.trim(), isActive: true });
      setIsNewDietModalOpen(false);
      setNewDietName('');
      await loadData();
      setActiveDiet(res.data);
      setFeedback({ type: 'success', message: 'Nova dieta criada com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao criar nova dieta.' });
    }
  };

  const handleAddMeal = async () => {
    if (!newMealName.trim() || !activeDiet) return;
    try {
      const res = await api.post(`/diets/${activeDiet.id}/meals`, { name: newMealName.trim() });
      setActiveDiet(res.data);
      setIsNewMealModalOpen(false);
      setNewMealName('');
      setFeedback({ type: 'success', message: `Refeição "${newMealName}" adicionada!` });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao adicionar refeição.' });
    }
  };

  const handleRemoveMeal = async (mealId: string) => {
    if (!activeDiet) return;
    if (!confirm('Deseja realmente remover esta refeição e todos os seus alimentos?')) return;
    try {
      const res = await api.delete(`/diets/${activeDiet.id}/meals/${mealId}`);
      setActiveDiet(res.data);
      setFeedback({ type: 'success', message: 'Refeição removida com sucesso.' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao remover refeição.' });
    }
  };

  const openFoodSearch = async (mealId: string) => {
    setTargetMealId(mealId);
    setSelectedFood(null);
    setPortionGrams(100);
    setSearchFoodQuery('');
    setFoodModalError(null);
    setIsFoodModalOpen(true);
    setFoodSearchLoading(true);
    try {
      const popular = await foodService.getPopularFoods(30);
      setFoodResults(Array.isArray(popular) ? popular : []);
    } catch {
      setFoodResults(foodService.searchLocal('', 30));
    } finally {
      setFoodSearchLoading(false);
    }
  };

  const handleFoodSearchChange = async (query: string) => {
    setSearchFoodQuery(query);
    setFoodModalError(null);
    if (!query.trim()) {
      try {
        const popular = await foodService.getPopularFoods(30);
        setFoodResults(Array.isArray(popular) ? popular : []);
      } catch {
        setFoodResults(foodService.searchLocal('', 30));
      }
      return;
    }
    setFoodSearchLoading(true);
    try {
      const results = await foodService.searchFoods(query, 30);
      setFoodResults(Array.isArray(results) ? results : []);
    } catch {
      setFoodResults(foodService.searchLocal(query, 30));
    } finally {
      setFoodSearchLoading(false);
    }
  };

  const handleAddFoodToMeal = async () => {
    if (!selectedFood || !targetMealId || !activeDiet) {
      setFoodModalError('Selecione um alimento antes de adicionar.');
      return;
    }
    const grams = Number(portionGrams);
    if (isNaN(grams) || grams <= 0) {
      setFoodModalError('A quantidade em gramas deve ser um número maior que zero (ex: 100g).');
      return;
    }
    setIsAddingFood(true);
    setFoodModalError(null);
    try {
      const res = await api.post(`/diets/${activeDiet.id}/meals/${targetMealId}/foods`, {
        foodId: selectedFood.id,
        quantityGrams: grams,
      });
      setActiveDiet(res.data);
      setIsFoodModalOpen(false);
      setSelectedFood(null);
      setFeedback({
        type: 'success',
        message: `"${selectedFood.name}" (${grams}g) adicionado à refeição com sucesso! Totais calculados.`,
      });
    } catch (err: any) {
      setFoodModalError(
        err.response?.data?.message || 'Falha ao adicionar alimento à refeição. Verifique a conexão e tente novamente.'
      );
    } finally {
      setIsAddingFood(false);
    }
  };

  const handleSaveGramsEdit = async (mealId: string, mealFoodId: string) => {
    if (!activeDiet) return;
    const grams = Number(editGramsValue);
    if (isNaN(grams) || grams <= 0) {
      setFeedback({ type: 'error', message: 'A quantidade de alimento deve ser maior que zero (ex: 100g).' });
      return;
    }
    try {
      const res = await api.put(`/diets/${activeDiet.id}/meals/${mealId}/foods/${mealFoodId}`, {
        quantityGrams: grams,
      });
      setActiveDiet(res.data);
      setEditingItemId(null);
      setFeedback({ type: 'success', message: 'Quantidade atualizada e valores nutricionais recalculados!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao atualizar quantidade do alimento.' });
    }
  };

  const handleRemoveFood = async (mealId: string, mealFoodId: string) => {
    if (!activeDiet) return;
    try {
      const res = await api.delete(`/diets/${activeDiet.id}/meals/${mealId}/foods/${mealFoodId}`);
      setActiveDiet(res.data);
      setFeedback({ type: 'success', message: 'Alimento removido da refeição.' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao remover alimento.' });
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DO WIZARD (CÁLCULO E GERAÇÃO)
  // -------------------------------------------------------------
  // Estimativa Mifflin-St Jeor da Etapa 6
  const calcBmr = () => {
    if (wizardGender === 'MALE') {
      return 10 * wizardWeight + 6.25 * wizardHeight - 5 * wizardAge + 5;
    }
    return 10 * wizardWeight + 6.25 * wizardHeight - 5 * wizardAge - 161;
  };

  const activityFactors: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    INTENSE: 1.725,
    VERY_INTENSE: 1.9,
  };

  const bmr = Math.round(calcBmr());
  const factor = activityFactors[wizardActivity] || 1.55;
  const tdee = Math.round(bmr * factor);
  const targetCalories =
    wizardGoal === 'LOSE_WEIGHT'
      ? Math.max(1200, Math.round(tdee * 0.8))
      : wizardGoal === 'GAIN_WEIGHT'
      ? Math.round(tdee * 1.15)
      : tdee;

  const targetProteinGrams = Math.round(wizardWeight * (wizardGoal === 'GAIN_WEIGHT' ? 2.2 : 2.0));
  const targetFatGrams = Math.round((targetCalories * 0.25) / 9);
  const targetCarbsGrams = Math.max(0, Math.round((targetCalories - targetProteinGrams * 4 - targetFatGrams * 9) / 4));

  const handleFinishWizard = async () => {
    setWizardGenerating(true);
    setFeedback(null);
    try {
      // 1. Atualiza perfil do usuário com as escolhas
      await api.put('/profile', {
        age: wizardAge,
        gender: wizardGender,
        weight: wizardWeight,
        height: wizardHeight,
        activityLevel: wizardActivity,
        goal: wizardGoal,
      });

      // 2. Gera a proposta automática de dieta baseada na TACO
      const res = await api.post('/diets/generate-suggestion', {});
      await loadData();
      setActiveDiet(res.data);
      setActiveTab('current');
      setWizardStarted(false);
      setWizardStep(1);
      setFeedback({
        type: 'success',
        message: 'Dieta gerada com sucesso! Você pode editar qualquer refeição e alimento abaixo.',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao concluir montagem da dieta.' });
    } finally {
      setWizardGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // CARREGAMENTO DA ABA TACO
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab === 'taco') {
      const fetchTacoCategories = async () => {
        try {
          const res = await api.get('/foods/categories');
          setTacoCategories(res.data);
        } catch {
          // ignore
        }
      };
      fetchTacoCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'taco') {
      const fetchTaco = async () => {
        setTacoLoading(true);
        try {
          const res = await api.get('/foods', {
            params: {
              query: tacoSearch || undefined,
              category: tacoCategory || undefined,
              tag: tacoTag || undefined,
              limit: 40,
            },
          });
          setTacoFoods(res.data);
          if (!calcFood && res.data.length > 0) setCalcFood(res.data[0]);
        } catch {
          // ignore
        } finally {
          setTacoLoading(false);
        }
      };
      const t = setTimeout(fetchTaco, 200);
      return () => clearTimeout(t);
    }
  }, [activeTab, tacoSearch, tacoCategory, tacoTag]);

  // Recalcula simulador proporcional RN10
  useEffect(() => {
    if (!calcFood || calcGrams <= 0) {
      setCalculatedPortion(null);
      return;
    }
    const factor = calcGrams / (calcFood.referenceQuantity || 100);
    setCalculatedPortion({
      food: calcFood,
      grams: calcGrams,
      calories: Math.round(calcFood.calories * factor * 10) / 10,
      protein: Math.round(calcFood.protein * factor * 10) / 10,
      carbohydrates: Math.round(calcFood.carbohydrates * factor * 10) / 10,
      lipids: Math.round(calcFood.lipids * factor * 10) / 10,
      fiber: Math.round((calcFood.fiber || 0) * factor * 10) / 10,
      sodium: Math.round((calcFood.sodium || 0) * factor * 10) / 10,
    });
  }, [calcFood, calcGrams]);

  // Estado de carregamento inicial
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando plano nutricional e alimentos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* 1. Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="text-emerald-400" size={28} />
            <span>Nutrição & Planejamento de Dieta</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Planejamento calórico, distribuição de macronutrientes e base de alimentos da Tabela TACO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('wizard')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles size={15} />
            <span>Assistente Passo a Passo</span>
          </button>

          <button
            onClick={() => setIsNewDietModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Nova Dieta</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Navegação por Abas Internas Condensadas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('current')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'current'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Minha Dieta Atual
        </button>

        <button
          onClick={() => handleTabChange('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'wizard'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sparkles size={14} />
          <span>Montar Nova Dieta (8 Etapas)</span>
        </button>

        <button
          onClick={() => handleTabChange('taco')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'taco'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Database size={14} />
          <span>Base TACO & Alimentos</span>
        </button>

        <button
          onClick={() => handleTabChange('balance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'balance'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Target size={14} />
          <span>Metas & Balanço</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* ABA 1: MINHA DIETA ATUAL */}
      {/* ============================================================= */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {diets.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {diets.map((d) => (
                <button
                  key={d.id}
                  onClick={() => selectDiet(d.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeDiet?.id === d.id
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d.name} {d.isActive && '• Ativa'}
                </button>
              ))}
            </div>
          )}

          {!activeDiet ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <UtensilsCrossed size={48} className="mx-auto text-slate-600" />
              <h2 className="text-xl font-bold text-white">Nenhum plano de dieta ativo</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Você ainda não possui uma dieta estruturada. Utilize nosso assistente inteligente ou monte seu cardápio do zero.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => handleTabChange('wizard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
                >
                  Iniciar Montagem Passo a Passo
                </button>
                <button
                  onClick={() => setIsNewDietModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
                >
                  Criar em Branco
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card de Resumo Nutricional */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeDiet.name}</h2>
                    <p className="text-xs text-slate-400">{activeDiet.description || 'Plano nutricional diário'}</p>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Flame size={20} className="text-amber-400" />
                    <span>{activeDiet.totals.calories} kcal planejadas</span>
                  </div>
                </div>

                {/* Alertas de Incompatibilidade (RN12, RN17) */}
                {activeDiet.warnings && activeDiet.warnings.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      <span>Incompatibilidades Alimentares Detectadas:</span>
                    </div>
                    {activeDiet.warnings.map((w: string, idx: number) => (
                      <div key={idx} className="pl-5">• {w}</div>
                    ))}
                  </div>
                )}

                {/* Macros da Dieta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Calorias Totais</span>
                    <div className="text-xl font-extrabold text-white mt-0.5">{activeDiet.totals.calories} kcal</div>
                    <span className="text-[11px] text-slate-500">
                      Meta: {activeDiet.targetComparison?.targets?.calories || '--'} kcal
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Proteínas</span>
                    <div className="text-xl font-extrabold text-sky-400 mt-0.5">{activeDiet.totals.protein}g</div>
                    <span className="text-[11px] text-slate-500">
                      Meta: {activeDiet.targetComparison?.targets?.proteinGrams || '--'}g
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Carboidratos</span>
                    <div className="text-xl font-extrabold text-amber-400 mt-0.5">{activeDiet.totals.carbs}g</div>
                    <span className="text-[11px] text-slate-500">
                      Meta: {activeDiet.targetComparison?.targets?.carbsGrams || '--'}g
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Gorduras Totais</span>
                    <div className="text-xl font-extrabold text-rose-400 mt-0.5">{activeDiet.totals.fat}g</div>
                    <span className="text-[11px] text-slate-500">
                      Meta: {activeDiet.targetComparison?.targets?.fatGrams || '--'}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Refeições */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Refeições Estruturadas</h3>
                  <button
                    onClick={() => setIsNewMealModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Adicionar Refeição</span>
                  </button>
                </div>

                {activeDiet.meals.map((meal: any) => (
                  <div key={meal.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white text-base">{meal.name}</h4>
                        <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-full font-medium">
                          {meal.totals.calories} kcal • {meal.totals.protein}g P • {meal.totals.carbs}g C • {meal.totals.fat}g G
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => openFoodSearch(meal.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-500/20"
                        >
                          <Plus size={14} />
                          <span>Adicionar Alimento</span>
                        </button>
                        <button
                          onClick={() => handleRemoveMeal(meal.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Excluir refeição"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {meal.items.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-slate-800/20 border border-slate-800/60 text-slate-500 text-xs space-y-1">
                        <p>Nenhum alimento nesta refeição.</p>
                        <p className="text-[11px] text-slate-600">Clique em "+ Adicionar Alimento" para pesquisar na tabela TACO.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {meal.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-sm flex flex-wrap items-center gap-2">
                                <span>{item.name}</span>
                                {item.warnings && item.warnings.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                    Atenção: Restrição
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-[11px] block mt-0.5">{item.category}</span>
                            </div>

                            {/* Controles de Quantidade, Nutrientes e Ações */}
                            <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                              {/* Edição de Quantidade em Gramas */}
                              {editingItemId === item.id ? (
                                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-emerald-500/50">
                                  <input
                                    type="number"
                                    min={1}
                                    max={2000}
                                    value={editGramsValue || ''}
                                    onChange={(e) => setEditGramsValue(Number(e.target.value))}
                                    className="w-16 bg-slate-800 rounded px-2 py-1 text-white font-bold text-center text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    autoFocus
                                  />
                                  <span className="text-slate-400 text-xs">g</span>
                                  <button
                                    onClick={() => handleSaveGramsEdit(meal.id, item.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-xs">
                                    {item.quantityGrams}g
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingItemId(item.id);
                                      setEditGramsValue(item.quantityGrams);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition flex items-center gap-1 text-[11px]"
                                    title="Editar quantidade em gramas"
                                  >
                                    <Edit2 size={13} />
                                    <span>Editar</span>
                                  </button>
                                </div>
                              )}

                              <div className="text-right px-2 min-w-[130px]">
                                <span className="font-extrabold text-white text-xs block">{item.nutrients.calories} kcal</span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {item.nutrients.protein}g P • {item.nutrients.carbs}g C • {item.nutrients.fat}g G
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveFood(meal.id, item.id)}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Remover alimento da refeição"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Aviso Legal de Saúde */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-slate-400 text-xs">
                <Info size={18} className="shrink-0 text-slate-500 mt-0.5" />
                <p className="leading-relaxed">{activeDiet.legalDisclaimer}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 2: WIZARD DE MONTAGEM DE DIETA (8 ETAPAS) */}
      {/* ============================================================= */}
      {activeTab === 'wizard' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {!wizardStarted ? (
            /* Tela Inicial do Assistente (conforme especificação da seção 7) */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-emerald-500/20">
                <Sparkles size={32} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  MONTE SUA DIETA
                </h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                  Você irá montar seu planejamento alimentar passo a passo de forma simples e personalizada, com cálculo científico de calorias e distribuição de alimentos da Tabela TACO.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs max-w-xl mx-auto">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-emerald-400 block">1. Objetivo</strong>
                  <span className="text-slate-400">Déficit ou superávit</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-emerald-400 block">2. Antropometria</strong>
                  <span className="text-slate-400">Mifflin-St Jeor</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-emerald-400 block">3. Refeições</strong>
                  <span className="text-slate-400">Fracionamento diário</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-emerald-400 block">4. TACO 744</strong>
                  <span className="text-slate-400">Cardápio real</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setWizardStarted(true)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-base transition shadow-xl shadow-emerald-500/25 active:scale-95"
                >
                  [ INICIAR MONTAGEM ]
                </button>
              </div>
            </div>
          ) : (
            /* Fluxo das 8 Etapas */
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              {/* Indicador Visual de Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Etapa {wizardStep} de 8</span>
                  <span className="text-slate-400">
                    {wizardStep === 1 && 'Objetivo Nutricional'}
                    {wizardStep === 2 && 'Dados Corporais'}
                    {wizardStep === 3 && 'Nível de Atividade Física'}
                    {wizardStep === 4 && 'Número de Refeições Desejadas'}
                    {wizardStep === 5 && 'Preferências & Restrições'}
                    {wizardStep === 6 && 'Estimativa de Calorias & Macros'}
                    {wizardStep === 7 && 'Proposta Inicial de Refeições'}
                    {wizardStep === 8 && 'Conclusão & Personalização'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${(wizardStep / 8) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Conteúdo de cada Etapa */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 1: Qual é o seu objetivo principal?</h3>
                  <p className="text-xs text-slate-400">O balanço calórico será ajustado de acordo com a sua meta.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'LOSE_WEIGHT', title: 'Emagrecimento', desc: 'Déficit calórico moderado para queima de gordura' },
                      { id: 'MAINTAIN', title: 'Manutenção', desc: 'Equilíbrio normocalórico para estabilidade de peso' },
                      { id: 'GAIN_WEIGHT', title: 'Hipertrofia', desc: 'Superávit calórico controlado para ganho de massa magra' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setWizardGoal(item.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                          wizardGoal === item.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 2: Informe seus dados corporais</h3>
                  <p className="text-xs text-slate-400">Usado para calcular a Taxa Metabólica Basal (Mifflin-St Jeor).</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Idade (anos)</label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={wizardAge}
                        onChange={(e) => setWizardAge(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sexo Biológico</label>
                      <select
                        value={wizardGender}
                        onChange={(e) => setWizardGender(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="MALE">Masculino</option>
                        <option value="FEMALE">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Peso Atual (kg)</label>
                      <input
                        type="number"
                        min={30}
                        max={300}
                        value={wizardWeight}
                        onChange={(e) => setWizardWeight(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Altura (cm)</label>
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={wizardHeight}
                        onChange={(e) => setWizardHeight(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 3: Nível de atividade física semanal</h3>
                  <p className="text-xs text-slate-400">Determina o Gasto Energético Total Diário (GET / TDEE).</p>

                  <div className="space-y-2">
                    {[
                      { id: 'SEDENTARY', title: 'Sedentário', desc: 'Pouco ou nenhum exercício semanal' },
                      { id: 'LIGHT', title: 'Levemente Ativo', desc: 'Exercício leve 1 a 3 dias por semana' },
                      { id: 'MODERATE', title: 'Moderadamente Ativo', desc: 'Exercício moderado 3 a 5 dias por semana' },
                      { id: 'INTENSE', title: 'Altamente Ativo', desc: 'Exercício intenso 6 a 7 dias por semana' },
                      { id: 'VERY_INTENSE', title: 'Extremamente Ativo', desc: 'Treinos intensos bidiários ou trabalho braçal pesado' },
                    ].map((lvl) => (
                      <div
                        key={lvl.id}
                        onClick={() => setWizardActivity(lvl.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          wizardActivity === lvl.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm">{lvl.title}</div>
                          <div className="text-xs text-slate-400">{lvl.desc}</div>
                        </div>
                        {wizardActivity === lvl.id && <Check size={18} className="text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 4: Quantas refeições deseja fazer ao dia?</h3>
                  <p className="text-xs text-slate-400">O total de calorias e proteínas será distribuído proporcionalmente.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[3, 4, 5, 6].map((num) => (
                      <div
                        key={num}
                        onClick={() => setWizardMealsCount(num)}
                        className={`p-5 rounded-2xl border text-center cursor-pointer transition ${
                          wizardMealsCount === num
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl font-black block">{num}</span>
                        <span className="text-xs text-slate-400">refeições/dia</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 5: Preferências e Restrições Alimentares</h3>
                  <p className="text-xs text-slate-400">Alertas de incompatibilidade alimentar serão emitidos (RN12/RN17).</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'VEGETARIAN', label: 'Vegetariano' },
                      { id: 'VEGAN', label: 'Vegano' },
                      { id: 'GLUTEN_FREE', label: 'Sem Glúten (Celíaco)' },
                      { id: 'LACTOSE_FREE', label: 'Sem Lactose' },
                    ].map((item) => {
                      const isChecked = wizardRestrictions.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isChecked) {
                              setWizardRestrictions(wizardRestrictions.filter((r) => r !== item.id));
                            } else {
                              setWizardRestrictions([...wizardRestrictions, item.id]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500 text-white font-semibold'
                              : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isChecked && <Check size={16} className="text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 6: Estimativa Calculada de Calorias e Macros</h3>
                  <p className="text-xs text-slate-400">
                    Valores calculados cientificamente por Mifflin-St Jeor para atingir sua meta.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Taxa Basal (TMB)</span>
                      <div className="text-xl font-extrabold text-white mt-1">{bmr} kcal</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Gasto Diário (GET)</span>
                      <div className="text-xl font-extrabold text-white mt-1">{tdee} kcal</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Meta Calórica</span>
                      <div className="text-xl font-extrabold text-emerald-400 mt-1">{targetCalories} kcal</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Fracionamento</span>
                      <div className="text-xl font-extrabold text-teal-400 mt-1">{wizardMealsCount} refeições</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-sky-400 font-bold block text-base">{targetProteinGrams}g</span>
                      <span className="text-slate-400">Proteínas (4 kcal/g)</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold block text-base">{targetCarbsGrams}g</span>
                      <span className="text-slate-400">Carboidratos (4 kcal/g)</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-bold block text-base">{targetFatGrams}g</span>
                      <span className="text-slate-400">Gorduras (9 kcal/g)</span>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 7: Proposta Inicial de Refeições</h3>
                  <p className="text-xs text-slate-400">
                    O gerador inteligente selecionará alimentos compatíveis da base TACO distribuídos em {wizardMealsCount} refeições equilibradas.
                  </p>

                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Database size={16} className="text-emerald-400" />
                      <span>Alimentos reais da Tabela Brasileira de Composição de Alimentos (TACO):</span>
                    </div>
                    <p>• Café da Manhã: Ovos, Pão Integral, Café, Queijo Minas</p>
                    <p>• Almoço: Arroz Integral, Feijão Carioca, Peito de Frango Grelhado, Salada</p>
                    <p>• Lanche da Tarde: Iogurte Natural, Aveia em Flocos, Fruta</p>
                    <p>• Jantar: Proteína magra, carboidrato complexo e legumes cozidos</p>
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Etapa 8: Concluir e Salvar Dieta Ativa</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Ao confirmar, a dieta será gravada como seu plano ativo. Você poderá editar, trocar ou adicionar qualquer alimento a qualquer momento.
                  </p>
                  <button
                    onClick={handleFinishWizard}
                    disabled={wizardGenerating}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition shadow-xl shadow-emerald-500/25 disabled:opacity-50"
                  >
                    {wizardGenerating ? 'Gerando Plano Nutricional...' : '[ VER MINHA DIETA ]'}
                  </button>
                </div>
              )}

              {/* Botões de Avançar e Voltar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {wizardStep > 1 ? (
                  <button
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Voltar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setWizardStarted(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition"
                  >
                    Cancelar
                  </button>
                )}

                {wizardStep < 8 && (
                  <button
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 ml-auto"
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 3: BASE TACO & ALIMENTOS */}
      {/* ============================================================= */}
      {activeTab === 'taco' && (
        <div className="space-y-6">
          {/* Header da TACO com Simulador de Porção (RN10) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Calculator size={20} />
                <span>Simulador Proporcional de Porção (RN10)</span>
              </div>
              <span className="text-xs text-slate-400">
                Fórmula: <code className="text-emerald-300 bg-slate-800 px-2 py-0.5 rounded">Nutriente = Ref × Gramas / 100</code>
              </span>
            </div>

            {calculatedPortion && calcFood && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="sm:col-span-1">
                  <span className="text-xs text-slate-400">Alimento em Análise:</span>
                  <div className="font-bold text-white text-sm mt-0.5">{calcFood.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-xs text-slate-400">Gramas:</label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={calcGrams}
                      onChange={(e) => setCalcGrams(Number(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs text-center"
                    />
                    <span className="text-xs text-slate-400">g</span>
                  </div>
                </div>

                <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60">
                    <span className="text-emerald-400 font-extrabold text-base block">
                      {calculatedPortion.calories} kcal
                    </span>
                    <span className="text-slate-400">Calorias</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60">
                    <span className="text-sky-400 font-extrabold text-base block">
                      {calculatedPortion.protein}g
                    </span>
                    <span className="text-slate-400">Proteína</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60">
                    <span className="text-amber-400 font-extrabold text-base block">
                      {calculatedPortion.carbohydrates}g
                    </span>
                    <span className="text-slate-400">Carboidratos</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60">
                    <span className="text-rose-400 font-extrabold text-base block">
                      {calculatedPortion.lipids}g
                    </span>
                    <span className="text-slate-400">Gorduras</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtros e Busca de Alimentos TACO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={tacoSearch}
                onChange={(e) => setTacoSearch(e.target.value)}
                placeholder="Buscar na base TACO (ex: peito de frango, feijão, arroz...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={tacoCategory}
              onChange={(e) => setTacoCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todas as Categorias</option>
              {tacoCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={tacoTag}
              onChange={(e) => setTacoTag(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todas as Propriedades</option>
              <option value="vegetarian">Vegetariano</option>
              <option value="vegan">Vegano</option>
              <option value="glutenFree">Sem Glúten</option>
              <option value="lactoseFree">Sem Lactose</option>
            </select>
          </div>

          {/* Lista de Alimentos da Base TACO */}
          {tacoLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tacoFoods.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              Nenhum alimento encontrado na busca.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tacoFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setCalcFood(food)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    calcFood?.id === food.id
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{food.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {food.category} • {food.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 text-sm">{food.calories} kcal</span>
                    <div className="text-[10px] text-slate-400">
                      {food.protein}g P • {food.carbohydrates}g C • {food.lipids}g G
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 4: METAS & BALANÇO */}
      {/* ============================================================= */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {!activeDiet ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
              Monte ou selecione uma dieta ativa para comparar o balanço de metas.
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Target size={20} className="text-emerald-400" />
                <span>Comparativo de Atingimento de Metas (Planejado vs Meta)</span>
              </h3>

              <div className="space-y-4">
                {[
                  {
                    label: 'Calorias Totais',
                    current: activeDiet.totals.calories,
                    target: activeDiet.targetComparison?.targets?.calories || 2000,
                    unit: 'kcal',
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Proteínas',
                    current: activeDiet.totals.protein,
                    target: activeDiet.targetComparison?.targets?.proteinGrams || 150,
                    unit: 'g',
                    color: 'bg-sky-500',
                  },
                  {
                    label: 'Carboidratos',
                    current: activeDiet.totals.carbs,
                    target: activeDiet.targetComparison?.targets?.carbsGrams || 200,
                    unit: 'g',
                    color: 'bg-amber-500',
                  },
                  {
                    label: 'Gorduras',
                    current: activeDiet.totals.fat,
                    target: activeDiet.targetComparison?.targets?.fatGrams || 60,
                    unit: 'g',
                    color: 'bg-rose-500',
                  },
                ].map((item, idx) => {
                  const pct = Math.min(150, Math.round((item.current / (item.target || 1)) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-200">{item.label}</span>
                        <span className="text-slate-400">
                          <strong>{item.current}</strong> / {item.target} {item.unit} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-300`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE BUSCA DE ALIMENTOS TACO NA REFEIÇÃO */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Search size={16} className="text-emerald-400" />
                <span>Adicionar Alimento (Tabela TACO)</span>
              </h3>
              <button
                onClick={() => {
                  setIsFoodModalOpen(false);
                  setFoodModalError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 bg-slate-900 space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchFoodQuery}
                  onChange={(e) => handleFoodSearchChange(e.target.value)}
                  placeholder="Pesquisar alimento (ex: Arroz, Frango, Feijão, Ovo...)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  autoFocus
                />
                {foodSearchLoading && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin" size={16} />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Selecione um alimento da base oficial para configurar a quantidade e calcular os macronutrientes.
              </p>
            </div>

            {/* Lista de Alimentos Encontrados */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[220px]">
              {foodResults.length === 0 && !foodSearchLoading ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <UtensilsCrossed size={32} className="mx-auto text-slate-600" />
                  <p>Nenhum alimento encontrado para "{searchFoodQuery}".</p>
                  <p className="text-[11px] text-slate-600">Tente buscar por termos simples como "arroz", "frango" ou "leite".</p>
                </div>
              ) : (
                foodResults.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                        setFoodModalError(null);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs gap-3 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{food.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">{food.category}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-emerald-400 text-sm block">
                          {food.caloriesPer100g} kcal
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatPer100g}g G
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <button
                          type="button"
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-700 hover:bg-emerald-600 hover:text-slate-950 text-slate-200'
                          }`}
                        >
                          {isSelected ? 'Selecionado' : 'Selecionar'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Painel de Quantidade e Confirmação */}
            {selectedFood && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-3xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Alimento Selecionado:</span>
                    <div className="font-bold text-emerald-400 text-sm">{selectedFood.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-slate-300 font-semibold text-xs">Quantidade:</label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={portionGrams || ''}
                      onChange={(e) => {
                        setPortionGrams(Number(e.target.value));
                        setFoodModalError(null);
                      }}
                      className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-center text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-slate-400 font-semibold">gramas</span>
                  </div>
                </div>

                {/* Prévia Nutricional Proporcional */}
                {portionGrams > 0 && (
                  <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Calorias</span>
                      <strong className="text-emerald-400">
                        {Math.round((selectedFood.caloriesPer100g * portionGrams) / 100)} kcal
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Proteína</span>
                      <strong className="text-sky-400">
                        {((selectedFood.proteinPer100g * portionGrams) / 100).toFixed(1)}g
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Carboidratos</span>
                      <strong className="text-amber-400">
                        {((selectedFood.carbsPer100g * portionGrams) / 100).toFixed(1)}g
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gorduras</span>
                      <strong className="text-rose-400">
                        {((selectedFood.fatPer100g * portionGrams) / 100).toFixed(1)}g
                      </strong>
                    </div>
                  </div>
                )}

                {/* Alerta de Erro com Retry */}
                {foodModalError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                      <span>{foodModalError}</span>
                    </div>
                    <button
                      onClick={handleAddFoodToMeal}
                      className="px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-white font-bold text-[11px] shrink-0 transition"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddFoodToMeal}
                  disabled={isAddingFood || !portionGrams || portionGrams <= 0}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isAddingFood ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Adicionando Alimento...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>ADICIONAR À REFEIÇÃO ({portionGrams || 0}g)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NOVA DIETA */}
      {isNewDietModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Criar Novo Plano de Dieta</h3>
            <input
              type="text"
              value={newDietName}
              onChange={(e) => setNewDietName(e.target.value)}
              placeholder="Nome da Dieta (ex: Hipertrofia 2800 kcal)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsNewDietModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDiet}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Criar Dieta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA REFEIÇÃO */}
      {isNewMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Adicionar Refeição</h3>
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="Nome da refeição (ex: Ceia, Pré-Treino, Almoço)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsNewMealModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMeal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Salvar Refeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
