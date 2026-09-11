import React from 'react';
import { ProfessionalType } from '../../types/professionals';
import { Search, Utensils, Dumbbell, Sparkles, Filter, X } from 'lucide-react';

interface ProfessionalFilterProps {
  selectedType: 'ALL' | ProfessionalType;
  onTypeChange: (type: 'ALL' | ProfessionalType) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (only: boolean) => void;
  counts: {
    all: number;
    nutritionists: number;
    trainers: number;
  };
}

export const ProfessionalFilter: React.FC<ProfessionalFilterProps> = ({
  selectedType,
  onTypeChange,
  searchTerm,
  onSearchChange,
  onlyAvailable,
  onOnlyAvailableChange,
  counts,
}) => {
  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-4 mb-6 shadow-md space-y-4">
      {/* 1. Barra de Busca com Botão de Limpeza */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar por nome, especialidade (ex: esportiva, hipertrofia), cidade..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-alt border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            title="Limpar pesquisa"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Abas de Categoria e Filtro de Disponibilidade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-surface-border/60">
        {/* Abas de Tipos */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => onTypeChange('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-surface-alt hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-200">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onTypeChange('NUTRITIONIST')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedType === 'NUTRITIONIST'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                : 'bg-surface-alt hover:bg-slate-700 text-emerald-400/90'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Nutrição</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedType === 'NUTRITIONIST'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-950/60 text-emerald-300'
              }`}
            >
              {counts.nutritionists}
            </span>
          </button>

          <button
            onClick={() => onTypeChange('TRAINER')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedType === 'TRAINER'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/40'
                : 'bg-surface-alt hover:bg-slate-700 text-amber-400/90'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Treino</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedType === 'TRAINER'
                  ? 'bg-amber-800 text-white'
                  : 'bg-amber-950/60 text-amber-300'
              }`}
            >
              {counts.trainers}
            </span>
          </button>
        </div>

        {/* Filtro: Apenas Disponíveis */}
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none self-end sm:self-auto">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => onOnlyAvailableChange(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-surface-alt border-slate-700 cursor-pointer"
          />
          <span className="font-medium">Apenas com agenda aberta</span>
        </label>
      </div>
    </div>
  );
};
