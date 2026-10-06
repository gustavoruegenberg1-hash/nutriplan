import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatFriendlyName } from '../utils/formatters';

interface LogExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number;
  weightUsedKg: number;
  notes: string | null;
}

interface WorkoutLog {
  id: string;
  workoutId: string | null;
  workoutName: string | null;
  performedDate: string;
  durationMin: number;
  notes: string | null;
  createdAt: string;
  exercises: LogExercise[];
}

export const WorkoutHistory: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/workout-logs');
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setLogs(items);
      if (items.length > 0) {
        setExpandedLogId(items[0].id);
      }
    } catch {
      setError('Não foi possível carregar seu histórico de treinos. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Histórico de Execução de Treinos
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Registro Seguro</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Registro cronológico das sessões de treino realizadas, séries concluídas, repetições e cargas utilizadas.
          </p>
        </div>

        <Link
          to="/workouts"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Dumbbell size={16} />
          <span>Registrar Novo Treino</span>
        </Link>
      </div>

      {/* Informativo */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Histórico de Sessões:</span> Cada treino registrado guarda com precisão suas repetições, séries e cargas reais para você acompanhar sua evolução com clareza.
        </div>
      </div>

      {/* Estado de Erro com Tentar Novamente */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={20} className="shrink-0 text-rose-400" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
          >
            <RotateCcw size={14} />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {/* Lista de Sessões Registradas */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Carregando seu histórico de treinos...</p>
        </div>
      ) : !error && logs.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
          <Calendar size={48} className="mx-auto text-slate-600" />
          <h2 className="text-lg font-bold text-slate-200">Você ainda não possui treinos realizados</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Quando você concluir um treino, use o botão "Registrar Execução" dentro da sua ficha para gravar as repetições e cargas feitas.
          </p>
          <Link
            to="/workouts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            Ir para Minhas Fichas
          </Link>
        </div>
      ) : !error && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Total de {logs.length} sessões registradas</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const totalVolumeKg = log.exercises.reduce(
                (acc, ex) => acc + ex.setsCompleted * ex.repsCompleted * ex.weightUsedKg,
                0
              );

              return (
                <div
                  key={log.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-lg transition"
                >
                  {/* Header do Card */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle2 size={18} />
                        </span>
                        <h3 className="font-bold text-white text-base">
                          {formatFriendlyName(log.workoutName) || 'Treino Concluído'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pl-10.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar size={13} className="text-emerald-400" />
                          {formatDate(log.performedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-teal-400" />
                          {log.durationMin} minutos
                        </span>
                        {totalVolumeKg > 0 && (
                          <span className="flex items-center gap-1 text-teal-300">
                            <TrendingUp size={13} />
                            Volume total: {Math.round(totalVolumeKg)} kg
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {log.exercises.length} {log.exercises.length === 1 ? 'exercício' : 'exercícios'}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.exercises.reduce((acc, ex) => acc + (ex.setsCompleted || 0), 0)} séries concluídas
                      </span>
                      <button className="text-slate-400 hover:text-white p-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                      {log.notes && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic">
                          "{log.notes}"
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Exercícios Realizados:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {log.exercises.map((ex, idx) => (
                            <div
                              key={ex.id || idx}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                            >
                              <div className="font-bold text-white text-xs truncate">
                                {idx + 1}. {formatFriendlyName(ex.exerciseName) || 'Exercício'}
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-300">
                                <span>
                                  <strong className="text-emerald-400">{ex.setsCompleted}</strong> séries ×{' '}
                                  <strong className="text-white">{ex.repsCompleted}</strong> reps
                                </span>
                                <span className="font-bold text-teal-300">
                                  {ex.weightUsedKg > 0 ? `${ex.weightUsedKg} kg` : 'Corpóreo'}
                                </span>
                              </div>
                              {ex.notes && (
                                <div className="text-[11px] text-slate-400 italic truncate pt-1 border-t border-slate-800/60">
                                  {ex.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
