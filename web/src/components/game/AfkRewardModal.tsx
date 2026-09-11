import React from 'react';
import { AfkReport } from '../../types/idleGame';
import { Coins, Sparkles, Clock, Skull, Check } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';

interface AfkRewardModalProps {
  report: AfkReport;
  onClaim: () => void;
}

export const AfkRewardModal: React.FC<AfkRewardModalProps> = ({ report, onClaim }) => {
  const hours = Math.floor(report.minutesOffline / 60);
  const minutes = report.minutesOffline % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutos`;

  const handleClaim = () => {
    triggerHapticFeedback();
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-center">
        {/* Luz ambiente de vitória */}
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-white">Relatório de Treinamento AFK</h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Seu herói continuou lutando por <strong className="text-slate-200">{timeFormatted}</strong>
        </p>

        {/* Grade de Espólios */}
        <div className="grid grid-cols-3 gap-2.5 my-6 text-center">
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-yellow-400 font-extrabold text-base mb-0.5">
              <Coins className="w-4 h-4" />
              <span>+{report.earnedGold}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ouro Acumulado</span>
          </div>

          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-base mb-0.5">
              <Sparkles className="w-4 h-4" />
              <span>+{report.earnedXp}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">XP de Herói</span>
          </div>

          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-rose-400 font-extrabold text-base mb-0.5">
              <Skull className="w-4 h-4" />
              <span>{report.monstersDefeated}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Monstros Abatidos</span>
          </div>
        </div>

        {/* Baús encontrados se houver */}
        {(report.chestsFound.titan > 0 ||
          report.chestsFound.nutritionist > 0 ||
          report.chestsFound.sage > 0 ||
          report.chestsFound.sprinter > 0) && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3 mb-6 text-left">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
              🎁 Baús Raros Encontrados Durante a Exploração:
            </span>
            <div className="flex gap-2 flex-wrap text-xs font-semibold text-slate-200">
              {report.chestsFound.titan > 0 && <span>+{report.chestsFound.titan} Baú do Titã</span>}
              {report.chestsFound.nutritionist > 0 && (
                <span>+{report.chestsFound.nutritionist} Baú do Nutricionista</span>
              )}
              {report.chestsFound.sage > 0 && <span>+{report.chestsFound.sage} Baú do Sábio</span>}
              {report.chestsFound.sprinter > 0 && (
                <span>+{report.chestsFound.sprinter} Baú do Velocista</span>
              )}
            </div>
          </div>
        )}

        {/* Botão de Coletar */}
        <button
          onClick={handleClaim}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Coletar Recompensas</span>
        </button>
      </div>
    </div>
  );
};
