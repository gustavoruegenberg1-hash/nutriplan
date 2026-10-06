import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  User as UserIcon,
  Scale,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  TrendingUp,
  Lock,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { ProfessionalContactModal } from '../components/ProfessionalContactModal';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs = ['personal', 'evolution', 'security'];
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'personal';

  const [activeTab, setActiveTab] = useState<'personal' | 'evolution' | 'security'>(initialTab as any);
  const [profileData, setProfileData] = useState<any>(null);
  const [availableRestrictions, setAvailableRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form states - Dados pessoais
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('MALE');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<string>('SEDENTARY');
  const [goal, setGoal] = useState<string>('MAINTAIN');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  // Form states - Nova Pesagem
  const [newWeight, setNewWeight] = useState<number | ''>('');
  const [weightNote, setWeightNote] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Form states - Alteração de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loadData = async () => {
    setLoading(true);
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

  const handleTabChange = (tab: 'personal' | 'evolution' | 'security') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
      setFeedback({ type: 'success', message: 'Perfil e parâmetros antropométricos atualizados com sucesso!' });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFeedback({
        type: 'error',
        message: Array.isArray(msg) ? msg.join(', ') : msg || 'Falha ao salvar dados do perfil.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddWeightRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || Number(newWeight) < 20 || Number(newWeight) > 350) {
      setFeedback({ type: 'error', message: 'Informe um peso válido entre 20 e 350 kg.' });
      return;
    }
    setSavingWeight(true);
    try {
      await api.post('/profile/weight', {
        weight: Number(newWeight),
        notes: weightNote || undefined,
      });
      setNewWeight('');
      setWeightNote('');
      await loadData();
      setFeedback({ type: 'success', message: 'Nova pesagem registrada na evolução!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao registrar pesagem.' });
    } finally {
      setSavingWeight(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve possuir no mínimo 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A confirmação de senha não coincide.' });
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Senha de acesso alterada com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Falha ao alterar senha.' });
    } finally {
      setSavingPassword(false);
    }
  };

  // Cálculo de IMC e Classificação
  const currentWeightNum = profileData?.profile?.weight;
  const heightCmNum = profileData?.profile?.height;
  let bmi: number | null = null;
  let bmiCategory = '';
  let bmiColor = 'text-emerald-400';

  if (currentWeightNum && heightCmNum && heightCmNum > 0) {
    const heightM = heightCmNum / 100;
    bmi = Math.round((currentWeightNum / (heightM * heightM)) * 10) / 10;
    if (bmi < 18.5) {
      bmiCategory = 'Baixo peso';
      bmiColor = 'text-amber-400';
    } else if (bmi < 25) {
      bmiCategory = 'Eutrofia (Peso saudável)';
      bmiColor = 'text-emerald-400';
    } else if (bmi < 30) {
      bmiCategory = 'Sobrepeso';
      bmiColor = 'text-amber-400';
    } else {
      bmiCategory = 'Obesidade';
      bmiColor = 'text-rose-400';
    }
  }

  const weightHistory = profileData?.recentWeightHistory || [];
  let weightDelta: number | null = null;
  if (weightHistory.length >= 2) {
    const oldest = weightHistory[weightHistory.length - 1].weight;
    const newest = weightHistory[0].weight;
    weightDelta = Math.round((newest - oldest) * 10) / 10;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando dados do usuário...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <UserIcon className="text-emerald-400" size={28} />
              <span>Perfil & Dados do Usuário</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gerencie seus dados pessoais, objetivos, histórico de evolução antropométrica e credenciais.
            </p>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25 font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <MessageSquare size={15} />
            <span>Falar com Profissional</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navegação por Sub-Abas do Perfil */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'personal'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Dados & Metas Antropométricas
          </button>

          <button
            onClick={() => handleTabChange('evolution')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'evolution'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp size={14} />
            <span>Evolução & Pesagens</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Segurança & Conta</span>
          </button>
        </div>

        {/* ============================================================= */}
        {/* SUB-ABA 1: DADOS & METAS ANTROPOMÉTRICAS */}
        {/* ============================================================= */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <h3 className="font-bold text-white text-base">Informações Antropométricas</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    disabled
                    value={profileData?.user?.email || ''}
                    className="w-full bg-slate-800/40 border border-slate-800 rounded-xl px-4 py-2 text-slate-500 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Idade (anos)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sexo Biológico</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={20}
                    max={350}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    min={50}
                    max={250}
                    value={height}
                    onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nível de Atividade</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SEDENTARY">Sedentário (pouco exercício)</option>
                    <option value="LIGHT">Leve (1-3 dias/semana)</option>
                    <option value="MODERATE">Moderado (3-5 dias/semana)</option>
                    <option value="INTENSE">Intenso (6-7 dias/semana)</option>
                    <option value="VERY_INTENSE">Extremamente Ativo (atleta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Objetivo Nutricional</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOSE_WEIGHT">Emagrecimento (Déficit)</option>
                    <option value="MAINTAIN">Manutenção (Normocalórica)</option>
                    <option value="GAIN_WEIGHT">Hipertrofia (Superávit)</option>
                  </select>
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase">Restrições Alimentares</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableRestrictions.map((r: any) => {
                    const isChecked = selectedRestrictions.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedRestrictions(selectedRestrictions.filter((id) => id !== r.id));
                          } else {
                            setSelectedRestrictions([...selectedRestrictions, r.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition text-center ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-semibold'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observações Alimentares */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Preferências & Alimentos a Evitar
                </label>
                <textarea
                  rows={3}
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="Ex: Não gosto de peixe, prefiro frango e ovos; evito alimentos muito doces à noite."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================= */}
        {/* SUB-ABA 2: EVOLUÇÃO & PESAGENS */}
        {/* ============================================================= */}
        {activeTab === 'evolution' && (
          <div className="space-y-6">
            {/* Cards de Resumo Antropométrico */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Índice de Massa Corporal (IMC)</span>
                <div className={`text-3xl font-extrabold mt-1 ${bmiColor}`}>
                  {bmi !== null ? `${bmi} kg/m²` : '--'}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">{bmiCategory || 'Informe peso e altura'}</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Variação Total (Delta)</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {weightDelta !== null ? `${weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg` : '--'}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Desde a primeira pesagem registrada</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Registros de Peso</span>
                <div className="text-3xl font-extrabold text-teal-400 mt-1">{weightHistory.length}</div>
                <span className="text-xs text-slate-400 mt-1 block">Histórico cronológico gravado</span>
              </div>
            </div>

            {/* Formulário de Nova Pesagem */}
            <form onSubmit={handleAddWeightRecord} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Scale size={18} className="text-emerald-400" />
                <span>Registrar Nova Pesagem</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={20}
                    max={350}
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 75.5"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Observações (opcional)</label>
                  <input
                    type="text"
                    value={weightNote}
                    onChange={(e) => setWeightNote(e.target.value)}
                    placeholder="Ex: Em jejum, pós-treino, etc."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingWeight}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>{savingWeight ? 'Registrando...' : 'Salvar Pesagem'}</span>
              </button>
            </form>

            {/* Histórico Cronológico de Pesagens */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Linha do Tempo de Pesagens</h3>

              {weightHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhuma pesagem adicional registrada além do peso inicial do perfil.
                </div>
              ) : (
                <div className="space-y-2">
                  {weightHistory.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-white text-sm block">{item.weight} kg</strong>
                        {item.notes && <span className="text-slate-400 text-[11px]">{item.notes}</span>}
                      </div>
                      <span className="text-slate-500 text-xs font-mono">
                        {new Date(item.recordedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* SUB-ABA 3: SEGURANÇA & CONTA */}
        {/* ============================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Informações da Conta */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Informações da Conta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 block">Tipo de Perfil:</span>
                  <strong className="text-emerald-400 text-sm mt-0.5 block">
                    {user?.role === 'ADMIN'
                      ? 'Administrador da Plataforma'
                      : user?.role === 'PROFESSIONAL'
                      ? 'Profissional de Saúde'
                      : 'Aluno / Paciente'}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 block">Status da Conta:</span>
                  <strong className="text-white text-sm mt-0.5 block">Ativa & Verificada</strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-400 block">Data de Cadastro:</span>
                  <strong className="text-slate-300 text-sm mt-0.5 block">
                    {profileData?.user?.createdAt
                      ? new Date(profileData.user.createdAt).toLocaleDateString('pt-BR')
                      : '--'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Alteração de Senha */}
            <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock size={18} className="text-emerald-400" />
                <span>Alterar Senha de Acesso</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {savingPassword ? 'Alterando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          </div>
        )}
      </div>

      <ProfessionalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
