import React from 'react';
import { Plus, Minus, Droplets, Sparkles } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';

interface WaterTrackerWidgetProps {
  currentCups: number;
  maxCups?: number;
  onAddCup: () => void;
  onRemoveCup: () => void;
  disabled?: boolean;
}

export const WaterTrackerWidget: React.FC<WaterTrackerWidgetProps> = ({
  currentCups,
  maxCups = 8,
  onAddCup,
  onRemoveCup,
  disabled = false,
}) => {
  const currentMl = currentCups * 250;
  const targetMl = maxCups * 250;
  const isTargetReached = currentCups >= maxCups;

  const handleAdd = () => {
    if (disabled || currentCups >= 12) return;
    triggerHapticFeedback();
    onAddCup();
  };

  const handleRemove = () => {
    if (disabled || currentCups <= 0) return;
    triggerHapticFeedback();
    onRemoveCup();
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Hidratação Diária
              {isTargetReached && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Meta 2L Batida!
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              {currentMl} ml <span className="text-slate-500">/ {targetMl} ml recomendados</span>
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRemove}
            disabled={disabled || currentCups <= 0}
            className="w-8 h-8 rounded-lg bg-[#1F2937] text-slate-300 hover:text-white hover:bg-[#374151] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remover copo"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdd}
            disabled={disabled || currentCups >= 12}
            className="px-3 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Beber copo d'água (+250ml)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250ml</span>
          </button>
        </div>
      </div>

      {/* Grade com os copos visuais */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
        {Array.from({ length: maxCups }).map((_, idx) => {
          const filled = idx < currentCups;
          return (
            <button
              key={idx}
              onClick={() => {
                if (idx === currentCups) handleAdd();
                else if (idx === currentCups - 1) handleRemove();
              }}
              className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200 ${
                filled
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-sm shadow-sky-500/10'
                  : 'bg-[#1F2937]/50 border-[#374151]/50 text-slate-600 hover:border-slate-500'
              }`}
            >
              <div
                className={`text-lg transition-transform ${
                  filled ? 'scale-110 drop-shadow-md' : 'opacity-40 group-hover:scale-105'
                }`}
              >
                💧
              </div>
              <span className="text-[9px] font-semibold mt-0.5">
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
