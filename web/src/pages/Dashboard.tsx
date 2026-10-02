import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { DietPlan, Routine, Article, DayOfWeek } from '../types';
import { MacroCard } from '../components/MacroCard';
import { calculateUserMetabolicTargets } from './DietPlanner';
import { MacroChart } from '../components/MacroChart';
import {
  Dumbbell,
  BookOpen,
  Flame,
  Plus,
  Award,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { DashboardPetCard } from '../components/pet/DashboardPetCard';
import { PetProfile } from '../types/gamification';
import { gamificationService } from '../services/gamificationService';
import { articleService } from '../services/articleService';
import { HydrationTrackerCard } from '../components/water/HydrationTrackerCard';

const STORAGE_KEY = 'nutriplan_saved_diet_meals';
const STORAGE_NAME_KEY = 'nutriplan_saved_diet_name';
const WORKOUT_STORAGE_KEY = 'nutriplan_saved_workout_days';
const WORKOUT_STORAGE_NAME_KEY = 'nutriplan_saved_workout_name';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dietRes, workoutRes, articlesData, petRes] = await Promise.allSettled([
          api.get('/diet-plans'),
          api.get('/routines'),
          articleService.getArticles(3),
          gamificationService.fetchPet(user?.id || 'guest'),
        ]);

        if (dietRes.status === 'fulfilled') setDietPlans(dietRes.value.data || []);
        if (workoutRes.status === 'fulfilled') setRoutines(workoutRes.value.data || []);
        if (articlesData.status === 'fulfilled') setArticles(articlesData.value || []);
        if (petRes.status === 'fulfilled' && petRes.value?.pet) setPet(petRes.value.pet);
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

  // Leitura robusta do cache local
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

  // Consolida a melhor fonte de dados de dieta (nunca deixa sumir se houver dados locais ou na API)
  const consolidatedDiet = useMemo(() => {
    // 1. Verifica se a API tem refeições preenchidas
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

    // 2. Fallback para localStorage
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

    // 3. Fallback genérico se houver plano ativo
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

  // Identifica as refeições do dia atual (ou o primeiro dia com itens)
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
      // Pega qualquer dia que tenha refeições
      for (const dKey of Object.keys(consolidatedDiet.mealsByDay)) {
        const dMeals = consolidatedDiet.mealsByDay[dKey as DayOfWeek];
        if (Array.isArray(dMeals) && dMeals.some((m: any) => m.items?.length > 0)) {
          return dMeals;
        }
      }
      return mealsForToday || [];
    }
  }, [consolidatedDiet, currentDayOfWeek]);

  // Calcula totais nutricionais do dia
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
          const cal = (p * 4) + (c * 4) + (f * 9);

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
          const cal = (p * 4 + c * 4 + f * 9) > 0 ? (p * 4 + c * 4 + f * 9) : (Number(item.calories) || 0);

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

  const nextActions = useMemo(() => {
    const actions = [];
    
    if (!consolidatedDiet) {
      actions.push({ icon: '🍳', label: 'Monte sua primeira dieta', path: '/diet', priority: 'high' });
    }
    
    if (!displayRoutine) {
      actions.push({ icon: '🏋️', label: 'Configure sua rotina de treino', path: '/workout', priority: 'high' });
    }
    
    if (pet && pet.vitality.waterCups < 8) {
      actions.push({ icon: '💧', label: `Beber água (${pet.vitality.waterCups}/8 copos)`, path: '/jogo?tab=mascote', priority: 'medium' });
    }
    
    if (articles.length > 0) {
      const readArticleIds = JSON.parse(localStorage.getItem(`nutriplan_read_articles_${user?.id}`) || '[]');
      const unread = articles.filter(a => !readArticleIds.includes(a.id));
      if (unread.length > 0) {
        actions.push({ icon: '📚', label: `${unread.length} artigo${unread.length > 1 ? 's' : ''} para ler`, path: '/articles', priority: 'low' });
      }
    }
    
    return actions;
  }, [consolidatedDiet, displayRoutine, pet, articles, user]);

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

  const recommendedArticle = useMemo(() => {
    if (articles.length === 0) return null;
    const readArticleIds = JSON.parse(localStorage.getItem(`nutriplan_read_articles_${user?.id}`) || '[]');
    const unread = articles.filter(a => !readArticleIds.includes(a.id));
    return unread.length > 0 ? unread[0] : null;
  }, [articles, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* 1. Saudação Personalizada */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5F9] tracking-tight">
            {greeting}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[#94A3B8] text-sm sm:text-base mt-1">
            Mantenha o foco nos seus objetivos hoje e continue evoluindo.
          </p>
        </div>
        {consolidatedDiet && (
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
             <Award className="w-4 h-4" />
             <span>Plano Ativo: {consolidatedDiet.name}</span>
           </div>
        )}
      </div>

      {/* 2. Checklist de Próximas Ações / Recomendações Recolhíveis */}
      {nextActions.length > 0 && (
        <div className="bg-[#151D28] border border-[#243044] rounded-2xl p-4 shadow-sm transition-all">
          <button
            type="button"
            onClick={() => setIsRecommendationsOpen(!isRecommendationsOpen)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💡</span>
              <div>
                <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <span>Ações & Recomendações do Dia</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {nextActions.length} pendentes
                  </span>
                </h2>
                <p className="text-[11px] text-[#94A3B8]">
                  Toque para {isRecommendationsOpen ? 'recolher' : 'ver'} as principais ações sugeridas para seu dia
                </p>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-[#1A2332] text-[#94A3B8] group-hover:text-white transition-colors">
              {isRecommendationsOpen ? (
                <ChevronDown className="w-4 h-4 text-emerald-400" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {isRecommendationsOpen && (
            <div className="mt-3 pt-3 border-t border-[#243044] flex flex-wrap gap-3 animate-in fade-in duration-200">
              {nextActions.map((act, i) => (
                <Link
                  key={i}
                  to={act.path}
                  className="flex items-center gap-3 px-4 py-3 bg-[#1A2332] border border-[#243044] rounded-xl hover:bg-[#202c3f] transition-colors shadow-sm active:scale-98"
                >
                  <span className="text-xl">{act.icon}</span>
                  <span className="text-sm font-semibold text-[#F1F5F9]">{act.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] ml-2" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Progresso Nutricional do Dia (5 MacroCards) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-extrabold text-[#F1F5F9]">
            Painel Nutricional de Hoje ({dayLabels[currentDayOfWeek]})
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#151D28] border border-[#243044] rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              <MacroCard
                label="Calorias"
                value={todayTotals.calories}
                unit="kcal"
                target={targetCalories}
                type="calories"
              />
              <MacroCard
                label="Proteínas"
                value={todayTotals.protein}
                unit="g"
                target={targetProtein}
                type="protein"
              />
              <MacroCard
                label="Carboidratos"
                value={todayTotals.carbs}
                unit="g"
                target={targetCarbs}
                type="carbs"
              />
              <MacroCard
                label="Gorduras"
                value={todayTotals.fat}
                unit="g"
                target={targetFat}
                type="fat"
              />
              <div className="col-span-2 sm:col-span-1">
                <MacroCard
                  label="Fibras"
                  value={todayTotals.fiber}
                  unit="g"
                  target={userMetabolism.targetFiberGrams}
                  type="fiber"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidratação & Lembretes de Água */}
      <HydrationTrackerCard />

      {/* 4. Card do Mascote */}
      {pet && <DashboardPetCard initialPet={pet} userId={user?.id || 'guest'} />}

      {/* 5. Banner de Supervisão Médica */}
      {(user?.needsProfessionalSupervision === 'YES' || user?.needsProfessionalSupervision === 'UNSURE') && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Aviso de Acompanhamento Nutricional & Clínico</span>
            <p className="text-[#94A3B8] leading-relaxed">
              Você indicou possuir condições de saúde ou restrições alimentares que exigem cuidado. As recomendações do aplicativo são puramente educativas e não substituem a avaliação individualizada de um médico ou nutricionista.
            </p>
          </div>
        </div>
      )}

      {/* 6. Grid de 2 Colunas (Treino & Artigo) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Coluna 1: Treino de Hoje */}
        <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#F1F5F9]">Treino de Hoje</h3>
                  <span className="text-xs text-[#94A3B8]">{displayRoutine?.name || 'Sem rotina'}</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="h-20 bg-[#1A2332] rounded-2xl animate-pulse mt-4" />
            ) : !displayRoutine ? (
              <div className="py-8 text-center text-[#94A3B8] space-y-3">
                <p className="text-sm">Nenhuma rotina configurada.</p>
                <Link
                  to="/workout"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Montar Treino</span>
                </Link>
              </div>
            ) : todayWorkout && todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
              <div className="p-4 rounded-2xl bg-[#1A2332] border border-[#243044] mt-4">
                <span className="text-xs text-[#94A3B8] block font-bold uppercase mb-2">
                  Divisão: {todayWorkout.name}
                </span>
                <div className="text-[#F1F5F9] font-medium text-sm mb-1">
                  {todayWorkout.exercises.length} exercícios programados
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#1A2332] border border-[#243044] mt-4 text-center">
                <p className="text-[#F1F5F9] font-semibold">Dia de Recuperação 🧘</p>
                <p className="text-xs text-[#94A3B8] mt-1">Aproveite para descansar.</p>
              </div>
            )}
          </div>
          
          <Link
            to="/workout"
            className="w-full py-2.5 bg-[#1A2332] hover:bg-[#1E2D3D] text-[#F1F5F9] text-xs font-bold rounded-xl text-center block transition-colors mt-4 border border-[#243044]"
          >
            Ver Rotina Completa
          </Link>
        </div>

        {/* Coluna 2: Artigo Recomendado */}
        <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#F1F5F9]">Artigo Recomendado</h3>
                  <span className="text-xs text-[#94A3B8]">Conhecimento científico</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="h-20 bg-[#1A2332] rounded-2xl animate-pulse mt-4" />
            ) : recommendedArticle ? (
              <Link
                to="/articles"
                className="block p-4 rounded-2xl bg-[#1A2332] border border-[#243044] hover:border-purple-500/40 transition-all mt-4 group"
              >
                <span className="font-bold text-sm text-[#F1F5F9] group-hover:text-purple-300 line-clamp-2 leading-snug">
                  {recommendedArticle.title}
                </span>
                <div className="flex items-center gap-1.5 mt-3">
                  {recommendedArticle.tags?.slice(0, 2).map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md bg-[#151D28] text-purple-400 text-[10px] font-semibold border border-[#243044]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ) : (
              <div className="py-8 text-center text-[#94A3B8]">
                <p className="text-sm">Você está em dia com as leituras! 🎉</p>
              </div>
            )}
          </div>
          
          <Link
            to="/articles"
            className="w-full py-2.5 bg-[#1A2332] hover:bg-[#1E2D3D] text-[#F1F5F9] text-xs font-bold rounded-xl text-center block transition-colors mt-4 border border-[#243044]"
          >
            Acessar Biblioteca Científica
          </Link>
        </div>

      </div>

      {/* 7. Footer Chart */}
      {consolidatedDiet && todayMealsSummary.length > 0 && (
        <div className="bg-[#151D28] border border-[#243044] rounded-3xl p-6 shadow-sm mt-6">
          <h3 className="font-extrabold text-[#F1F5F9] mb-4">Distribuição de Macronutrientes</h3>
          <div className="max-w-md mx-auto">
            <MacroChart
              protein={todayTotals.protein}
              carbs={todayTotals.carbs}
              fat={todayTotals.fat}
            />
          </div>
        </div>
      )}

    </div>
  );
};
