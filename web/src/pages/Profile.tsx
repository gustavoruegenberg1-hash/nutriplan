import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User as UserIcon, Scale, CheckCircle2, AlertCircle, Save, Plus } from 'lucide-react';

export const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [availableRestrictions, setAvailableRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('MALE');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<string>('SEDENTARY');
  const [goal, setGoal] = useState<string>('MAINTAIN');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  // Novo registro de peso
  const [newWeight, setNewWeight] = useState<number | ''>('');
  const [weightNote, setWeightNote] = useState('');

  const loadData = async () => {
    try {
      const [profRes, restRes] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/restrictions'),
      ]);

      const data = profRes.data;
      setProfileData(data);
      setAvailableRestrictions(restRes.data);

      setName(data.user.name || '');
      setAge(data.profile.age ?? '');
      setGender(data.profile.gender || 'MALE');
      setWeight(data.profile.weight ?? '');
      setHeight(data.profile.height ?? '');
      setActivityLevel(data.profile.activityLevel || 'SEDENTARY');
      setGoal(data.profile.goal || 'MAINTAIN');
      setDietaryNotes(data.profile.dietaryNotes || '');
      setSelectedRestrictions(data.restrictions.map((r: any) => r.id));
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar dados do perfil.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.put('/profile', {
        name,
        age: age === '' ? undefined : Number(age),
        gender,
        weight: weight === '' ? undefined : Number(weight),
        height: height === '' ? undefined : Number(height),
        activityLevel,
        goal,
        dietaryNotes: dietaryNotes || undefined,
        restrictionIds: selectedRestrictions,
      });

      setProfileData(res.data);
      setFeedback({ type: 'success', message: 'Perfil e parâmetros nutricionais atualizados com sucesso!' });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFeedback({
        type: 'error',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Falha ao salvar perfil.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddWeightRecord = async () => {
    if (!newWeight || Number(newWeight) < 20 || Number(newWeight) > 350) {
      setFeedback({ type: 'error', message: 'Informe um peso válido entre 20 e 350 kg.' });
      return;
    }

    try {
      await api.post('/profile/weight', {
        weight: Number(newWeight),
        notes: weightNote || undefined,
      });
      setNewWeight('');
      setWeightNote('');
      await loadData();
      setFeedback({ type: 'success', message: 'Novo peso registrado com sucesso no histórico!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao registrar peso.' });
    }
  };

  const toggleRestriction = (id: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12 text-slate-100">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <UserIcon className="text-emerald-400" size={28} />
          <span>Meu Perfil & Parâmetros Fisiológicos</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure seus dados biométricos e restrições para calibração dos cálculos científicos.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Estimativas Calculadas (TMB, TDEE, Metas) */}
      {profileData?.targets && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">TMB Calculada</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {profileData.profile.bmr} <span className="text-xs text-slate-400 font-normal">kcal</span>
            </div>
            <span className="text-[11px] text-slate-500">Mifflin-St Jeor</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Gasto Diário (TDEE)</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {profileData.profile.tdee} <span className="text-xs text-slate-400 font-normal">kcal</span>
            </div>
            <span className="text-[11px] text-slate-500">Com nível de atividade</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Meta Calórica</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
              {profileData.targets.calories} <span className="text-xs text-slate-400 font-normal">kcal</span>
            </div>
            <span className="text-[11px] text-slate-500">Conforme objetivo</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Macros Alvo (P/C/G)</span>
            <div className="text-sm font-bold text-slate-200 mt-2">
              <span className="text-sky-400">{profileData.targets.proteinGrams}g P</span> •{' '}
              <span className="text-amber-400">{profileData.targets.carbsGrams}g C</span> •{' '}
              <span className="text-rose-400">{profileData.targets.fatGrams}g G</span>
            </div>
            <span className="text-[11px] text-slate-500">2g/kg Prot • 0.9g/kg Gord</span>
          </div>
        </div>
      )}

      {/* Formulário Principal */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Dados Biométricos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Sexo Biológico</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Idade (anos)</label>
            <input
              type="number"
              min={10}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 25"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Peso Corporal (kg)</label>
            <input
              type="number"
              step="0.1"
              min={20}
              max={350}
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 75.5"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Altura (cm)</label>
            <input
              type="number"
              min={50}
              max={250}
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 178"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nível de Atividade</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="SEDENTARY">Sedentário (pouco ou nenhum exercício)</option>
              <option value="LIGHTLY_ACTIVE">Levemente Ativo (exercício 1 a 3 dias/sem)</option>
              <option value="MODERATELY_ACTIVE">Moderadamente Ativo (exercício 3 a 5 dias/sem)</option>
              <option value="VERY_ACTIVE">Muito Ativo (exercício 6 a 7 dias/sem)</option>
              <option value="EXTRA_ACTIVE">Extremamente Ativo (treino intenso diário / atleta)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Objetivo Principal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="LOSE_WEIGHT">Emagrecimento (Déficit Calórico de ~500 kcal)</option>
              <option value="MAINTAIN">Manutenção do Peso Corporal</option>
              <option value="GAIN_WEIGHT">Ganho de Massa Muscular / Hipertrofia (+350 kcal)</option>
            </select>
          </div>
        </div>

        {/* Restrições Alimentares */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Alergias e Restrições Alimentares (RN12, RN17)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableRestrictions.map((r) => {
              const checked = selectedRestrictions.includes(r.id);
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRestriction(r.id)}
                  className={`p-3 rounded-xl border text-left text-sm flex items-start gap-2.5 transition ${
                    checked
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input type="checkbox" checked={checked} readOnly className="mt-1 accent-emerald-500 pointer-events-none" />
                  <div>
                    <div className="font-semibold text-xs sm:text-sm">{r.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{r.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} />
              <span>Salvar Alterações do Perfil</span>
            </>
          )}
        </button>
      </form>

      {/* Registro de Pesagem Rápida */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Scale size={20} className="text-emerald-400" />
          <span>Registrar Nova Pesagem (Evolução Temporal)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 76.2"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Observação</label>
            <input
              type="text"
              value={weightNote}
              onChange={(e) => setWeightNote(e.target.value)}
              placeholder="Ex: Em jejum pela manhã"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddWeightRecord}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold py-2.5 rounded-xl border border-slate-700 text-sm flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={16} />
              <span>Registrar Pesagem</span>
            </button>
          </div>
        </div>

        {/* Histórico Recente de Pesagens */}
        {profileData?.recentWeightHistory && profileData.recentWeightHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Últimas medições</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profileData.recentWeightHistory.slice(0, 6).map((item: any) => (
                <div key={item.id} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{item.weight} kg</span>
                    {item.notes && <span className="text-slate-400 block text-[11px]">{item.notes}</span>}
                  </div>
                  <span className="text-slate-500">{new Date(item.recordedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
