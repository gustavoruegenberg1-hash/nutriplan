import React, { useState, useEffect } from 'react';
import { Dumbbell, X, Check, Sparkles, Calendar, Tags } from 'lucide-react';
import { DayOfWeek } from '../../types';

export interface CreateWorkoutDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; dayOfWeek: DayOfWeek; targetMuscles: string[] }) => void;
  initialData?: { name: string; dayOfWeek: DayOfWeek; targetMuscles: string[] } | null;
  mode?: 'create' | 'edit';
  existingDayCount?: number;
}

export const AVAILABLE_MUSCLE_TAGS: { id: string; label: string; icon: string }[] = [
  { id: 'CHEST', label: 'Peitoral', icon: '🥩' },
  { id: 'BACK', label: 'Costas / Dorsal', icon: '🦅' },
  { id: 'SHOULDERS', label: 'Ombros / Deltoides', icon: '🛡️' },
  { id: 'BICEPS', label: 'Bíceps', icon: '💪' },
  { id: 'TRICEPS', label: 'Tríceps', icon: '⚡' },
  { id: 'QUADRICEPS', label: 'Quadríceps', icon: '🦵' },
  { id: 'HAMSTRINGS', label: 'Posterior de Coxa', icon: '🍗' },
  { id: 'GLUTES', label: 'Glúteos', icon: '🍑' },
  { id: 'CALVES', label: 'Panturrilhas', icon: '🦶' },
  { id: 'ABS', label: 'Abdômen & Core', icon: '🍫' },
  { id: 'FOREARMS', label: 'Antebraço', icon: '✊' },
  { id: 'CARDIO', label: 'Cardio', icon: '🏃' },
];

export const QUICK_TAG_COMBOS = [
  { label: 'Peito + Tríceps', tags: ['CHEST', 'TRICEPS'], defaultName: 'Treino - Peito e Tríceps' },
  { label: 'Costas + Bíceps', tags: ['BACK', 'BICEPS'], defaultName: 'Treino - Costas e Bíceps' },
  { label: 'Pernas Completo', tags: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'], defaultName: 'Treino - Pernas Completo' },
  { label: 'Ombros + Braços', tags: ['SHOULDERS', 'BICEPS', 'TRICEPS'], defaultName: 'Treino - Ombros e Braços' },
  { label: 'Push (Empurrar)', tags: ['CHEST', 'SHOULDERS', 'TRICEPS'], defaultName: 'Treino Push (Peito, Ombros e Tríceps)' },
  { label: 'Pull (Puxar)', tags: ['BACK', 'BICEPS', 'FOREARMS'], defaultName: 'Treino Pull (Costas e Bíceps)' },
  { label: 'Legs (Inferiores)', tags: ['QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES'], defaultName: 'Treino Legs (Inferiores)' },
  { label: 'Full Body', tags: ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS', 'HAMSTRINGS', 'ABS'], defaultName: 'Treino Full Body' },
];

const DAYS_OF_WEEK: { id: DayOfWeek; label: string }[] = [
  { id: 'MONDAY', label: 'Segunda-feira' },
  { id: 'TUESDAY', label: 'Terça-feira' },
  { id: 'WEDNESDAY', label: 'Quarta-feira' },
  { id: 'THURSDAY', label: 'Quinta-feira' },
  { id: 'FRIDAY', label: 'Sexta-feira' },
  { id: 'SATURDAY', label: 'Sábado' },
  { id: 'SUNDAY', label: 'Domingo' },
];

const NAME_SUGGESTIONS = [
  'Treino A',
  'Treino B',
  'Treino C',
  'Treino D',
  'Push',
  'Pull',
  'Legs',
  'Superiores',
  'Inferiores',
];

export const CreateWorkoutDayModal: React.FC<CreateWorkoutDayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'create',
  existingDayCount = 0,
}) => {
  const [name, setName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDayOfWeek(initialData.dayOfWeek || 'MONDAY');
        setTargetMuscles(initialData.targetMuscles || []);
      } else {
        const nextLetter = String.fromCharCode(65 + (existingDayCount % 26));
        setName(`Treino ${nextLetter}`);
        const defaultDay = DAYS_OF_WEEK[existingDayCount % DAYS_OF_WEEK.length].id;
        setDayOfWeek(defaultDay);
        setTargetMuscles([]);
      }
      setError(null);
    }
  }, [isOpen, initialData, existingDayCount]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setTargetMuscles((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const applyCombo = (combo: (typeof QUICK_TAG_COMBOS)[0]) => {
    setTargetMuscles(combo.tags);
    // Sugere nome se estiver com nome padrão
    if (!name || name.startsWith('Treino ') || name === 'Novo Treino') {
      setName(combo.defaultName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, informe um nome para o treino.');
      return;
    }

    if (targetMuscles.length === 0) {
      setError('Selecione pelo menos uma tag muscular para filtrar os exercícios deste treino.');
      return;
    }

    onSave({
      name: cleanName,
      dayOfWeek,
      targetMuscles,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#151D28] border border-[#243044] rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#243044]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {mode === 'create' ? 'Novo Dia de Treino' : 'Configurar Treino'}
              </h2>
              <p className="text-xs text-slate-400">
                Escolha o nome e as tags musculares para filtrar os exercícios automaticamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A2332] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Nome do Treino */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Nome do Treino:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-surface-border rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              autoFocus
            />

            {/* Sugestões Rápidas de Nome */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Sugestões:</span>
              {NAME_SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setName(sug)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                    name === sug
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                      : 'bg-[#1E293B] text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Dia da Semana */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Dia da Semana Pretendido:</span>
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              className="w-full px-4 py-2.5 bg-[#0F172A] border border-surface-border rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Combos Rápidos de Tags */}
          <div className="space-y-2 pt-2 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Combos Populares (1-Toque):</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAG_COMBOS.map((combo) => {
                const isActive =
                  combo.tags.length === targetMuscles.length &&
                  combo.tags.every((t) => targetMuscles.includes(t));

                return (
                  <button
                    type="button"
                    key={combo.label}
                    onClick={() => applyCombo(combo)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-[#1E293B] text-slate-400 hover:text-white border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {combo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de Tags Musculares */}
          <div className="space-y-2 pt-2 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-blue-400" />
                <span>Selecione os Músculos (Tags):</span>
              </label>
              <span className="text-[11px] text-blue-400 font-bold">
                {targetMuscles.length} {targetMuscles.length === 1 ? 'músculo' : 'músculos'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Os exercícios catalogados destas tags serão exibidos para você montar o treino:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {AVAILABLE_MUSCLE_TAGS.map((tag) => {
                const isSelected = targetMuscles.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                        : 'bg-[#0F172A] text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{tag.icon}</span>
                      <span className="truncate">{tag.label}</span>
                    </div>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                    ) : (
                      <span className="text-slate-600 text-xs">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}
        </form>

        {/* Rodapé com botões de ação */}
        <div className="p-4 sm:p-5 border-t border-[#243044] bg-[#111823] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <span>{mode === 'create' ? 'Começar Montagem do Treino ➔' : 'Salvar Alterações e Ver Exercícios ➔'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
