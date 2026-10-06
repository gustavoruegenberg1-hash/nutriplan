import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import {
  Dumbbell,
  Plus,
  Trash2,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  History,
  Check,
} from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description?: string;
  instructions?: string;
}

interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
  sets: number;
  reps: number;
  weightKg: number;
  restSeconds: number;
  notes: string | null;
  exercise: ExerciseItem;
}

interface WorkoutDetail {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  splitName: string | null;
  estimatedDurationMin: number;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutExercise[];
}

export const WorkoutPlanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs = ['current', 'wizard', 'logger', 'history', 'exercises'];
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'current';

  const [activeTab, setActiveTab] = useState<'current' | 'wizard' | 'logger' | 'history' | 'exercises'>(
    initialTab as any
  );

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Novo Treino Manual
  const [isNewWorkoutModalOpen, setIsNewWorkoutModalOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutSplit, setNewWorkoutSplit] = useState('Treino A');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState(60);
  const [newWorkoutDesc, setNewWorkoutDesc] = useState('');

  // Modal Adicionar Exercício à Ficha
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [catalogExercises, setCatalogExercises] = useState<ExerciseItem[]>([]);
  const [searchExQuery, setSearchExQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('');
  const [selectedEx, setSelectedEx] = useState<ExerciseItem | null>(null);
  const [exSets, setExSets] = useState(4);
  const [exReps, setExReps] = useState(10);
  const [exWeightKg, setExWeightKg] = useState(20);
  const [exRestSec, setExRestSec] = useState(60);
  const [exNotes, setExNotes] = useState('');

  // -------------------------------------------------------------
  // ESTADOS DO WIZARD DE MONTAGEM (8 ETAPAS)
  // -------------------------------------------------------------
  const [wizardStarted, setWizardStarted] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardGoal, setWizardGoal] = useState<'HYPERTROPHY' | 'STRENGTH' | 'WEIGHT_LOSS' | 'ENDURANCE'>('HYPERTROPHY');
  const [wizardLevel, setWizardLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [wizardFrequency, setWizardFrequency] = useState<number>(4);
  const [wizardDuration, setWizardDuration] = useState<number>(60);
  const [wizardEquipment, setWizardEquipment] = useState<'FULL_GYM' | 'BASIC' | 'BODYWEIGHT'>('FULL_GYM');
  const [wizardLimitation, setWizardLimitation] = useState<'NONE' | 'LOWER_BACK' | 'KNEE' | 'SHOULDER'>('NONE');
  const [wizardGenerating, setWizardGenerating] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DO REGISTRADOR DE TREINO (LOGGER)
  // -------------------------------------------------------------
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logDurationMin, setLogDurationMin] = useState(60);
  const [logNotes, setLogNotes] = useState('');
  const [logRows, setLogRows] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      setsCompleted: number;
      repsCompleted: number;
      weightUsedKg: number;
      notes: string;
    }>
  >([]);
  const [savingLog, setSavingLog] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DA ABA HISTÓRICO
  // -------------------------------------------------------------
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // ESTADOS DA ABA BANCO DE EXERCÍCIOS
  // -------------------------------------------------------------
  const [allCatalogExercises, setAllCatalogExercises] = useState<ExerciseItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogMuscle, setCatalogMuscle] = useState('');
  const [catalogEquip, setCatalogEquip] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCatalogDetail, setSelectedCatalogDetail] = useState<ExerciseItem | null>(null);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data);
      if (res.data.length > 0) {
        const currentId = activeWorkout?.id;
        const targetId = currentId && res.data.some((w: any) => w.id === currentId) ? currentId : res.data[0].id;
        const detailRes = await api.get(`/workouts/${targetId}`);
        setActiveWorkout(detailRes.data);
      } else {
        setActiveWorkout(null);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar rotinas de treino.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleTabChange = (tab: 'current' | 'wizard' | 'logger' | 'history' | 'exercises') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const selectWorkout = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/workouts/${id}`);
      setActiveWorkout(res.data);
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao abrir detalhes da ficha.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    try {
      const res = await api.post('/workouts', {
        name: newWorkoutName.trim(),
        splitName: newWorkoutSplit,
        estimatedDurationMin: Number(newWorkoutDuration),
        description: newWorkoutDesc || undefined,
      });
      setIsNewWorkoutModalOpen(false);
      setNewWorkoutName('');
      await loadWorkouts();
      setActiveWorkout(res.data);
      setFeedback({ type: 'success', message: 'Nova rotina de treino criada com sucesso!' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao criar treino.' });
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta rotina de treino?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      await loadWorkouts();
      setFeedback({ type: 'success', message: 'Rotina de treino removida com sucesso.' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao excluir treino.' });
    }
  };

  const openAddExerciseModal = async () => {
    setSelectedEx(null);
    setSearchExQuery('');
    setSelectedMuscleFilter('');
    setExSets(4);
    setExReps(10);
    setExWeightKg(20);
    setExRestSec(60);
    setIsAddExerciseModalOpen(true);
    try {
      const res = await api.get('/exercises', { params: { limit: 40 } });
      setCatalogExercises(res.data);
    } catch {
      // ignore
    }
  };

  const handleSearchExerciseInModal = async (query: string, muscle: string) => {
    setSearchExQuery(query);
    setSelectedMuscleFilter(muscle);
    try {
      const res = await api.get('/exercises', {
        params: { query: query || undefined, muscleGroup: muscle || undefined, limit: 40 },
      });
      setCatalogExercises(res.data);
    } catch {
      // ignore
    }
  };

  const handleAddExerciseToWorkout = async () => {
    if (!selectedEx || !activeWorkout) return;
    try {
      const res = await api.post(`/workouts/${activeWorkout.id}/exercises`, {
        exerciseId: selectedEx.id,
        sets: Number(exSets),
        reps: Number(exReps),
        weightKg: Number(exWeightKg),
        restSeconds: Number(exRestSec),
        notes: exNotes || undefined,
      });
      setActiveWorkout(res.data);
      setIsAddExerciseModalOpen(false);
      setSelectedEx(null);
      setFeedback({ type: 'success', message: `Exercício "${selectedEx.name}" adicionado à rotina!` });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao adicionar exercício.' });
    }
  };

  const handleRemoveExercise = async (exerciseWorkoutId: string) => {
    if (!activeWorkout) return;
    try {
      const res = await api.delete(`/workouts/${activeWorkout.id}/exercises/${exerciseWorkoutId}`);
      setActiveWorkout(res.data);
      setFeedback({ type: 'success', message: 'Exercício removido do treino.' });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao remover exercício.' });
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DO WIZARD DE TREINO (GERAÇÃO ASSISTIDA)
  // -------------------------------------------------------------
  const handleFinishWizard = async () => {
    setWizardGenerating(true);
    setFeedback(null);
    try {
      const res = await api.post('/workouts/generate-suggestion', {
        goal: wizardGoal,
        daysPerWeek: wizardFrequency,
        level: wizardLevel,
        durationMin: wizardDuration,
      });
      await loadWorkouts();
      setActiveWorkout(res.data);
      setActiveTab('current');
      setWizardStarted(false);
      setWizardStep(1);
      setFeedback({
        type: 'success',
        message: 'Programa de treino gerado com sucesso! Exercícios organizados com base no seu objetivo.',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao gerar treino automático.' });
    } finally {
      setWizardGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DO LOGGER DE EXECUÇÃO (RN24)
  // -------------------------------------------------------------
  const prepareLoggerFromActiveWorkout = () => {
    if (!activeWorkout) return;
    const initialRows = activeWorkout.exercises.map((item) => ({
      exerciseId: item.exerciseId,
      exerciseName: item.exercise.name,
      setsCompleted: item.sets,
      repsCompleted: item.reps,
      weightUsedKg: item.weightKg,
      notes: '',
    }));
    setLogRows(initialRows);
    setLogDurationMin(activeWorkout.estimatedDurationMin || 60);
    setActiveTab('logger');
  };

  const handleSaveWorkoutLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logRows.length === 0) {
      setFeedback({ type: 'error', message: 'Adicione pelo menos um exercício executado.' });
      return;
    }
    setSavingLog(true);
    try {
      await api.post('/workout-logs', {
        workoutId: activeWorkout?.id || undefined,
        workoutName: activeWorkout?.name || 'Treino Livre',
        performedDate: logDate,
        durationMin: Number(logDurationMin),
        notes: logNotes || undefined,
        exercises: logRows.map((r) => ({
          exerciseId: r.exerciseId,
          exerciseName: r.exerciseName,
          setsCompleted: Number(r.setsCompleted),
          repsCompleted: Number(r.repsCompleted),
          weightUsedKg: Number(r.weightUsedKg),
          notes: r.notes || undefined,
        })),
      });

      setFeedback({ type: 'success', message: 'Treino registrado no histórico com sucesso (RN24)!' });
      setActiveTab('history');
      loadHistory();
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao registrar sessão de treino.' });
    } finally {
      setSavingLog(false);
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DA ABA HISTÓRICO
  // -------------------------------------------------------------
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/workout-logs');
      setHistoryLogs(res.data);
      if (res.data.length > 0) setExpandedLogId(res.data[0].id);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  // -------------------------------------------------------------
  // LÓGICA DA ABA BANCO DE EXERCÍCIOS
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeTab === 'exercises') {
      const fetchCatalog = async () => {
        setCatalogLoading(true);
        try {
          const res = await api.get('/exercises', {
            params: {
              query: catalogSearch || undefined,
              muscleGroup: catalogMuscle || undefined,
              equipment: catalogEquip || undefined,
              limit: 60,
            },
          });
          setAllCatalogExercises(res.data);
          if (!selectedCatalogDetail && res.data.length > 0) {
            setSelectedCatalogDetail(res.data[0]);
          }
        } catch {
          // ignore
        } finally {
          setCatalogLoading(false);
        }
      };
      const t = setTimeout(fetchCatalog, 200);
      return () => clearTimeout(t);
    }
  }, [activeTab, catalogSearch, catalogMuscle, catalogEquip]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando rotinas e exercícios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* 1. Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Dumbbell className="text-teal-400" size={28} />
            <span>Treinamento & Prescrição de Exercícios</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Programação de treinos, controle de sobrecarga progressiva e histórico de execução (RN24).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('wizard')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles size={15} />
            <span>Assistente Passo a Passo</span>
          </button>

          <button
            onClick={() => setIsNewWorkoutModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Nova Ficha</span>
          </button>
        </div>
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
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Navegação por Abas Condensadas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('current')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'current'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Meu Treino Atual
        </button>

        <button
          onClick={() => handleTabChange('wizard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'wizard'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sparkles size={14} />
          <span>Montar Novo Treino (8 Etapas)</span>
        </button>

        <button
          onClick={() => handleTabChange('logger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'logger'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <PlayCircle size={14} />
          <span>Registrar Treino</span>
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <History size={14} />
          <span>Histórico</span>
        </button>

        <button
          onClick={() => handleTabChange('exercises')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'exercises'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Dumbbell size={14} />
          <span>Banco de Exercícios</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* ABA 1: MEU TREINO ATUAL */}
      {/* ============================================================= */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {workouts.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {workouts.map((w) => (
                <button
                  key={w.id}
                  onClick={() => selectWorkout(w.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    activeWorkout?.id === w.id
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {w.name} {w.splitName && `(${w.splitName})`}
                </button>
              ))}
            </div>
          )}

          {!activeWorkout ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <Dumbbell size={48} className="mx-auto text-slate-600" />
              <h2 className="text-xl font-bold text-white">Nenhuma ficha de treino ativa</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Comece gerando um programa completo com nosso assistente ou estruture sua rotina manualmente.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => handleTabChange('wizard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
                >
                  Iniciar Montagem Passo a Passo
                </button>
                <button
                  onClick={() => setIsNewWorkoutModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
                >
                  Criar em Branco
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card de Visão Geral do Treino Ativo */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{activeWorkout.name}</h2>
                      {activeWorkout.splitName && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                          {activeWorkout.splitName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeWorkout.description || 'Programa de treinamento personalizado'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prepareLoggerFromActiveWorkout}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <PlayCircle size={15} />
                      <span>Iniciar & Registrar Treino</span>
                    </button>
                    <button
                      onClick={() => handleDeleteWorkout(activeWorkout.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Excluir rotina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Total de Exercícios</span>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {activeWorkout.exercises.length} movimentos
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Tempo Estimado</span>
                    <div className="text-xl font-extrabold text-teal-400 mt-1">
                      {activeWorkout.estimatedDurationMin} min
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Segurança & Regras</span>
                    <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                      <ShieldCheck size={16} />
                      <span>RN20–RN24 em vigor</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Exercícios Prescritos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Exercícios da Rotina</h3>
                  <button
                    onClick={openAddExerciseModal}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Adicionar Exercício</span>
                  </button>
                </div>

                {activeWorkout.exercises.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                    Nenhum exercício cadastrado nesta rotina. Clique em "Adicionar Exercício".
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeWorkout.exercises.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-white">{item.exercise.name}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              {item.exercise.muscleGroup} • {item.exercise.equipment}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className="font-bold text-white">
                              {item.sets} séries × {item.reps} reps
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {item.weightKg > 0 ? `${item.weightKg} kg` : 'Peso Corporal'} • Descanso: {item.restSeconds}s
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveExercise(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            title="Remover exercício"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 2: WIZARD DE MONTAGEM DE TREINO (8 ETAPAS) */}
      {/* ============================================================= */}
      {activeTab === 'wizard' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {!wizardStarted ? (
            /* Tela Inicial do Assistente (conforme especificação) */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-emerald-500/20">
                <Dumbbell size={32} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  MONTE SEU TREINO
                </h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                  Você irá montar seu programa de treinos passo a passo de acordo com seus objetivos, dias disponíveis e equipamentos.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs max-w-xl mx-auto">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-teal-400 block">1. Objetivo</strong>
                  <span className="text-slate-400">Hipertrofia ou força</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-teal-400 block">2. Frequência</strong>
                  <span className="text-slate-400">2 a 6 dias na semana</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-teal-400 block">3. Biomecânica</strong>
                  <span className="text-slate-400">Volume e descanso</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <strong className="text-teal-400 block">4. 128 Exercícios</strong>
                  <span className="text-slate-400">Catálogo anatômico</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setWizardStarted(true)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-base transition shadow-xl shadow-emerald-500/25 active:scale-95"
                >
                  [ INICIAR MONTAGEM ]
                </button>
              </div>
            </div>
          ) : (
            /* Fluxo das 8 Etapas de Treino */
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-teal-400">Etapa {wizardStep} de 8</span>
                  <span className="text-slate-400">
                    {wizardStep === 1 && 'Objetivo do Treinamento'}
                    {wizardStep === 2 && 'Nível de Experiência'}
                    {wizardStep === 3 && 'Frequência Semanal'}
                    {wizardStep === 4 && 'Tempo Disponível por Treino'}
                    {wizardStep === 5 && 'Equipamentos Disponíveis'}
                    {wizardStep === 6 && 'Restrições Físicas ou Limitações'}
                    {wizardStep === 7 && 'Proposta Inicial de Divisões'}
                    {wizardStep === 8 && 'Detalhamento & Conclusão'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(wizardStep / 8) * 100}%` }}
                  ></div>
                </div>
              </div>

              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 1: Qual é o seu objetivo de treino?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'HYPERTROPHY', title: 'Hipertrofia Muscular', desc: 'Foco em volume de séries (8-12 reps) para ganho de massa magra' },
                      { id: 'STRENGTH', title: 'Ganho de Força', desc: 'Sobrecargas maiores e intervalos maiores de recuperação (4-6 reps)' },
                      { id: 'WEIGHT_LOSS', title: 'Emagrecimento & Definição', desc: 'Densidade alta com intervalos controlados' },
                      { id: 'ENDURANCE', title: 'Resistência & Condicionamento', desc: 'Séries mais longas e circuitos' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setWizardGoal(item.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                          wizardGoal === item.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 2: Qual seu nível de experiência com musculação?</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'BEGINNER', title: 'Iniciante (menos de 6 meses)', desc: 'Prioridade para aprendizado motor, máquinas e exercícios básicos' },
                      { id: 'INTERMEDIATE', title: 'Intermediário (6 meses a 2 anos)', desc: 'Treinos divididos, pesos livres e variação de estímulos' },
                      { id: 'ADVANCED', title: 'Avançado (mais de 2 anos)', desc: 'Sobrecarga progressiva avançada e periodização densa' },
                    ].map((lvl) => (
                      <div
                        key={lvl.id}
                        onClick={() => setWizardLevel(lvl.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          wizardLevel === lvl.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm">{lvl.title}</div>
                          <div className="text-xs text-slate-400">{lvl.desc}</div>
                        </div>
                        {wizardLevel === lvl.id && <Check size={18} className="text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 3: Quantos dias por semana você pode treinar?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[2, 3, 4, 5, 6].map((days) => (
                      <div
                        key={days}
                        onClick={() => setWizardFrequency(days)}
                        className={`p-5 rounded-2xl border text-center cursor-pointer transition ${
                          wizardFrequency === days
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl font-black block">{days}x</span>
                        <span className="text-xs text-slate-400">dias / semana</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 4: Tempo disponível por sessão de treino</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[30, 45, 60, 90].map((mins) => (
                      <div
                        key={mins}
                        onClick={() => setWizardDuration(mins)}
                        className={`p-5 rounded-2xl border text-center cursor-pointer transition ${
                          wizardDuration === mins
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl font-black block">{mins}</span>
                        <span className="text-xs text-slate-400">minutos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 5: Equipamentos disponíveis para seu treino</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'FULL_GYM', title: 'Academia Completa', desc: 'Acesso a barras, halteres, máquinas e polias' },
                      { id: 'BASIC', title: 'Halteres & Básico em Casa', desc: 'Treino com halteres ajustáveis e banco simples' },
                      { id: 'BODYWEIGHT', title: 'Peso Corporal (Calistenia)', desc: 'Exercícios sem equipamentos ou com barras fixas' },
                    ].map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => setWizardEquipment(eq.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          wizardEquipment === eq.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm">{eq.title}</div>
                          <div className="text-xs text-slate-400">{eq.desc}</div>
                        </div>
                        {wizardEquipment === eq.id && <Check size={18} className="text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 6: Restrições físicas ou limitações articulares</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'NONE', title: 'Nenhuma limitação', desc: 'Apto para todos os exercícios' },
                      { id: 'LOWER_BACK', title: 'Coluna / Lombar', desc: 'Evita compressão axial severa' },
                      { id: 'KNEE', title: 'Joelho', desc: 'Ajusta amplitude de agachamentos' },
                      { id: 'SHOULDER', title: 'Ombro', desc: 'Evita rotações lesivas' },
                    ].map((lim) => (
                      <div
                        key={lim.id}
                        onClick={() => setWizardLimitation(lim.id as any)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                          wizardLimitation === lim.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <strong className="block text-sm">{lim.title}</strong>
                        <span className="text-[11px] text-slate-400">{lim.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Etapa 7: Proposta Inicial de Divisão (Split)</h3>
                  <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3 text-xs">
                    <div className="font-bold text-white text-sm">
                      {wizardFrequency <= 3
                        ? 'Divisão Sugerida: Full Body ou Treino A/B'
                        : wizardFrequency === 4
                        ? 'Divisão Sugerida: Treino A/B Upper & Lower'
                        : 'Divisão Sugerida: Treino ABC Push / Pull / Legs'}
                    </div>
                    <p className="text-slate-300">
                      Com base na sua frequência de {wizardFrequency} dias por semana e meta de {wizardDuration} minutos por sessão, o programa organizará os grupamentos musculares para garantir no mínimo 48h de recuperação entre estímulos (RN20).
                    </p>
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Etapa 8: Detalhamento dos Exercícios e Conclusão</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Ao confirmar, a rotina completa com exercícios selecionados do catálogo de 128 itens será gravada na sua conta.
                  </p>
                  <button
                    onClick={handleFinishWizard}
                    disabled={wizardGenerating}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition shadow-xl shadow-emerald-500/25 disabled:opacity-50"
                  >
                    {wizardGenerating ? 'Gerando Rotina de Treino...' : '[ VER TREINO ]'}
                  </button>
                </div>
              )}

              {/* Botões de Avançar e Voltar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {wizardStep > 1 ? (
                  <button
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Voltar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setWizardStarted(false)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition"
                  >
                    Cancelar
                  </button>
                )}

                {wizardStep < 8 && (
                  <button
                    onClick={() => setWizardStep(wizardStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 ml-auto"
                  >
                    <span>Próxima Etapa</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 3: REGISTRAR TREINO (LOGGER) */}
      {/* ============================================================= */}
      {activeTab === 'logger' && (
        <form onSubmit={handleSaveWorkoutLog} className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PlayCircle className="text-emerald-400" size={20} />
                <span>Registrar Sessão Executada (RN24: Imutabilidade)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Data da Sessão</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duração Real (min)</label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={logDurationMin}
                  onChange={(e) => setLogDurationMin(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">Exercícios Realizados</span>
                {activeWorkout && logRows.length === 0 && (
                  <button
                    type="button"
                    onClick={prepareLoggerFromActiveWorkout}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Carregar da ficha ativa ({activeWorkout.name})
                  </button>
                )}
              </div>

              {logRows.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-500">
                  Nenhum exercício selecionado para registrar.
                </div>
              ) : (
                <div className="space-y-2">
                  {logRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                    >
                      <strong className="text-white col-span-1">{row.exerciseName}</strong>

                      <div className="flex items-center gap-1">
                        <label className="text-slate-400">Séries:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={row.setsCompleted}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLogRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, setsCompleted: val } : r))
                            );
                          }}
                          className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <label className="text-slate-400">Reps:</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={row.repsCompleted}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLogRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, repsCompleted: val } : r))
                            );
                          }}
                          className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <label className="text-slate-400">Carga:</label>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={row.weightUsedKg}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLogRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, weightUsedKg: val } : r))
                            );
                          }}
                          className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                        />
                        <span className="text-slate-400">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Anotações sobre a Sessão (RPE, fadiga ou observações)
              </label>
              <textarea
                rows={2}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Ex: Treino muito produtivo, progredi 2kg no supino."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={savingLog || logRows.length === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {savingLog ? 'Salvando no Histórico...' : 'Concluir e Salvar Registro de Treino'}
            </button>
          </div>
        </form>
      )}

      {/* ============================================================= */}
      {/* ABA 4: HISTÓRICO DE TREINOS */}
      {/* ============================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-teal-400" />
              <span>Linha do Tempo Cronológica (RN24)</span>
            </h2>
            <button
              onClick={() => handleTabChange('logger')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              <PlayCircle size={14} />
              <span>Registrar Treino</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : historyLogs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <History size={40} className="mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">Nenhum treino registrado no histórico</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Registre suas sessões executadas para acompanhar a progressão de cargas e frequência ao longo do tempo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-white text-base">
                          {log.workoutName || 'Sessão de Treino'}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>{new Date(log.performedDate).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span>{log.durationMin} minutos</span>
                          <span>•</span>
                          <span>{log.exercises?.length || 0} exercícios</span>
                        </div>
                      </div>

                      <span className="text-xs text-emerald-400 font-semibold">
                        {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        {log.notes && (
                          <p className="text-slate-300 italic bg-slate-800/30 p-2.5 rounded-xl">
                            "{log.notes}"
                          </p>
                        )}
                        <div className="space-y-1.5">
                          {log.exercises?.map((exItem: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-800/40 flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-200">{exItem.exerciseName}</span>
                              <span className="text-slate-400 font-mono">
                                {exItem.setsCompleted} séries × {exItem.repsCompleted} reps • {exItem.weightUsedKg} kg
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ABA 5: BANCO DE EXERCÍCIOS */}
      {/* ============================================================= */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar por exercício (ex: supino, agachamento...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={catalogMuscle}
              onChange={(e) => setCatalogMuscle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos os Grupamentos Musculares</option>
              {['Peito', 'Costas', 'Quadríceps', 'Posterior de Coxa', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos', 'Panturrilha'].map(
                (m) => (
                  <option key={m} value={m}>{m}</option>
                )
              )}
            </select>

            <select
              value={catalogEquip}
              onChange={(e) => setCatalogEquip(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todos os Equipamentos</option>
              {['Halteres', 'Barra', 'Máquina', 'Polia', 'Peso Corporal'].map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {catalogLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : allCatalogExercises.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              Nenhum exercício encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allCatalogExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <strong className="text-white text-sm block">{ex.name}</strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 font-bold">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Equipamento: <strong>{ex.equipment}</strong>
                  </p>
                  {ex.instructions && (
                    <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                      "{ex.instructions}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL NOVO TREINO MANUAL */}
      {isNewWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Criar Nova Ficha de Treino</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nome do Treino</label>
              <input
                type="text"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Divisão (Split)</label>
              <input
                type="text"
                value={newWorkoutSplit}
                onChange={(e) => setNewWorkoutSplit(e.target.value)}
                placeholder="Ex: Treino A, Push, Superior"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duração Estimada (min)</label>
              <input
                type="number"
                value={newWorkoutDuration}
                onChange={(e) => setNewWorkoutDuration(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Descrição / Instruções (opcional)</label>
              <textarea
                rows={2}
                value={newWorkoutDesc}
                onChange={(e) => setNewWorkoutDesc(e.target.value)}
                placeholder="Ex: Foco em cadência controlada e amplitude máxima"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewWorkoutModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWorkout}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Salvar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR EXERCÍCIO À ROTINA ATIVA */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Dumbbell size={16} className="text-emerald-400" />
                <span>Selecionar Exercício do Catálogo</span>
              </h3>
              <button onClick={() => setIsAddExerciseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 flex gap-2">
              <input
                type="text"
                value={searchExQuery}
                onChange={(e) => handleSearchExerciseInModal(e.target.value, selectedMuscleFilter)}
                placeholder="Buscar por nome..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {catalogExercises.map((ex) => {
                const isSelected = selectedEx?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedEx(ex)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{ex.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {ex.muscleGroup} • {ex.equipment}
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-emerald-400" />}
                  </div>
                );
              })}
            </div>

            {selectedEx && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block">Séries:</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={exSets}
                      onChange={(e) => setExSets(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block">Reps:</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={exReps}
                      onChange={(e) => setExReps(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block">Carga (kg):</label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={exWeightKg}
                      onChange={(e) => setExWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block">Descanso (s):</label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={exRestSec}
                      onChange={(e) => setExRestSec(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block text-xs mb-1">Observações técnicas (opcional):</label>
                  <input
                    type="text"
                    value={exNotes}
                    onChange={(e) => setExNotes(e.target.value)}
                    placeholder="Ex: Pegada pronada, drop-set na última série"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <button
                  onClick={handleAddExerciseToWorkout}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Adicionar à Rotina
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
