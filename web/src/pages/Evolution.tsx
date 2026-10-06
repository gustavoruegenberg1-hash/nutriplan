import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  TrendingUp,
  Scale,
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface WeightRecord {
  id: string;
  weight: number;
  recordedAt: string;
  notes: string | null;
}

export const Evolution: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState<number | ''>('');
  const [weightNote, setWeightNote] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await api.get('/profile');
      setProfileData(res.data);
      setWeightHistory(res.data.recentWeightHistory || []);
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar dados de evolução.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || Number(newWeight) <= 0) return;
    setSavingWeight(true);
    try {
      await api.post('/profile/weight', {
        weight: Number(newWeight),
        notes: weightNote || undefined,
      });
      setFeedback({ type: 'success', message: 'Nova pesagem registrada com sucesso!' });
      setNewWeight('');
      setWeightNote('');
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao registrar peso.' });
    } finally {
      setSavingWeight(false);
    }
  };

  // Cálculo de IMC
  const currentWeight = profileData?.profile?.weight;
  const heightCm = profileData?.profile?.height;
  let bmi: number | null = null;
  let bmiCategory = '';
  let bmiColor = 'text-emerald-400';

  if (currentWeight && heightCm && heightCm > 0) {
    const heightM = heightCm / 100;
    bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;
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

  // Delta de peso (primeiro registro vs mais recente)
  let weightDelta: number | null = null;
  if (weightHistory.length >= 2) {
    const oldest = weightHistory[weightHistory.length - 1].weight;
    const newest = weightHistory[0].weight;
    weightDelta = Math.round((newest - oldest) * 10) / 10;
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Evolução e Antropometria
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              Acompanhamento Contínuo
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Histórico longitudinal de pesagens, índice de massa corporal (IMC) e progressão em relação ao objetivo.
          </p>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peso Atual */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Peso Atual</span>
            <Scale size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {currentWeight ? `${currentWeight} kg` : '--'}
          </div>
          <div className="text-xs text-slate-400">
            {heightCm ? `Altura: ${heightCm} cm` : 'Cadastre sua altura no perfil'}
          </div>
        </div>

        {/* IMC */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Índice IMC</span>
            <TrendingUp size={18} className="text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {bmi ? bmi : '--'}{' '}
            <span className="text-xs font-medium text-slate-400">kg/m²</span>
          </div>
          <div className={`text-xs font-bold ${bmiColor}`}>
            {bmiCategory || 'Informe peso e altura'}
          </div>
        </div>

        {/* Variação de Peso */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Variação Total</span>
            {weightDelta !== null ? (
              weightDelta > 0 ? (
                <ArrowUpRight size={18} className="text-rose-400" />
              ) : weightDelta < 0 ? (
                <ArrowDownRight size={18} className="text-emerald-400" />
              ) : (
                <Minus size={18} className="text-slate-400" />
              )
            ) : (
              <Minus size={18} className="text-slate-500" />
            )}
          </div>
          <div className="text-3xl font-black text-white">
            {weightDelta !== null
              ? `${weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg`
              : '--'}
          </div>
          <div className="text-xs text-slate-400">
            {weightHistory.length >= 2 ? `Com base em ${weightHistory.length} registros` : 'Requer 2+ pesagens'}
          </div>
        </div>

        {/* Objetivo */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Objetivo Definido</span>
            <CheckCircle2 size={18} className="text-amber-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 truncate">
            {profileData?.profile?.goal === 'LOSE_WEIGHT'
              ? 'Emagrecimento'
              : profileData?.profile?.goal === 'GAIN_WEIGHT'
              ? 'Ganho de Massa'
              : 'Manutenção de Peso'}
          </div>
          <div className="text-xs text-slate-400">
            Meta: {profileData?.targets?.calories || '--'} kcal/dia
          </div>
        </div>
      </div>

      {/* Formulário de Nova Pesagem e Tabela Histórica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Registro Rápido */}
        <div className="lg:col-span-1 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Scale size={18} className="text-emerald-400" />
            <span>Registrar Nova Pesagem</span>
          </div>

          <form onSubmit={handleAddWeight} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Peso Atual (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="350"
                required
                placeholder="Ex: 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Contexto (opcional)</label>
              <textarea
                rows={3}
                placeholder="Ex: Pós-treino em jejum; retenção hídrica normal."
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingWeight}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={16} />
              <span>{savingWeight ? 'Registrando...' : 'Salvar Registro'}</span>
            </button>
          </form>
        </div>

        {/* Tabela de Pesagens Anteriores */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Calendar size={18} className="text-teal-400" />
              <span>Linha do Tempo de Pesagens</span>
            </div>
            <span className="text-xs text-slate-400">{weightHistory.length} registros</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Carregando pesagens...</div>
          ) : weightHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm space-y-2">
              <Scale size={36} className="mx-auto text-slate-600" />
              <p>Nenhuma pesagem cadastrada ainda.</p>
              <p className="text-xs">Cadastre seu primeiro peso ao lado para acompanhar a curva de evolução.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {weightHistory.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{item.weight} kg</span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Mais recente
                        </span>
                      )}
                    </div>
                    {item.notes && <p className="text-xs text-slate-400 italic">{item.notes}</p>}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">{formatDate(item.recordedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aviso de Saúde */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Nota Antropométrica:</span> O IMC é uma métrica populacional e não distingue massa magra de gordura visceral. Atletas e praticantes regulares de musculação com alta densidade muscular podem apresentar IMC acima da faixa eutrófica sem acúmulo patológico de tecido adiposo.
        </div>
      </div>
    </div>
  );
};
