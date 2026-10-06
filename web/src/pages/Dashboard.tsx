import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Flame,
  Dumbbell,
  Utensils,
  Scale,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  RefreshCw,
  PlayCircle,
} from 'lucide-react';
import { ProfessionalContactModal } from '../components/ProfessionalContactModal';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch {
      setError('Não foi possível carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando métricas, dietas e treinos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <AlertTriangle size={36} className="text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Falha ao carregar Painel</h2>
          <p className="text-xs text-slate-400">{error || 'Erro inesperado na conexão com a API.'}</p>
          <button
            onClick={fetchDashboard}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw size={14} />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  const { user, metrics, targets, activeDiet, workouts, recentWorkoutLogs, alerts, legalDisclaimer } = data;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12 text-slate-100">
        {/* 1. Header de Boas-Vindas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Olá, <span className="text-emerald-400">{user.name}</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-1">Acompanhe seu balanço nutricional, rotinas e evolução.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare size={15} />
              <span>Falar com Profissional</span>
            </button>

            <Link
              to="/diet"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Utensils size={15} />
              <span>Minha Dieta</span>
            </Link>

            <Link
              to="/workouts"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <Dumbbell size={15} />
              <span>Treinos</span>
            </Link>
          </div>
        </div>

        {/* 2. Alertas & Inconsistências do Sistema */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alertText: string, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5"
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{alertText}</span>
              </div>
            ))}
          </div>
        )}

        {/* 3. Cards Antropométricos e Metas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Peso Atual</span>
              <Scale size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics.currentWeight ? `${metrics.currentWeight} kg` : '--'}
            </div>
            <span className="text-xs text-slate-400 mt-1">
              Meta:{' '}
              {metrics.goal === 'LOSE_WEIGHT'
                ? 'Emagrecimento'
                : metrics.goal === 'GAIN_WEIGHT'
                ? 'Hipertrofia'
                : 'Manutenção'}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Meta Calórica</span>
              <Flame size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {targets ? `${targets.calories} kcal` : '--'}
            </div>
            <span className="text-xs text-slate-400 mt-1">
              TDEE: {metrics.tdee ? `${metrics.tdee} kcal` : '--'}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Dieta Planejada</span>
              <Utensils size={18} className="text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeDiet ? `${activeDiet.totals.calories} kcal` : 'Sem dieta'}
            </div>
            <span className="text-xs text-slate-400 mt-1">
              {activeDiet ? `${activeDiet.mealsCount} refeições cadastradas` : 'Inicie a montagem'}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Rotinas de Treino</span>
              <Dumbbell size={18} className="text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{workouts.length}</div>
            <span className="text-xs text-slate-400 mt-1">Fichas ativas no sistema</span>
          </div>
        </div>

        {/* 4. Resumo da Dieta e Resumo do Treino */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Resumo da Dieta */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="text-emerald-400" size={20} />
                  <h3 className="font-bold text-white text-base">Plano de Alimentação</h3>
                </div>
                <Link to="/diet" className="text-xs text-emerald-400 hover:underline font-semibold flex items-center">
                  <span>Gerenciar Dieta</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {!activeDiet ? (
                <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <Utensils size={36} className="mx-auto text-slate-600" />
                  <h4 className="font-bold text-white text-sm">Nenhuma dieta montada</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Utilize o assistente de 8 etapas para gerar um cardápio equilibrado com base na TACO.
                  </p>
                  <Link
                    to="/diet?tab=wizard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 font-bold text-xs"
                  >
                    <Sparkles size={14} />
                    <span>Montar Dieta Agora</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 text-sm">{activeDiet.name}</span>
                    <span className="text-emerald-400 font-extrabold">{activeDiet.totals.calories} kcal</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <strong className="text-sky-400 block">{activeDiet.totals.protein}g</strong>
                      <span className="text-slate-400 text-[10px]">Proteínas</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <strong className="text-amber-400 block">{activeDiet.totals.carbs}g</strong>
                      <span className="text-slate-400 text-[10px]">Carboidratos</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/50">
                      <strong className="text-rose-400 block">{activeDiet.totals.fat}g</strong>
                      <span className="text-slate-400 text-[10px]">Gorduras</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>744 alimentos disponíveis na TACO</span>
              <Link to="/diet?tab=taco" className="text-emerald-400 hover:underline">
                Consultar TACO
              </Link>
            </div>
          </div>

          {/* Card Resumo do Treino */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="text-teal-400" size={20} />
                  <h3 className="font-bold text-white text-base">Rotinas de Treino</h3>
                </div>
                <Link to="/workouts" className="text-xs text-teal-400 hover:underline font-semibold flex items-center">
                  <span>Ver Fichas</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {workouts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                  <Dumbbell size={36} className="mx-auto text-slate-600" />
                  <h4 className="font-bold text-white text-sm">Nenhuma rotina cadastrada</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Monte seu programa de treinamento personalizado por divisões e objetivos.
                  </p>
                  <Link
                    to="/workouts?tab=wizard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    <Sparkles size={14} />
                    <span>Montar Treino Agora</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {workouts.slice(0, 3).map((w: any) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-white block text-sm">{w.name}</strong>
                        <span className="text-slate-400">{w.splitName || 'Treino'} • {w.estimatedDurationMin} min</span>
                      </div>
                      <Link
                        to={`/workouts?tab=logger`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1"
                      >
                        <PlayCircle size={14} />
                        <span>Treinar</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{recentWorkoutLogs?.length || 0} sessões registradas no histórico</span>
              <Link to="/workouts?tab=history" className="text-teal-400 hover:underline">
                Ver Histórico
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Banner Informativo & Suporte Técnico com Especialistas */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-teal-400" />
              <span>Precisa de orientação profissional?</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-xl">
              Tire dúvidas diretamente com nutricionistas (CRN) e educadores físicos (CREF) cadastrados na plataforma.
            </p>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition shrink-0"
          >
            Falar com Profissional
          </button>
        </div>

        {/* 6. Aviso Legal de Saúde (RN27, Seção 41) */}
        {legalDisclaimer && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
            <ShieldAlert size={16} className="shrink-0 text-slate-500 mt-0.5" />
            <p className="leading-relaxed">{legalDisclaimer}</p>
          </div>
        )}
      </div>

      <ProfessionalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
