import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { DietPlan, Routine, DayOfWeek } from '../types';
import { calculateUserMetabolicTargets } from './DietPlanner';
import {
  Dumbbell,
  BookOpen,
  Flame,
  ArrowRight,
  Plus,
  Award,
  Sparkles,
  Utensils,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { articleService } from '../services/articleService';
import { HydrationTrackerCard } from '../components/water/HydrationTrackerCard';

const STORAGE_KEY = 'nutriplan_saved_diet_meals';
const STORAGE_NAME_KEY = 'nutriplan_saved_diet_name';
const WORKOUT_STORAGE_KEY = 'nutriplan_saved_workout_days';
const WORKOUT_STORAGE_NAME_KEY = 'nutriplan_saved_workout_name';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar o dia da semana atual
  const currentDayOfWeek: DayOfWeek = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 = Domingo, 1 = Segunda...
    const map: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return map[dayIndex] || 'MONDAY';
  }, []);

  const dayLabels: Record<DayOfWeek, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
  };

  // Cálculo de Streak de Consistência (dias seguidos)
  const streakDays = useMemo(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastActive = localStorage.getItem('nutriplan_last_active_date');
      let streak = parseInt(localStorage.getItem('nutriplan_streak_count') || '1', 10);

      if (!lastActive) {
        localStorage.setItem('nutriplan_last_active_date', todayStr);
        localStorage.setItem('nutriplan_streak_count', '1');
        return 1;
      }

      if (lastActive === todayStr) {
        return Math.max(1, streak);
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastActive === yesterdayStr) {
        streak += 1;
        localStorage.setItem('nutriplan_streak_count', streak.toString());
        localStorage.setItem('nutriplan_last_active_date', todayStr);
        return streak;
      }

      // Reinicia streak se pulou mais de 1 dia
      localStorage.setItem('nutriplan_streak_count', '1');
      localStorage.setItem('nutriplan_last_active_date', todayStr);
      return 1;
    } catch {
      return 1;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dietRes, workoutRes] = await Promise.allSettled([
          api.get('/diet-plans'),
          api.get('/routines'),
        ]);

        if (dietRes.status === 'fulfilled') setDietPlans(dietRes.value.data || []);
        if (workoutRes.status === 'fulfilled') setRoutines(workoutRes.value.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeDietFromApi = dietPlans.find((p) => p.isActive) || dietPlans[0];
  const activeRoutineFromApi = routines.find((r) => r.isActive) || routines[0];

  // Leitura do cache local de dieta
  const localDietData = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedName = localStorage.getItem(STORAGE_NAME_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { name: savedName || 'Meu Plano Alimentar', mealsByDay: parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, []);

  const localWorkoutData = useMemo(() => {
    try {
      const saved = localStorage.getItem(WORKOUT_STORAGE_KEY);
      const savedName = localStorage.getItem(WORKOUT_STORAGE_NAME_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { name: savedName || 'Rotina de Treino', days: parsed };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, []);

  // Consolidação dos dados de dieta
  const consolidatedDiet = useMemo(() => {
    if (activeDietFromApi && activeDietFromApi.days) {
      const apiItemCount = activeDietFromApi.days.reduce(
        (sum, d) => sum + (d.meals?.reduce((mSum, m) => mSum + (m.items?.length || 0), 0) || 0),
        0
      );
      if (apiItemCount > 0) {
        return {
          source: 'api' as const,
          name: activeDietFromApi.name,
          plan: activeDietFromApi,
        };
      }
    }

    if (localDietData && localDietData.mealsByDay) {
      const days = Object.values(localDietData.mealsByDay) as any[];
      const localItemCount = days.reduce(
        (sum, dMeals) =>
          sum + (Array.isArray(dMeals) ? dMeals.reduce((mSum, m) => mSum + (m.items?.length || 0), 0) : 0),
        0
      );
      if (localItemCount > 0) {
        return {
          source: 'local' as const,
          name: localDietData.name,
          mealsByDay: localDietData.mealsByDay,
        };
      }
    }

    if (activeDietFromApi) {
      return {
        source: 'api' as const,
        name: activeDietFromApi.name,
        plan: activeDietFromApi,
      };
    }

    if (localDietData) {
      return {
        source: 'local' as const,
        name: localDietData.name,
        mealsByDay: localDietData.mealsByDay,
      };
    }

    return null;
  }, [activeDietFromApi, localDietData]);

  // Refeições de hoje
  const todayMealsSummary = useMemo(() => {
    if (!consolidatedDiet) return [];

    if (consolidatedDiet.source === 'api') {
      const days = consolidatedDiet.plan.days || [];
      const matchToday = days.find((d) => d.dayOfWeek === currentDayOfWeek);
      if (matchToday && matchToday.meals && matchToday.meals.some((m) => m.items?.length > 0)) {
        return matchToday.meals;
      }
      const firstWithItems = days.find((d) => d.meals && d.meals.some((m) => m.items?.length > 0));
      return firstWithItems?.meals || days[0]?.meals || [];
    } else {
      const mealsForToday = consolidatedDiet.mealsByDay[currentDayOfWeek];
      if (Array.isArray(mealsForToday) && mealsForToday.some((m: any) => m.items?.length > 0)) {
        return mealsForToday;
      }
      for (const dKey of Object.keys(consolidatedDiet.mealsByDay)) {
        const dMeals = consolidatedDiet.mealsByDay[dKey as DayOfWeek];
        if (Array.isArray(dMeals) && dMeals.some((m: any) => m.items?.length > 0)) {
          return dMeals;
        }
      }
      return mealsForToday || [];
    }
  }, [consolidatedDiet, currentDayOfWeek]);

  // Totais nutricionais consumidos/planejados hoje
  const todayTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;

    todayMealsSummary.forEach((meal: any) => {
      meal.items?.forEach((item: any) => {
        if (item.foodItem) {
          const factor = (Number(item.quantityGrams) || 100) / 100;
          const p = Number(item.foodItem.proteinPer100g) * factor;
          const c = Number(item.foodItem.carbsPer100g) * factor;
          const f = Number(item.foodItem.fatPer100g) * factor;
          const fib = Number(item.foodItem.fiberPer100g || 0) * factor;
          const cal = p * 4 + c * 4 + f * 9;

          protein += p;
          carbs += c;
          fat += f;
          fiber += fib;
          calories += cal;
        } else {
          const p = Number(item.protein) || 0;
          const c = Number(item.carbs) || 0;
          const f = Number(item.fat) || 0;
          const fib = Number(item.fiber) || 0;
          const cal =
            p * 4 + c * 4 + f * 9 > 0 ? p * 4 + c * 4 + f * 9 : Number(item.calories) || 0;

          protein += p;
          carbs += c;
          fat += f;
          fiber += fib;
          calories += cal;
        }
      });
    });

    return { calories, protein, carbs, fat, fiber };
  }, [todayMealsSummary]);

  // Consolidação da rotina de treino
  const displayRoutine = useMemo(() => {
    if (activeRoutineFromApi && activeRoutineFromApi.days) {
      const apiExCount = activeRoutineFromApi.days.reduce(
        (sum: number, d: any) => sum + (d.exercises?.length || 0),
        0
      );
      if (apiExCount > 0) return activeRoutineFromApi;
    }

    if (localWorkoutData && localWorkoutData.days) {
      const localExCount = localWorkoutData.days.reduce(
        (sum: number, d: any) => sum + (d.exercises?.length || 0),
        0
      );
      if (localExCount > 0) {
        return {
          id: 'local',
          name: localWorkoutData.name,
          isActive: true,
          days: localWorkoutData.days,
        };
      }
    }

    if (activeRoutineFromApi) return activeRoutineFromApi;
    if (localWorkoutData) {
      return {
        id: 'local',
        name: localWorkoutData.name,
        isActive: true,
        days: localWorkoutData.days,
      };
    }

    return null;
  }, [activeRoutineFromApi, localWorkoutData]);

  // Metas metabólicas calculadas com base em peso, altura, sexo, atividade e objetivo
  const userMetabolism = useMemo(() => {
    return calculateUserMetabolicTargets(user);
  }, [user]);

  const targetCalories = userMetabolism.targetCalories;
  const targetProtein = userMetabolism.targetProteinGrams;
  const targetCarbs = userMetabolism.targetCarbsGrams;
  const targetFat = userMetabolism.targetFatGrams;

  const remainingCalories = targetCalories - Math.round(todayTotals.calories);
  const caloriesPct = Math.min(100, Math.round((todayTotals.calories / (targetCalories || 2000)) * 100));
  const proteinPct = Math.min(100, Math.round((todayTotals.protein / (targetProtein || 140)) * 100));
  const carbsPct = Math.min(100, Math.round((todayTotals.carbs / (targetCarbs || 200)) * 100));
  const fatPct = Math.min(100, Math.round((todayTotals.fat / (targetFat || 60)) * 100));

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const todayWorkout = useMemo(() => {
    if (!displayRoutine || !displayRoutine.days) return null;
    return displayRoutine.days.find((d: any) => d.dayOfWeek === currentDayOfWeek);
  }, [displayRoutine, currentDayOfWeek]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in">
      
      {/* 1. Header Enxuto & Boas-Vindas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{greeting}, {user?.name?.split(' ')[0] || 'Atleta'}!</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dayLabels[currentDayOfWeek]} &middot; Foco na consistência</span>
          </p>
        </div>

        {/* Badges de Consistência e Plano */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{streakDays} dias de consistência</span>
          </div>
          {consolidatedDiet && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>{consolidatedDiet.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Card: Resumo Nutricional do Dia (Glanceable UI em 3 segundos) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Resumo Nutricional de Hoje</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Equilíbrio calórico e macronutrientes calculados pela ciência
            </p>
          </div>

          <Link
            to="/diet"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>Ver Dieta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Destaque Principal: Calorias */}
          <div className="md:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calorias Diárias
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                {caloriesPct}%
              </span>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {Math.round(todayTotals.calories).toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {targetCalories.toLocaleString()} kcal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {remainingCalories >= 0 ? (
                  <span className="text-emerald-400 font-semibold">{remainingCalories.toLocaleString()} kcal restantes</span>
                ) : (
                  <span className="text-amber-400 font-semibold">{Math.abs(remainingCalories).toLocaleString()} kcal acima da meta</span>
                )}
              </p>
            </div>

            {/* Barra de Progresso Calórico */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${caloriesPct}%` }}
              />
            </div>
          </div>

          {/* Destaque: Macronutrientes (Proteína, Carbo, Gordura) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Proteína (Hero Macro) */}
            <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Proteína (Meta Principal)
                </span>
                <span className="text-slate-300">
                  <strong className="text-white">{Math.round(todayTotals.protein)}g</strong> / {targetProtein}g
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
            </div>

            {/* Carboidratos */}
            <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Carboidratos
                </span>
                <span className="text-slate-300">
                  <strong className="text-white">{Math.round(todayTotals.carbs)}g</strong> / {targetCarbs}g
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPct}%` }}
                />
              </div>
            </div>

            {/* Gorduras */}
            <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Gorduras
                </span>
                <span className="text-slate-300">
                  <strong className="text-white">{Math.round(todayTotals.fat)}g</strong> / {targetFat}g
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${fatPct}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Hidratação Diária Integrada */}
      <HydrationTrackerCard compact={true} />

      {/* 4. Os Dois Pilares do Dia: Alimentação & Treino */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Pilar 1: Refeições Planejadas de Hoje */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Alimentação de Hoje</h3>
                  <span className="text-xs text-slate-400">
                    {todayMealsSummary.length > 0 ? `${todayMealsSummary.length} refeições estruturadas` : 'Sem refeições cadastradas'}
                  </span>
                </div>
              </div>
            </div>

            {todayMealsSummary.length > 0 ? (
              <div className="space-y-2 mt-4">
                {todayMealsSummary.slice(0, 4).map((meal: any, idx: number) => {
                  const itemCount = meal.items?.length || 0;
                  const mealCals = Math.round(
                    meal.items?.reduce((sum: number, it: any) => sum + (Number(it.calories) || 0), 0) || 0
                  );

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 ${itemCount > 0 ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div>
                          <span className="font-bold text-white block">{meal.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {itemCount > 0 ? `${itemCount} alimentos` : 'Vazio'}
                          </span>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-300">
                        {mealCals > 0 ? `${mealCals} kcal` : '--'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <p className="text-xs">Nenhum plano alimentar selecionado para hoje.</p>
                <Link
                  to="/diet"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Montar Dieta Agora</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/diet"
            className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl text-center block transition-colors mt-4 border border-slate-800"
          >
            Abrir Planejador de Dieta &rarr;
          </Link>
        </div>

        {/* Pilar 2: Treino de Hoje */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Treino de Hoje</h3>
                  <span className="text-xs text-slate-400">
                    {displayRoutine?.name || 'Rotina semanal'}
                  </span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="h-24 bg-slate-950/50 rounded-2xl animate-pulse mt-4" />
            ) : !displayRoutine ? (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <p className="text-xs">Nenhuma rotina de treino configurada.</p>
                <Link
                  to="/workout"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configurar Treino</span>
                </Link>
              </div>
            ) : todayWorkout && todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">
                    {todayWorkout.name}
                  </span>
                  <span className="text-slate-400 font-semibold">
                    {todayWorkout.exercises.length} exercícios
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  {todayWorkout.exercises.slice(0, 3).map((ex: any, exIdx: number) => (
                    <div key={exIdx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span className="truncate">{ex.name || 'Exercício'}</span>
                    </div>
                  ))}
                  {todayWorkout.exercises.length > 3 && (
                    <span className="text-[11px] text-slate-500 block pt-0.5">
                      + {todayWorkout.exercises.length - 3} outros exercícios na ficha
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 mt-2 text-center space-y-1">
                <p className="text-white font-bold text-sm">Dia de Recuperação 🧘</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A reconstrução e hipertrofia muscular ocorrem no descanso. Hidrate-se e recarregue as energias!
                </p>
              </div>
            )}
          </div>

          <Link
            to="/workout"
            className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl text-center block transition-colors mt-4 border border-slate-800"
          >
            Ver Ficha Completa de Treino &rarr;
          </Link>
        </div>

      </div>

      {/* 5. Pílula Científica Discreta */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-slate-200 block">Dica Científica do Dia</strong>
            <span>Distribuir o consumo proteico em 3 a 5 refeições diárias maximiza o anabolismo muscular.</span>
          </div>
        </div>

        <Link
          to="/articles"
          className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer text-xs flex-shrink-0"
        >
          Ler artigos indexados &rarr;
        </Link>
      </div>

    </div>
  );
};
