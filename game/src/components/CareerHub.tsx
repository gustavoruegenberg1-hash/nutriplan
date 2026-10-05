import React from 'react';
import { CareerTrack, GameCharacter } from '../types/game';
import { Briefcase, Zap, Clock, Coins, CheckCircle, Award, Sparkles } from 'lucide-react';

interface CareerHubProps {
  character: GameCharacter;
  careers: CareerTrack[];
  onStartShift: (careerId: string) => void;
  onClaimShift: (careerId: string) => void;
  onPromote: (careerId: string) => void;
}

export const CareerHub: React.FC<CareerHubProps> = ({
  character,
  careers,
  onStartShift,
  onClaimShift,
  onPromote,
}) => {
  const prod = character.productivity;
  const isHighProd = prod.totalScore >= 80;
  const canPromote = prod.daysStreakAbove80 >= prod.targetDaysForPromo;

  return (
    <div className="w-full p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Profissões & Mercado de Trabalho
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isHighProd
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isHighProd ? 'Bônus de Alta Performance (+20%)' : 'Rendimento Padrão'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Seu rendimento salarial varia conforme a Barra de Produtividade (Dieta + Treino + Sono)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Stamina:</span>
          <strong className="text-emerald-400">
            {character.attributes.energy}/{character.attributes.maxEnergy}
          </strong>
        </div>
      </div>

      {/* Grid de Carreiras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
        {careers.map((career) => {
          const canStart = character.attributes.energy >= 20 && !career.isWorking;
          // Cálculo do salário com base na produtividade
          const effectiveSalary = isHighProd
            ? Math.round(career.salaryPerShift * 1.2)
            : career.salaryPerShift;

          return (
            <div
              key={career.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    {career.icon}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Nível {career.level}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-3">{career.name}</h4>
                <p className="text-xs text-amber-300 font-semibold">{career.rankTitle}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{career.tagline}</p>

                <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <strong className={isHighProd ? 'text-emerald-400' : 'text-slate-200'}>
                      +{effectiveSalary} Kamas
                    </strong>
                    {isHighProd && <span className="text-[9px] text-emerald-400">(+20%)</span>}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {career.shiftDurationMinutes} min
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {/* Botão de Promoção Desbloqueado */}
                {canPromote && (
                  <button
                    onClick={() => onPromote(career.id)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>PROMOÇÃO DE CARGO DISPONÍVEL! 🎉</span>
                  </button>
                )}

                {/* Botão de Turno Normal */}
                {career.isWorking ? (
                  <button
                    onClick={() => onClaimShift(career.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Coletar Salário & XP!
                  </button>
                ) : (
                  <button
                    onClick={() => onStartShift(career.id)}
                    disabled={!canStart}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      canStart
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 hover:brightness-110 text-white shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Iniciar Turno (-20 Stamina)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
