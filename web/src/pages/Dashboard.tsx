import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Flame,
  Dumbbell,
  Utensils,
  Scale,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err: any) {
        setError('Não foi possível carregar os dados do painel.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando métricas e planos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} />
          <span>{error || 'Erro ao carregar dados.'}</span>
        </div>
      </div>
    );
  }

  const { user, metrics, targets, activeDiet, workouts, recentWorkoutLogs, alerts, legalDisclaimer } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12 text-slate-100">
      {/* 1. Header de Boas-Vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Olá, <span className="text-emerald-400">{user.name}</span>!
          </h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe seu balanço nutricional e rotinas ativas.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/diet"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Utensils size={16} />
            <span>Minha Dieta</span>
          </Link>
          <Link
            to="/workouts"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center gap-1.5"
          >
            <Dumbbell size={16} />
            <span>Treinos</span>
          </Link>
        </div>
      </div>

      {/* 2. Alertas & Inconsistências do Sistema (Seção 40) */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alertText: string, i: number) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-2.5"
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
              <span>{alertText}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Cards Antropométricos e Metas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Peso Atual</span>
            <Scale size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {metrics.currentWeight ? `${metrics.currentWeight} kg` : '--'}
          </div>
          <span className="text-xs text-slate-400 mt-1">
            Meta: {metrics.goal === 'LOSE_WEIGHT' ? 'Emagrecimento' : metrics.goal === 'GAIN_WEIGHT' ? 'Hipertrofia' : 'Manutenção'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Meta Calórica</span>
            <Flame size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {targets ? `${targets.calories} kcal` : '--'}
          </div>
          <span className="text-xs text-slate-400 mt-1">
            TDEE Base: {metrics.tdee ? `${metrics.tdee} kcal` : '--'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Dieta Planejada</span>
            <Utensils size={18} className="text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {activeDiet ? `${activeDiet.totals.calories} kcal` : 'Sem dieta ativa'}
          </div>
          <span className="text-xs text-slate-400 mt-1">
            {activeDiet ? `${activeDiet.mealsCount} refeições cadastradas` : 'Crie sua primeira dieta'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Rotinas de Treino</span>
            <Dumbbell size={18} className="text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {workouts.length}
          </div>
          <span className="text-xs text-slate-400 mt-1">
            {workouts.length > 0 ? `${workouts[0].name}` : 'Nenhum treino criado'}
          </span>
        </div>
      </div>

      {/* 4. Comparativo de Macronutrientes (Dieta vs Meta) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <span>Balanço Nutricional da Dieta Ativa</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Valores calculados automaticamente a partir dos alimentos oficiais da TACO
            </p>
          </div>
          <Link to="/diet" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            Editar alimentos <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Proteínas */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-semibold text-sky-400">Proteínas</span>
              <span className="text-xs text-slate-400">
                {activeDiet ? `${activeDiet.totals.protein}g` : '0g'} / {targets ? `${targets.proteinGrams}g` : '--'}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    targets ? (activeDiet?.totals.protein / targets.proteinGrams) * 100 : 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Carboidratos */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-semibold text-amber-400">Carboidratos</span>
              <span className="text-xs text-slate-400">
                {activeDiet ? `${activeDiet.totals.carbs}g` : '0g'} / {targets ? `${targets.carbsGrams}g` : '--'}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    targets ? (activeDiet?.totals.carbs / targets.carbsGrams) * 100 : 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Gorduras */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="font-semibold text-rose-400">Gorduras</span>
              <span className="text-xs text-slate-400">
                {activeDiet ? `${activeDiet.totals.fat}g` : '0g'} / {targets ? `${targets.fatGrams}g` : '--'}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    targets ? (activeDiet?.totals.fat / targets.fatGrams) * 100 : 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Seção de Treinos e Histórico de Execução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treinos Cadastrados */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell size={20} className="text-indigo-400" />
              <span>Minhas Rotinas de Treino</span>
            </h2>
            <Link to="/workouts" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
              Gerenciar
            </Link>
          </div>

          {workouts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Nenhuma rotina configurada ainda.</p>
              <Link to="/workouts" className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition">
                + Criar Meu Primeiro Treino
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w: any) => (
                <div key={w.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{w.name}</div>
                    <div className="text-xs text-slate-400">
                      {w.exercisesCount} exercícios • ~{w.estimatedDurationMin} min
                    </div>
                  </div>
                  <Link
                    to={`/workouts?active=${w.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Treinos Realizados (Histórico) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-emerald-400" />
              <span>Últimos Treinos Executados</span>
            </h2>
            <Link to="/history" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
              Histórico Completo
            </Link>
          </div>

          {recentWorkoutLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Nenhum treino registrado ainda.</p>
              <span className="text-xs text-slate-500 block mt-1">
                Conclua um treino e registre suas cargas para acompanhar sua evolução!
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkoutLogs.map((log: any) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-200 text-sm">{log.workoutName}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(log.performedDate).toLocaleDateString('pt-BR')} • {log.durationMin} min
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Concluído
                    </span>
                  </div>
                  {log.exercises && log.exercises.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-1.5">
                      {log.exercises.slice(0, 3).map((e: any, idx: number) => (
                        <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {e.exerciseName} ({e.setsCompleted}x{e.repsCompleted} • {e.weightUsedKg}kg)
                        </span>
                      ))}
                      {log.exercises.length > 3 && (
                        <span className="text-slate-500">+{log.exercises.length - 3} mais</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Aviso Legal Obrigatório de Domínio da Saúde (RN27, Seção 41) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-slate-400 text-xs">
        <ShieldAlert size={18} className="shrink-0 text-slate-500 mt-0.5" />
        <p className="leading-relaxed">{legalDisclaimer}</p>
      </div>
    </div>
  );
};
