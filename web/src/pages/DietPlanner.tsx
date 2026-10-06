import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const DietPlanner: React.FC = () => {
  const [diets, setDiets] = useState<any[]>([]);
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Adição de Alimento
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [targetMealId, setTargetMealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);

  // Modal de Nova Dieta
  const [isNewDietModalOpen, setIsNewDietModalOpen] = useState(false);
  const [newDietName, setNewDietName] = useState('');

  // Modal de Nova Refeição
  const [isNewMealModalOpen, setIsNewMealModalOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');

  // Edição rápida de gramas inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editGramsValue, setEditGramsValue] = useState<number>(100);

  const loadDiets = async () => {
    try {
      const res = await api.get('/diets');
      setDiets(res.data);

      if (res.data.length > 0) {
        const first = res.data[0];
        const detailRes = await api.get(`/diets/${first.id}`);
        setActiveDiet(detailRes.data);
      } else {
        setActiveDiet(null);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar planos de dieta.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiets();
  }, []);

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
      await loadDiets();
      setActiveDiet(res.data);
      setFeedback({ type: 'success', message: 'Nova dieta criada com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao criar nova dieta.' });
    }
  };

  const handleGenerateSuggestion = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.post('/diets/generate-suggestion', {});
      await loadDiets();
      setActiveDiet(res.data);
      setFeedback({
        type: 'success',
        message: 'Proposta de dieta gerada com alimentos reais da TACO! Você pode editar qualquer refeição.',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao gerar proposta automática.' });
    } finally {
      setLoading(false);
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
    if (!confirm('Deseja realmente remover esta refeição e seus alimentos?')) return;
    try {
      const res = await api.delete(`/diets/${activeDiet.id}/meals/${mealId}`);
      setActiveDiet(res.data);
      setFeedback({ type: 'success', message: 'Refeição removida com sucesso.' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao remover refeição.' });
    }
  };

  const openFoodSearch = (mealId: string) => {
    setTargetMealId(mealId);
    setSelectedFood(null);
    setPortionGrams(100);
    setSearchQuery('');
    setFoodResults(foodService.getPopularFoods(30) as any);
    setIsFoodModalOpen(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFoodResults(foodService.getPopularFoods(30) as any);
    } else {
      setFoodResults(foodService.searchLocal(query, 30));
    }
  };

  const handleAddFoodToMeal = async () => {
    if (!selectedFood || !targetMealId || !activeDiet || portionGrams <= 0) return;

    try {
      const res = await api.post(`/diets/${activeDiet.id}/meals/${targetMealId}/foods`, {
        foodId: selectedFood.id,
        quantityGrams: portionGrams,
      });
      setActiveDiet(res.data);
      setIsFoodModalOpen(false);
      setSelectedFood(null);
      setFeedback({ type: 'success', message: `"${selectedFood.name}" (${portionGrams}g) adicionado à refeição!` });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFeedback({ type: 'error', message: msg || 'Falha ao adicionar alimento.' });
    }
  };

  const handleSaveGramsEdit = async (mealId: string, mealFoodId: string) => {
    if (!activeDiet || editGramsValue <= 0) return;
    try {
      const res = await api.put(`/diets/${activeDiet.id}/meals/${mealId}/foods/${mealFoodId}`, {
        quantityGrams: editGramsValue,
      });
      setActiveDiet(res.data);
      setEditingItemId(null);
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao atualizar quantidade.' });
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12 text-slate-100">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <UtensilsCrossed className="text-emerald-400" size={28} />
            <span>Planejador de Dieta & Nutrição</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Distribua alimentos da base TACO entre as refeições e acompanhe os macronutrientes calculados em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateSuggestion}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles size={16} />
            <span>Gerar Sugestão Assistida</span>
          </button>
          <button
            onClick={() => setIsNewDietModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus size={16} />
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
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Seletor de Dietas */}
      {diets.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {diets.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDiet(d.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
                activeDiet?.id === d.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d.name} {d.isActive && '• Ativa'}
            </button>
          ))}
        </div>
      )}

      {!activeDiet ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <UtensilsCrossed size={48} className="mx-auto text-slate-600" />
          <h2 className="text-xl font-bold text-white">Nenhuma dieta encontrada</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Comece gerando uma proposta assistida com alimentos balanceados ou crie um novo plano do zero.
          </p>
          <button
            onClick={handleGenerateSuggestion}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition"
          >
            Gerar Sugestão Automática
          </button>
        </div>
      ) : (
        <>
          {/* Card de Resumo Nutricional Diário */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-white">{activeDiet.name}</h2>
                <p className="text-xs text-slate-400">{activeDiet.description || 'Plano nutricional personalizado'}</p>
              </div>
              <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Flame size={20} className="text-amber-400" />
                <span>{activeDiet.totals.calories} kcal planejadas</span>
              </div>
            </div>

            {/* Comparativo de Metas e Alertas de Restrição */}
            {activeDiet.warnings && activeDiet.warnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>Alertas de Incompatibilidade Alimentar (RN12, RN17):</span>
                </div>
                {activeDiet.warnings.map((w: string, idx: number) => (
                  <div key={idx} className="pl-5">• {w}</div>
                ))}
              </div>
            )}

            {activeDiet.targetComparison && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Calorias Totais</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {activeDiet.totals.calories} / {activeDiet.targetComparison.targets.calories} kcal
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {activeDiet.targetComparison.percentageMet.calories}% da meta
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Proteínas Totais</span>
                  <div className="text-lg font-bold text-sky-400 mt-0.5">
                    {activeDiet.totals.protein}g / {activeDiet.targetComparison.targets.proteinGrams}g
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {activeDiet.targetComparison.percentageMet.protein}% da meta
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Carboidratos</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {activeDiet.totals.carbs}g / {activeDiet.targetComparison.targets.carbsGrams}g
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {activeDiet.targetComparison.percentageMet.carbs}% da meta
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Gorduras Totais</span>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">
                    {activeDiet.totals.fat}g / {activeDiet.targetComparison.targets.fatGrams}g
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {activeDiet.targetComparison.percentageMet.fat}% da meta
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Refeições da Dieta */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Refeições do Dia</h3>
              <button
                onClick={() => setIsNewMealModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Adicionar Refeição</span>
              </button>
            </div>

            {activeDiet.meals.map((meal: any) => (
              <div key={meal.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white text-base">{meal.name}</h4>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {meal.totals.calories} kcal • {meal.totals.protein}g P • {meal.totals.carbs}g C • {meal.totals.fat}g G
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openFoodSearch(meal.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Adicionar Alimento</span>
                    </button>
                    <button
                      onClick={() => handleRemoveMeal(meal.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Excluir refeição"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {meal.items.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Nenhum alimento inserido nesta refeição. Clique em "Adicionar Alimento" para buscar na base TACO.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {meal.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.warnings && item.warnings.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                Alerta de Restrição
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">{item.category}</span>
                        </div>

                        {/* Edição da Gramagem */}
                        <div className="flex items-center gap-4">
                          {editingItemId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={2000}
                                value={editGramsValue}
                                onChange={(e) => setEditGramsValue(Number(e.target.value))}
                                className="w-20 bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                              />
                              <span className="text-slate-400">g</span>
                              <button
                                onClick={() => handleSaveGramsEdit(meal.id, item.id)}
                                className="px-2 py-1 bg-emerald-600 text-slate-950 font-bold rounded text-xs"
                              >
                                Ok
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditGramsValue(item.quantityGrams);
                              }}
                              className="cursor-pointer hover:bg-slate-700/60 px-2 py-1 rounded flex items-center gap-1 text-slate-300"
                              title="Clique para editar gramagem"
                            >
                              <span className="font-bold">{item.quantityGrams}g</span>
                              <Edit2 size={12} className="text-slate-400" />
                            </div>
                          )}

                          <div className="text-right min-w-[120px]">
                            <span className="font-bold text-white">{item.nutrients.calories} kcal</span>
                            <div className="text-[11px] text-slate-400">
                              {item.nutrients.protein}g P • {item.nutrients.carbs}g C • {item.nutrients.fat}g G
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFood(meal.id, item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            title="Remover alimento"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Aviso Legal de Saúde (RN27, Seção 41) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-slate-400 text-xs">
            <Info size={18} className="shrink-0 text-slate-500 mt-0.5" />
            <p className="leading-relaxed">{activeDiet.legalDisclaimer}</p>
          </div>
        </>
      )}

      {/* MODAL DE BUSCA DE ALIMENTOS TACO */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Search size={18} className="text-emerald-400" />
                <span>Selecionar Alimento da Tabela TACO</span>
              </h3>
              <button onClick={() => setIsFoodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar por alimento (ex: arroz, peito de frango, feijão, aveia...)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Alimentos com scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {foodResults.map((food) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{food.name}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {food.category} • {food.source}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 text-sm">{food.caloriesPer100g} kcal</span>
                      <div className="text-[11px] text-slate-400">
                        {food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatPer100g}g G
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantidade e Confirmação */}
            {selectedFood && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Alimento selecionado:</span>
                    <div className="font-bold text-sm text-emerald-400">{selectedFood.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300">Porção:</label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={portionGrams}
                      onChange={(e) => setPortionGrams(Number(e.target.value))}
                      className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm text-center"
                    />
                    <span className="text-xs text-slate-400">gramas</span>
                  </div>
                </div>

                <button
                  onClick={handleAddFoodToMeal}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm transition"
                >
                  Confirmar e Adicionar à Refeição
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
            <h3 className="font-bold text-white text-lg">Criar Novo Plano de Dieta</h3>
            <input
              type="text"
              value={newDietName}
              onChange={(e) => setNewDietName(e.target.value)}
              placeholder="Nome da Dieta (ex: Hipertrofia 2800 kcal)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsNewDietModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDiet}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-sm font-bold"
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
            <h3 className="font-bold text-white text-lg">Adicionar Refeição</h3>
            <input
              type="text"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              placeholder="Nome da refeição (ex: Ceia, Pré-Treino, Almoço Especial)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsNewMealModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMeal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-sm font-bold"
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
