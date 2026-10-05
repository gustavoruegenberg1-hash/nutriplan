import React, { useState } from 'react';
import { InGameMeal, InGameWorkoutItem } from '../types/game';
import { Utensils, Dumbbell, Send, Plus, Trash2, X, CheckCircle, Sparkles } from 'lucide-react';

interface InGamePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportToNutriPlan: (meals: InGameMeal[], workouts: InGameWorkoutItem[]) => void;
}

export const InGamePlannerModal: React.FC<InGamePlannerModalProps> = ({
  isOpen,
  onClose,
  onExportToNutriPlan,
}) => {
  const [activeTab, setActiveTab] = useState<'diet' | 'workout'>('diet');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Lista Inicial de Refeições In-Game
  const [meals, setMeals] = useState<InGameMeal[]>([
    {
      id: 'm1',
      name: 'Ovos Mexidos com Aveia e Frutas',
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 14,
      time: '08:00',
    },
    {
      id: 'm2',
      name: 'Filé de Frango Grelhado com Arroz e Salada',
      calories: 580,
      protein: 48,
      carbs: 60,
      fat: 12,
      time: '12:30',
    },
    {
      id: 'm3',
      name: 'Iogurte Natural com Whey e Castanhas',
      calories: 310,
      protein: 26,
      carbs: 20,
      fat: 11,
      time: '16:30',
    },
  ]);

  // Lista Inicial de Treinos In-Game
  const [workouts, setWorkouts] = useState<InGameWorkoutItem[]>([
    { id: 'w1', name: 'Supino Reto com Barra', muscle: 'Peitoral', sets: 4, reps: 10 },
    { id: 'w2', name: 'Desenvolvimento Militar com Halteres', muscle: 'Ombros', sets: 3, reps: 12 },
    { id: 'w3', name: 'Tríceps Polia Corda', muscle: 'Tríceps', sets: 3, reps: 15 },
  ]);

  // Form State para adicionar Refeição
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState(350);
  const [mealProtein, setMealProtein] = useState(30);

  // Form State para adicionar Exercício
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseMuscle, setExerciseMuscle] = useState('Peitoral');

  if (!isOpen) return null;

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    setMeals((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        name: mealName.trim(),
        calories: Number(mealCalories),
        protein: Number(mealProtein),
        carbs: 30,
        fat: 8,
        time: '19:30',
      },
    ]);
    setMealName('');
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    setWorkouts((prev) => [
      ...prev,
      {
        id: `w_${Date.now()}`,
        name: exerciseName.trim(),
        muscle: exerciseMuscle,
        sets: 3,
        reps: 12,
      },
    ]);
    setExerciseName('');
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExportToNutriPlan(meals, workouts);
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[90vh] overflow-hidden">
        {/* Header do Planejador In-Game */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Estação de Planejamento In-Game
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono border border-teal-500/30">
                  Exportação Ativa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Monte sua dieta e treino no jogo e exporte diretamente para o NutriPlan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas: Dieta vs Treino */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('diet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'diet'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Cardápio Alimentar ({meals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'workout'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ficha de Treino ({workouts.length})</span>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {activeTab === 'diet' ? (
            <div className="flex flex-col gap-3">
              {/* Barra de Totais */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Energia Total:</span>
                  <strong className="text-amber-400 text-sm">{totalCalories} kcal</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Proteína Total:</span>
                  <strong className="text-rose-400 text-sm">{totalProtein}g</strong>
                </div>
              </div>

              {/* Lista de Refeições */}
              <div className="flex flex-col gap-2">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{meal.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {meal.calories} kcal • {meal.protein}g Proteína • {meal.time}
                      </p>
                    </div>

                    <button
                      onClick={() => setMeals((prev) => prev.filter((m) => m.id !== meal.id))}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form Rápido de Adicionar Refeição */}
              <form onSubmit={handleAddMeal} className="flex gap-2 items-center mt-1">
                <input
                  type="text"
                  placeholder="Nome do alimento ou prato..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                />
                <input
                  type="number"
                  placeholder="Kcal"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Lista de Exercícios */}
              <div className="flex flex-col gap-2">
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {w.name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          {w.muscle}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {w.sets} séries x {w.reps} repetições
                      </p>
                    </div>

                    <button
                      onClick={() => setWorkouts((prev) => prev.filter((item) => item.id !== w.id))}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form Rápido de Adicionar Exercício */}
              <form onSubmit={handleAddExercise} className="flex gap-2 items-center mt-1">
                <input
                  type="text"
                  placeholder="Nome do exercício..."
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <select
                  value={exerciseMuscle}
                  onChange={(e) => setExerciseMuscle(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Peitoral">Peitoral</option>
                  <option value="Costas">Costas</option>
                  <option value="Pernas">Pernas</option>
                  <option value="Ombros">Ombros</option>
                  <option value="Braços">Braços</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Rodapé: Botão de Exportação para o NutriPlan */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Sincroniza com o site clínico e eleva a Barra de Produtividade
          </span>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            {exportSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>Exportado com Sucesso!</span>
              </>
            ) : isExporting ? (
              <span>Sincronizando...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>EXPORTAR PARA O NUTRIPLAN 🚀</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
