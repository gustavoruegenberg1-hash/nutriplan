import React from 'react';
import { Flame, Beef, Wheat, Droplet, Sparkles, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';

export interface MacroCardProps {
  label: string;
  value: number;
  unit?: string;
  target?: number;
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber';
  clickable?: boolean;
  onClick?: () => void;
  showAlert?: boolean;
}

export type MacroStatusType = 'BELOW' | 'MET' | 'ABOVE';

export interface MacroStatusResult {
  status: MacroStatusType;
  label: string;
  diff: number;
  message: string;
  color: string;
  badgeBg: string;
  icon: any;
}

/**
 * Função Pura para determinação do Status e Alertas da Meta Nutricional:
 * - Abaixo da meta: valor < meta (informa quanto falta)
 * - Meta atingida: valor == meta (com margem de tolerância estreita para arredondamentos)
 * - Acima da meta: valor > meta (informa quanto ultrapassou)
 */
export function getMacroGoalStatus(
  value: number,
  target?: number,
  type: string = 'calories',
  unit: string = 'g'
): MacroStatusResult | null {
  if (!target || target <= 0) return null;

  const diff = Math.round((value - target) * 10) / 10;
  const absDiff = Math.abs(diff);

  // Tolerância para arredondamento (20 kcal para calorias ou 1g para macronutrientes)
  const threshold = type === 'calories' ? 20 : 1.0;

  if (absDiff <= threshold) {
    return {
      status: 'MET',
      label: 'Meta atingida',
      diff: 0,
      message: 'Meta diária atingida com precisão',
      color: 'text-[#34D399]',
      badgeBg: 'bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]',
      icon: CheckCircle2,
    };
  }

  if (diff < 0) {
    return {
      status: 'BELOW',
      label: 'Abaixo da meta',
      diff,
      message: `Faltam ${absDiff} ${unit}`,
      color: 'text-[#FBBF24]',
      badgeBg: 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]',
      icon: AlertTriangle,
    };
  }

  return {
    status: 'ABOVE',
    label: 'Acima da meta',
    diff,
    message: `+${absDiff} ${unit} acima`,
    color: 'text-[#FB7185]',
    badgeBg: 'bg-[#FB7185]/10 border-[#FB7185]/30 text-[#FB7185]',
    icon: AlertTriangle,
  };
}

export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  value,
  unit = 'g',
  target,
  type,
  clickable = false,
  onClick,
  showAlert = true,
}) => {
  const configs = {
    calories: {
      color: 'from-orange-500 to-orange-400',
      text: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-surface-border',
      hoverBorder: 'hover:border-orange-500/50',
      icon: Flame,
      defaultUnit: 'kcal',
    },
    protein: {
      color: 'from-[#F43F5E] to-[#E11D48]',
      text: 'text-[#F43F5E]',
      bg: 'bg-[#F43F5E]/10',
      border: 'border-surface-border',
      hoverBorder: 'hover:border-[#F43F5E]/50',
      icon: Beef,
      defaultUnit: 'g',
    },
    carbs: {
      color: 'from-[#3B82F6] to-[#2563EB]',
      text: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]/10',
      border: 'border-surface-border',
      hoverBorder: 'hover:border-[#3B82F6]/50',
      icon: Wheat,
      defaultUnit: 'g',
    },
    fat: {
      color: 'from-yellow-500 to-yellow-600',
      text: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-surface-border',
      hoverBorder: 'hover:border-yellow-500/50',
      icon: Droplet,
      defaultUnit: 'g',
    },
    fiber: {
      color: 'from-[#10B981] to-[#059669]',
      text: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
      border: 'border-surface-border',
      hoverBorder: 'hover:border-[#10B981]/50',
      icon: Sparkles,
      defaultUnit: 'g',
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const displayUnit = unit || config.defaultUnit;

  // CÁLCULO DA PORCENTAGEM SEM LIMITAÇÃO A 100%
  const percentage =
    target && target > 0 ? Math.round((value / target) * 100) : null;

  // Largura visual da barra (atinge 100% visualmente e pode brilhar se passar)
  const visualBarWidth = percentage !== null ? Math.min(percentage, 100) : 0;

  // Status e alerta do nutriente
  const goalStatus = showAlert
    ? getMacroGoalStatus(value, target, type, displayUnit)
    : null;
  const StatusIcon = goalStatus?.icon;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`p-4 rounded-2xl bg-surface border ${config.border} relative overflow-hidden transition-all flex flex-col justify-between ${
        clickable
          ? `cursor-pointer hover:bg-surface-hover ${config.hoverBorder} hover:shadow-lg hover:shadow-black/40 group`
          : 'hover:bg-surface-hover/70'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {label}
            </span>
            {clickable && (
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors flex items-center">
                <Info className="w-3 h-3 ml-0.5" />
              </span>
            )}
          </div>
          <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Quantidade Consumida / Meta */}
        <div className="flex items-baseline space-x-1.5 flex-wrap">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {Math.round(value * 10) / 10}
          </span>
          <span className="text-xs text-slate-400 font-medium">{displayUnit}</span>
          {target !== undefined && target > 0 && (
            <span className="text-xs text-slate-500">/ {target}{displayUnit}</span>
          )}
        </div>
      </div>

      {/* Progress Bar & Percentage real */}
      {percentage !== null && (
        <div className="mt-3 space-y-1.5">
          <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-surface-border">
            <div
              className={`h-full bg-gradient-to-r ${config.color} transition-all duration-500`}
              style={{ width: `${visualBarWidth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <span
              className={`${
                percentage > 100
                  ? 'text-[#FB7185]'
                  : percentage === 100
                  ? 'text-[#34D399]'
                  : 'text-slate-300'
              }`}
            >
              {percentage}%
            </span>

            {/* Badge de Alerta Individual Suave */}
            {goalStatus && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${goalStatus.badgeBg}`}
                title={goalStatus.message}
              >
                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                <span>{goalStatus.label}</span>
              </span>
            )}
          </div>

          {/* Mensagem detalhada de quanto falta ou quanto passou */}
          {goalStatus && (
            <span className="text-[10px] text-slate-400 block text-right font-medium">
              {goalStatus.message}
            </span>
          )}
        </div>
      )}

      {/* Dica de clique visual no rodapé do card se for clicável */}
      {clickable && (
        <div className="mt-2 pt-2 border-t border-surface-border flex items-center justify-between text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
          <span>O que é este nutriente?</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
};
