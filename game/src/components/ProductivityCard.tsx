import React from 'react';
import { ProductivityMetrics } from '../types/game';
import { TrendingUp, Utensils, Dumbbell, Moon, Award, Sparkles } from 'lucide-react';

interface ProductivityCardProps {
  productivity: ProductivityMetrics;
  onSimulateGoal: (pillar: 'diet' | 'workout' | 'sleep') => void;
}

export const ProductivityCard: React.FC<ProductivityCardProps> = ({
  productivity,
  onSimulateGoal,
}) => {
  const { totalScore, dietScore, workoutScore, sleepScore, daysStreakAbove80, targetDaysForPromo } =
    productivity;

  const isExcellent = totalScore >= 80;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Header com a Barra Mestra */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              Barra de Produtividade
              {isExcellent && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Alta Performance (+20% Salário)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Ponderação: 40% Dieta + 35% Treino + 25% Qualidade de Sono
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className={`text-2xl font-black ${isExcellent ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'text-amber-400'}`}>
            {totalScore}%
          </span>
        </div>
      </div>

      {/* Barra de Progresso Principal com Gradiente Animado */}
      <div>
        <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800 p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isExcellent
                ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-green-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, totalScore))}%` }}
          />
        </div>
      </div>

      {/* Os 3 Pilares com Controles Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Pilar Dieta */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-rose-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-rose-300">
              <Utensils className="w-3.5 h-3.5 text-rose-400" /> Dieta (40%)
            </span>
            <span className="text-xs font-mono font-black text-rose-200">{dietScore}%</span>
          </div>
          <button
            onClick={() => onSimulateGoal('diet')}
            className="mt-2.5 py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 transition-all cursor-pointer text-center"
          >
            +Registrar Refeição
          </button>
        </div>

        {/* Pilar Treino */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> Treino (35%)
            </span>
            <span className="text-xs font-mono font-black text-amber-200">{workoutScore}%</span>
          </div>
          <button
            onClick={() => onSimulateGoal('workout')}
            className="mt-2.5 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 transition-all cursor-pointer text-center"
          >
            +Concluir Treino
          </button>
        </div>

        {/* Pilar Sono */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold text-indigo-300">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sono (25%)
            </span>
            <span className="text-xs font-mono font-black text-indigo-200">{sleepScore}%</span>
          </div>
          <button
            onClick={() => onSimulateGoal('sleep')}
            className="mt-2.5 py-1 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 transition-all cursor-pointer text-center"
          >
            +Validar Noite Boa
          </button>
        </div>
      </div>

      {/* Rastro para Promoção de Cargo */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-semibold">
            Dias consecutivos com Produtividade &gt; 80% para Promoção:
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono font-black text-amber-300">
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
            {daysStreakAbove80} / {targetDaysForPromo} dias
          </span>
        </div>
      </div>
    </div>
  );
};
