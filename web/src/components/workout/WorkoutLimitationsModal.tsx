import React, { useState, useEffect } from 'react';
import { Dumbbell, ShieldAlert, X, Check, Loader2, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User, PainDetail } from '../../types';

interface WorkoutLimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BODY_REGIONS_LIST = [
  'Ombro direito',
  'Ombro esquerdo',
  'Cotovelo direito',
  'Cotovelo esquerdo',
  'Punho direito',
  'Punho esquerdo',
  'Coluna / Lombar',
  'Pescoço / Cervical',
  'Quadril direito',
  'Quadril esquerdo',
  'Joelho direito',
  'Joelho esquerdo',
  'Tornozelo direito',
  'Tornozelo esquerdo',
];

const MUSCLE_GROUPS_LIST = [
  { id: 'CHEST', label: 'Peitoral' },
  { id: 'BACK', label: 'Costas' },
  { id: 'SHOULDERS', label: 'Deltoides / Ombros' },
  { id: 'BICEPS', label: 'Bíceps' },
  { id: 'TRICEPS', label: 'Tríceps' },
  { id: 'FOREARMS', label: 'Antebraços' },
  { id: 'ABS', label: 'Abdômen / Core' },
  { id: 'LOWER_BACK', label: 'Lombar' },
  { id: 'GLUTES', label: 'Glúteos' },
  { id: 'QUADRICEPS', label: 'Quadríceps' },
  { id: 'HAMSTRINGS', label: 'Posteriores de coxa' },
  { id: 'CALVES', label: 'Panturrilhas' },
];

export const WorkoutLimitationsModal: React.FC<WorkoutLimitationsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateProfile } = useAuth();

  // Nível e Frequência
  const [experienceLevel, setExperienceLevel] = useState<string>('BEGINNER');
  const [trainingFrequencyDays, setTrainingFrequencyDays] = useState<number>(4);

  // Articulações
  const [hasJointPain, setHasJointPain] = useState<string | null>(null);
  const [affectedJoints, setAffectedJoints] = useState<string[]>([]);
  const [jointPainNotes, setJointPainNotes] = useState<string>('');

  // Lesões Musculares
  const [hasMuscleInjuries, setHasMuscleInjuries] = useState<string | null>(null);
  const [affectedMuscles, setAffectedMuscles] = useState<string[]>([]);

  // Dores em Movimentos
  const [hasExercisePain, setHasExercisePain] = useState<string | null>(null);
  const [painRegion, setPainRegion] = useState<string>('');
  const [painMovement, setPainMovement] = useState<string>('');
  const [painIntensity, setPainIntensity] = useState<number>(5);

  // Deficiências Físicas / Limitações de Mobilidade
  const [hasPhysicalDisabilities, setHasPhysicalDisabilities] = useState<string | null>(null);
  const [affectedBodyRegions, setAffectedBodyRegions] = useState<string[]>([]);
  const [physicalDisabilityNotes, setPhysicalDisabilityNotes] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar com os dados atuais do usuário sempre que o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      setExperienceLevel(user.experienceLevel || 'BEGINNER');
      setTrainingFrequencyDays(user.trainingFrequencyDays || 4);

      setHasJointPain(user.hasJointPain ?? null);
      setAffectedJoints(user.affectedJoints || []);
      setJointPainNotes(user.jointPainNotes || '');

      setHasMuscleInjuries(user.hasMuscleInjuries ?? null);
      setAffectedMuscles(user.affectedMuscles || []);

      setHasExercisePain(user.hasExercisePain ?? null);
      if (user.painDetails && user.painDetails.length > 0) {
        setPainRegion(user.painDetails[0].region || '');
        setPainMovement(user.painDetails[0].movement || '');
        setPainIntensity(user.painDetails[0].intensity || 5);
      } else {
        setPainRegion('');
        setPainMovement('');
        setPainIntensity(5);
      }

      setHasPhysicalDisabilities(user.hasPhysicalDisabilities ?? null);
      setAffectedBodyRegions(user.affectedBodyRegions || []);
      setPhysicalDisabilityNotes(user.physicalDisabilityNotes || '');

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

  const toggleArrayItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleQuickNoLimitations = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: Partial<User> = {
        experienceLevel: user?.experienceLevel || 'BEGINNER',
        trainingFrequencyDays: user?.trainingFrequencyDays || 4,
        weightTrainingExperience:
          user?.experienceLevel === 'RETURNING'
            ? 'PREVIOUSLY'
            : user?.experienceLevel === 'BEGINNER'
            ? 'NEVER'
            : 'CURRENTLY',
        weightTrainingTimeMonths:
          user?.experienceLevel === 'ADVANCED' ? 36 : user?.experienceLevel === 'INTERMEDIATE' ? 12 : 3,
        hasPhysicalDisabilities: 'NO',
        affectedBodyRegions: [],
        physicalDisabilityNotes: '',
        hasMuscleInjuries: 'NO',
        affectedMuscles: [],
        hasJointPain: 'NO',
        affectedJoints: [],
        jointPainNotes: '',
        hasExercisePain: 'NO',
        painDetails: [],
        difficultMovements: [],
        exercisesToAvoid: [],
        availableEquipment: user?.availableEquipment?.length ? user.availableEquipment : ['FULL_GYM'],
      };
      await updateProfile(payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar condições de treino.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasJointPain || !hasMuscleInjuries || !hasExercisePain || !hasPhysicalDisabilities) {
      setError('Por favor, responda às perguntas de segurança antes de continuar.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const painDetailsList: PainDetail[] =
        hasExercisePain === 'YES' || hasExercisePain === 'SOMETIMES'
          ? [
              {
                region: painRegion || 'Não especificada',
                movement: painMovement || 'Movimento geral',
                intensity: painIntensity,
              },
            ]
          : [];

      const payload: Partial<User> = {
        experienceLevel,
        trainingFrequencyDays,
        weightTrainingExperience:
          experienceLevel === 'RETURNING'
            ? 'PREVIOUSLY'
            : experienceLevel === 'BEGINNER'
            ? 'NEVER'
            : 'CURRENTLY',
        weightTrainingTimeMonths:
          experienceLevel === 'ADVANCED' ? 36 : experienceLevel === 'INTERMEDIATE' ? 12 : 3,

        hasPhysicalDisabilities,
        affectedBodyRegions: hasPhysicalDisabilities === 'YES' ? affectedBodyRegions : [],
        physicalDisabilityNotes: hasPhysicalDisabilities === 'YES' ? physicalDisabilityNotes : '',

        hasMuscleInjuries,
        affectedMuscles: hasMuscleInjuries === 'YES' ? affectedMuscles : [],

        hasJointPain,
        affectedJoints: hasJointPain === 'YES' ? affectedJoints : [],
        jointPainNotes: hasJointPain === 'YES' ? jointPainNotes : '',

        hasExercisePain,
        painDetails: painDetailsList,
        availableEquipment: user?.availableEquipment?.length ? user.availableEquipment : ['FULL_GYM'],
      };

      await updateProfile(payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar condições e limitações de treino.');
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
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Condições e Limitações para Treino
              </h2>
              <p className="text-xs text-slate-400">
                Responda uma única vez para personalizar seus treinos com segurança biomecânica
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
            onClick={handleQuickNoLimitations}
            disabled={isSaving}
            className="w-full p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Não possuo nenhuma lesão, dor ou limitação física</span>
            </div>
            <span className="text-[11px] bg-blue-500/20 px-2 py-0.5 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
              1-Clique
            </span>
          </button>

          {/* Questão 1: Nível de Experiência e Frequência */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Experiência e Frequência Pretendida
              </label>
              <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" /> Configurado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nível de Experiência
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0F172A] border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="BEGINNER">Iniciante (&lt; 6 meses)</option>
                  <option value="INTERMEDIATE">Intermediário (6 meses a 2 anos)</option>
                  <option value="ADVANCED">Avançado (&gt; 2 anos)</option>
                  <option value="RETURNING">Retornando aos treinos</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Dias por Semana
                </label>
                <select
                  value={trainingFrequencyDays}
                  onChange={(e) => setTrainingFrequencyDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#0F172A] border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  {[2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {d} dias por semana
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Questão 2: Problemas nas Articulações */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Possui dor, inflamação ou lesão articular?
              </label>
              {hasJointPain !== null && (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {[
                { val: 'NO', label: 'Não' },
                { val: 'YES', label: 'Sim' },
                { val: 'UNSURE', label: 'Não tenho certeza' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modalHasJointPain"
                    checked={hasJointPain === opt.val}
                    onChange={() => setHasJointPain(opt.val)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {hasJointPain === 'YES' && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-medium">
                  Selecione as articulações afetadas (exercícios de alto impacto serão alertados):
                </span>
                <div className="flex flex-wrap gap-2">
                  {BODY_REGIONS_LIST.map((j) => {
                    const isSelected = affectedJoints.includes(j);
                    return (
                      <button
                        type="button"
                        key={j}
                        onClick={() => toggleArrayItem(affectedJoints, setAffectedJoints, j)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {j} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={jointPainNotes}
                  onChange={(e) => setJointPainNotes(e.target.value)}
                  placeholder="Observação médica (ex: Condromalácia patelar grau 2 no joelho direito)..."
                  className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>
            )}
          </div>

          {/* Questão 3: Lesões Musculares */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. Possui estiramento ou lesão muscular ativa?
              </label>
              {hasMuscleInjuries !== null && (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {[
                { val: 'NO', label: 'Não' },
                { val: 'YES', label: 'Sim' },
                { val: 'UNSURE', label: 'Não tenho certeza' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modalHasMuscleInjuries"
                    checked={hasMuscleInjuries === opt.val}
                    onChange={() => setHasMuscleInjuries(opt.val)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {hasMuscleInjuries === 'YES' && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-2 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-medium">
                  Selecione os grupos musculares com lesão:
                </span>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS_LIST.map((m) => {
                    const isSelected = affectedMuscles.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => toggleArrayItem(affectedMuscles, setAffectedMuscles, m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {m.label} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Questão 4: Dor em Movimentos Específicos */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                4. Sente dor durante ou após algum movimento?
              </label>
              {hasExercisePain !== null && (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {[
                { val: 'NO', label: 'Não' },
                { val: 'YES', label: 'Sim' },
                { val: 'SOMETIMES', label: 'Às vezes' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modalHasExercisePain"
                    checked={hasExercisePain === opt.val}
                    onChange={() => setHasExercisePain(opt.val)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {(hasExercisePain === 'YES' || hasExercisePain === 'SOMETIMES') && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Região da Dor
                    </label>
                    <input
                      type="text"
                      value={painRegion}
                      onChange={(e) => setPainRegion(e.target.value)}
                      placeholder="Ex: Joelho direito, Lombar..."
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Movimento / Exercício
                    </label>
                    <input
                      type="text"
                      value={painMovement}
                      onChange={(e) => setPainMovement(e.target.value)}
                      placeholder="Ex: Agachamento profundo, Supino..."
                      className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Intensidade Percebida da Dor:
                    </span>
                    <span className="text-xs font-extrabold text-rose-400">{painIntensity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={painIntensity}
                    onChange={(e) => setPainIntensity(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 - Leve</span>
                    <span>5 - Moderada</span>
                    <span>10 - Intensa</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questão 5: Deficiência Física ou Limitação de Mobilidade */}
          <div className="space-y-3 pt-4 border-t border-[#243044]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                5. Possui alguma limitação de movimento ou mobilidade?
              </label>
              {hasPhysicalDisabilities !== null && (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Respondido
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {[
                { val: 'NO', label: 'Não' },
                { val: 'YES', label: 'Sim' },
                { val: 'UNSURE', label: 'Não tenho certeza' },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="modalHasPhysicalDisabilities"
                    checked={hasPhysicalDisabilities === opt.val}
                    onChange={() => setHasPhysicalDisabilities(opt.val)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {hasPhysicalDisabilities === 'YES' && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-surface-border space-y-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-medium">
                  Selecione as regiões afetadas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {BODY_REGIONS_LIST.map((region) => {
                    const isSelected = affectedBodyRegions.includes(region);
                    return (
                      <button
                        type="button"
                        key={region}
                        onClick={() => toggleArrayItem(affectedBodyRegions, setAffectedBodyRegions, region)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {region} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={physicalDisabilityNotes}
                  onChange={(e) => setPhysicalDisabilityNotes(e.target.value)}
                  placeholder="Descrição complementar da limitação (opcional)..."
                  className="w-full px-3 py-2 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
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
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
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
