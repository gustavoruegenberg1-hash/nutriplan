import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, X, Check, Loader2, Sparkles, Utensils } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

interface DietaryRestrictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_ALLERGIES = [
  'Leite',
  'Ovos',
  'Amendoim',
  'Castanhas / Nozes',
  'Soja',
  'Trigo / Glúten',
  'Peixes',
  'Frutos do mar',
];

const COMMON_INTOLERANCES = [
  'Lactose',
  'Glúten',
  'Frutose',
  'FODMAPs',
  'Histamina',
];

export const DietaryRestrictionsModal: React.FC<DietaryRestrictionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuth();

  const [hasFoodAllergies, setHasFoodAllergies] = useState<boolean | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const [hasFoodIntolerances, setHasFoodIntolerances] = useState<boolean | null>(null);
  const [intolerances, setIntolerances] = useState<string[]>([]);

  const [needsProfessionalSupervision, setNeedsProfessionalSupervision] = useState<'YES' | 'NO' | 'UNSURE' | string | null>(null);
  const [dietaryRestrictionsNotes, setDietaryRestrictionsNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar com os dados atuais do usuário sempre que o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      setHasFoodAllergies(user.hasFoodAllergies ?? null);
      setAllergies(user.allergies || []);
      setHasFoodIntolerances(user.hasFoodIntolerances ?? null);
      setIntolerances(user.intolerances || []);
      setNeedsProfessionalSupervision(user.needsProfessionalSupervision ?? null);
      setDietaryRestrictionsNotes(user.dietaryRestrictionsNotes || '');
      setError(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customAllergyInput.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed]);
      setCustomAllergyInput('');
    }
  };

  const toggleIntolerance = (item: string) => {
    setIntolerances((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleQuickNoRestrictions = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<User> = {
        hasFoodAllergies: false,
        allergies: [],
        hasFoodIntolerances: false,
        intolerances: [],
        needsProfessionalSupervision: 'NO',
        dietaryRestrictionsNotes: '',
      };
      await updateProfile(payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar restrições alimentares.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasFoodAllergies === null || hasFoodIntolerances === null || needsProfessionalSupervision === null) {
      setError('Por favor, responda às 3 perguntas para continuar com segurança.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: Partial<User> = {
        hasFoodAllergies,
        allergies: hasFoodAllergies ? allergies : [],
        hasFoodIntolerances,
        intolerances: hasFoodIntolerances ? intolerances : [],
        needsProfessionalSupervision,
        dietaryRestrictionsNotes:
          needsProfessionalSupervision === 'YES' || needsProfessionalSupervision === 'UNSURE'
            ? dietaryRestrictionsNotes
            : '',
      };

      await updateProfile(payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar restrições alimentares.');
    } finally {
      setIsSaving(false);
    }
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
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Restrições e Cuidados Alimentares
              </h2>
              <p className="text-xs text-slate-400">
                Responda uma única vez para personalizar sua dieta com segurança
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

        {/* Corpo com scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Atalho de preenchimento rápido */}
          <button
            type="button"
            onClick={handleQuickNoRestrictions}
            disabled={isSaving}
            className="w-full p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Não possuo nenhuma alergia ou intolerância</span>
            </div>
            <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              1-Clique
            </span>
          </button>

          {/* Questão 1: Alergias */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Você possui alguma alergia alimentar?
              </label>
              {hasFoodAllergies !== null && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="modalHasFoodAllergies"
                  checked={hasFoodAllergies === false}
                  onChange={() => setHasFoodAllergies(false)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Não</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="modalHasFoodAllergies"
                  checked={hasFoodAllergies === true}
                  onChange={() => setHasFoodAllergies(true)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Sim</span>
              </label>
            </div>

            {hasFoodAllergies === true && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-medium">
                  Selecione os alimentos aos quais você tem alergia (não serão sugeridos):
                </span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((item) => {
                    const isSelected = allergies.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleAllergy(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-400'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {item} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAllergy();
                      }
                    }}
                    placeholder="Outro alimento com alergia..."
                    className="px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs flex-1 focus:outline-none focus:border-rose-500 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Questão 2: Intolerâncias */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Você possui alguma intolerância alimentar?
              </label>
              {hasFoodIntolerances !== null && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="modalHasFoodIntolerances"
                  checked={hasFoodIntolerances === false}
                  onChange={() => setHasFoodIntolerances(false)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Não</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="modalHasFoodIntolerances"
                  checked={hasFoodIntolerances === true}
                  onChange={() => setHasFoodIntolerances(true)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Sim</span>
              </label>
            </div>

            {hasFoodIntolerances === true && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-2 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-medium">
                  Selecione as intolerâncias que possui:
                </span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_INTOLERANCES.map((item) => {
                    const isSelected = intolerances.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleIntolerance(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {item} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Questão 3: Acompanhamento Profissional / Condição */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. Condição clínica ou acompanhamento profissional?
              </label>
              {needsProfessionalSupervision !== null && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { value: 'NO', label: 'Não' },
                { value: 'YES', label: 'Sim' },
                { value: 'UNSURE', label: 'Não tenho certeza' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modalNeedsProfessionalSupervision"
                    checked={needsProfessionalSupervision === opt.value}
                    onChange={() => setNeedsProfessionalSupervision(opt.value)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {(needsProfessionalSupervision === 'YES' || needsProfessionalSupervision === 'UNSURE') && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Aviso de Orientação Profissional</span>
                </div>
                <p className="text-[11px] text-amber-200/90">
                  Os cálculos do aplicativo são educativos. Caso tenha condições crônicas ou alergias graves, consulte sempre um nutricionista ou médico.
                </p>
                <input
                  type="text"
                  value={dietaryRestrictionsNotes}
                  onChange={(e) => setDietaryRestrictionsNotes(e.target.value)}
                  placeholder="Observações complementares ou condição clínica (opcional)..."
                  className="w-full px-3 py-2 bg-[#0F172A] border border-amber-500/30 rounded-xl text-white text-xs mt-2 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* Rodapé com botões de ação */}
        <div className="p-4 sm:p-5 border-t border-[#243044] bg-[#111823] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar e Continuar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
