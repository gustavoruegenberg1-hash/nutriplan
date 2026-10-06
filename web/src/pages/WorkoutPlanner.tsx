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
  ChevronUp,
  ChevronDown,
  Edit2,
  Loader2,
  MessageSquare,
  UserCheck,
  Users,
  PhoneCall,
} from 'lucide-react';
import { ProfessionalContactModal } from '../components/ProfessionalContactModal';

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
  workoutId?: string;
  exerciseId: string;
  orderIndex: number;
  sets: number;
  reps: number;
  weightKg: number;
  restSeconds: number;
  notes: string | null;
  name?: string;
  muscleGroup?: string;
  equipment?: string | null;
  exercise?: ExerciseItem;
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
  const [workoutLoadError, setWorkoutLoadError] = useState<string | null>(null);
  const [wizardWorkoutError, setWizardWorkoutError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Novo Treino Manual
  const [isNewWorkoutModalOpen, setIsNewWorkoutModalOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutSplit, setNewWorkoutSplit] = useState('Treino A');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState(60);
  const [newWorkoutDesc, setNewWorkoutDesc] = useState('');

  // Modal Adicionar Exercício à Ficha (Fluxo 2 Etapas: Músculos -> Exercícios)
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseModalStep, setExerciseModalStep] = useState<'muscles' | 'exercises'>('muscles');
  const [selectedTargetMuscles, setSelectedTargetMuscles] = useState<string[]>([]);
  const [catalogExercises, setCatalogExercises] = useState<ExerciseItem[]>([]);
  const [searchExQuery, setSearchExQuery] = useState('');
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const [exerciseModalError, setExerciseModalError] = useState<string | null>(null);
  const [exerciseSearchLoading, setExerciseSearchLoading] = useState(false);

  // Edição de Exercício na Rotina
  const [editingExercise, setEditingExercise] = useState<{
    id: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weightKg: number;
    restSeconds: number;
    notes: string;
  } | null>(null);
  const [isUpdatingExercise, setIsUpdatingExercise] = useState(false);

  // Vínculo com Personal Trainer / Contato Profissional
  const [associatedTrainer, setAssociatedTrainer] = useState<{
    id: string;
    name: string;
    profession?: string;
    specialty?: string;
  } | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [trainerContactId, setTrainerContactId] = useState<string | null>(null);

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
    setWorkoutLoadError(null);
    try {
      const res = await api.get('/workouts');
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setWorkouts(items);
      if (items.length > 0) {
        const currentId = activeWorkout?.id;
        const targetId = currentId && items.some((w: any) => w.id === currentId) ? currentId : items[0].id;
        const detailRes = await api.get(`/workouts/${targetId}`);
        setActiveWorkout(detailRes.data);
      } else {
        setActiveWorkout(null);
      }
    } catch (err: any) {
      setWorkoutLoadError(
        err.response?.data?.message || 'Não foi possível carregar seus treinos. Verifique sua conexão e tente novamente.'
      );
      setFeedback({ type: 'error', message: 'Falha ao carregar rotinas de treino.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
    checkTrainerAssociation();
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

  const checkTrainerAssociation = async () => {
    try {
      const convRes = await api.get('/messages/conversations').catch(() => ({ data: [] }));
      const convs = convRes.data || [];
      const trainerConv = convs.find(
        (c: any) =>
          (c.profession && /educador|personal|treinador|fitness/i.test(c.profession)) ||
          c.role === 'PROFESSIONAL'
      );
      if (trainerConv) {
        setAssociatedTrainer({
          id: trainerConv.contactId,
          name: trainerConv.name,
          profession: trainerConv.profession || 'Personal Trainer',
          specialty: trainerConv.specialty || 'Musculação e Treinamento Físico',
        });
        return;
      }
      setAssociatedTrainer(null);
    } catch {
      setAssociatedTrainer(null);
    }
  };

  const TARGET_MUSCLE_OPTIONS = [
    { id: 'Peito', label: 'Peito', desc: 'Peitoral maior e menor' },
    { id: 'Costas', label: 'Costas', desc: 'Dorsal, trapézio e rombóides' },
    { id: 'Ombros', label: 'Ombros', desc: 'Deltoides anterior, lateral e posterior' },
    { id: 'Bíceps', label: 'Bíceps', desc: 'Braquial e bíceps braquial' },
    { id: 'Tríceps', label: 'Tríceps', desc: 'Cabeça longa, lateral e medial' },
    { id: 'Abdômen', label: 'Abdômen', desc: 'Reto abdominal, oblíquos e core' },
    { id: 'Quadríceps', label: 'Quadríceps', desc: 'Reto femoral e vastos' },
    { id: 'Posterior', label: 'Posterior', desc: 'Posterior de coxa e isquiotibiais' },
    { id: 'Glúteos', label: 'Glúteos', desc: 'Glúteo máximo, médio e mínimo' },
    { id: 'Panturrilhas', label: 'Panturrilhas', desc: 'Gastrocnêmio e sóleo' },
    { id: 'Antebraços', label: 'Antebraços', desc: 'Flexores e extensores do punho' },
    { id: 'Corpo inteiro', label: 'Corpo inteiro', desc: 'Todos os grupamentos musculares' },
  ];

  const openAddExerciseModal = () => {
    setExerciseModalStep('muscles');
    setSelectedTargetMuscles([]);
    setSearchExQuery('');
    setCatalogExercises([]);
    setExerciseModalError(null);
    setAddingExerciseId(null);
    setIsAddExerciseModalOpen(true);
  };

  const handleToggleTargetMuscle = (muscleId: string) => {
    setSelectedTargetMuscles((prev) => {
      if (muscleId === 'Corpo inteiro') {
        return prev.includes('Corpo inteiro') ? [] : ['Corpo inteiro'];
      }
      const withoutFullBody = prev.filter((m) => m !== 'Corpo inteiro');
      if (withoutFullBody.includes(muscleId)) {
        return withoutFullBody.filter((m) => m !== muscleId);
      } else {
        return [...withoutFullBody, muscleId];
      }
    });
    setExerciseModalError(null);
  };

  const handleProceedToExerciseSelection = async () => {
    if (selectedTargetMuscles.length === 0) {
      setExerciseModalError('Selecione pelo menos um grupo muscular antes de continuar.');
      return;
    }
    setExerciseModalStep('exercises');
    setExerciseModalError(null);
    setExerciseSearchLoading(true);
    try {
      const res = await api.get('/exercises', {
        params: {
          muscleGroups: selectedTargetMuscles.join(','),
          limit: 100,
        },
      });
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setCatalogExercises(items);
    } catch {
      setCatalogExercises([]);
    } finally {
      setExerciseSearchLoading(false);
    }
  };

  const handleSearchExerciseInModal = async (query: string) => {
    setSearchExQuery(query);
    setExerciseModalError(null);
    setExerciseSearchLoading(true);
    try {
      const res = await api.get('/exercises', {
        params: {
          query: query.trim() || undefined,
          muscleGroups: selectedTargetMuscles.join(','),
          limit: 100,
        },
      });
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setCatalogExercises(items);
    } catch {
      setCatalogExercises([]);
    } finally {
      setExerciseSearchLoading(false);
    }
  };

  const handleQuickAddExercise = async (ex: ExerciseItem) => {
    if (!activeWorkout) return;
    setAddingExerciseId(ex.id);
    setExerciseModalError(null);
    try {
      const res = await api.post(`/workouts/${activeWorkout.id}/exercises`, {
        exerciseId: ex.id,
        sets: 4,
        reps: 10,
        weightKg: 20,
        restSeconds: 60,
      });
      setActiveWorkout(res.data);
      setFeedback({ type: 'success', message: `Exercício "${ex.name}" adicionado à rotina com sucesso!` });
    } catch (err: any) {
      setExerciseModalError(
        err.response?.data?.message || 'Não foi possível adicionar este exercício.'
      );
    } finally {
      setAddingExerciseId(null);
    }
  };

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !activeWorkout) return;
    const sets = Number(editingExercise.sets);
    const reps = Number(editingExercise.reps);
    const weight = Number(editingExercise.weightKg);
    const rest = Number(editingExercise.restSeconds);

    if (isNaN(sets) || sets < 1 || sets > 20) {
      setFeedback({ type: 'error', message: 'Configuração inválida: Séries devem estar entre 1 e 20.' });
      return;
    }
    if (isNaN(reps) || reps < 1 || reps > 100) {
      setFeedback({ type: 'error', message: 'Configuração inválida: Repetições devem estar entre 1 e 100.' });
      return;
    }

    setIsUpdatingExercise(true);
    try {
      const res = await api.put(`/workouts/${activeWorkout.id}/exercises/${editingExercise.id}`, {
        sets,
        reps,
        weightKg: isNaN(weight) ? 0 : Math.max(0, weight),
        restSeconds: isNaN(rest) ? 60 : Math.max(10, rest),
        notes: editingExercise.notes?.trim() || undefined,
      });
      setActiveWorkout(res.data);
      setEditingExercise(null);
      setFeedback({ type: 'success', message: 'Exercício atualizado e salvo na rotina com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Falha ao atualizar exercício.' });
    } finally {
      setIsUpdatingExercise(false);
    }
  };

  const handleMoveExercise = async (index: number, direction: 'up' | 'down') => {
    if (!activeWorkout || !activeWorkout.exercises) return;
    const items = [...activeWorkout.exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const exerciseIds = items.map((i) => i.id);
    try {
      const res = await api.put(`/workouts/${activeWorkout.id}/exercises/reorder`, { exerciseIds });
      setActiveWorkout(res.data);
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao reordenar exercícios.' });
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
  const validateWorkoutWizardData = (): string | null => {
    if (!wizardGoal) return 'O objetivo de treinamento deve ser selecionado.';
    if (!wizardLevel) return 'O nível de experiência deve ser selecionado.';
    if (!wizardFrequency || wizardFrequency < 1 || wizardFrequency > 7) {
      return 'A frequência semanal de treinos deve ser entre 1 e 7 dias.';
    }
    if (!wizardDuration || wizardDuration < 15 || wizardDuration > 180) {
      return 'A duração estimada por sessão deve ser entre 15 e 180 minutos.';
    }
    return null;
  };

  const handleFinishWizard = async () => {
    const valError = validateWorkoutWizardData();
    if (valError) {
      setWizardWorkoutError(valError);
      setFeedback({ type: 'error', message: valError });
      return;
    }

    setWizardGenerating(true);
    setWizardWorkoutError(null);
    setFeedback(null);
    try {
      const res = await api.post('/workouts/generate-suggestion', {
        goal: wizardGoal,
        daysPerWeek: wizardFrequency,
        level: wizardLevel,
        durationMin: wizardDuration,
        availableTimeMin: wizardDuration,
        equipment: wizardEquipment,
      });
      await loadWorkouts();
      setActiveWorkout(res.data);
      setActiveTab('current');
      setWizardStarted(false);
      setWizardStep(1);
      setFeedback({
        type: 'success',
        message: 'Seu treino foi criado com sucesso! Exercícios organizados com base no seu objetivo.',
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Não foi possível gerar seu treino. Verifique os dados e tente novamente.';
      setWizardWorkoutError(msg);
      setFeedback({ type: 'error', message: msg });
    } finally {
      setWizardGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DO LOGGER DE EXECUÇÃO (RN24)
  // -------------------------------------------------------------
  const prepareLoggerFromActiveWorkout = () => {
    if (!activeWorkout || !activeWorkout.exercises) return;
    const initialRows = activeWorkout.exercises.map((item) => ({
      exerciseId: item.exerciseId,
      exerciseName: item.name || item.exercise?.name || 'Exercício',
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
          const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          setAllCatalogExercises(items);
          if (!selectedCatalogDetail && items.length > 0) {
            setSelectedCatalogDetail(items[0]);
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
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando seus treinos...</p>
      </div>
    );
  }

  if (workoutLoadError && workouts.length === 0 && !activeWorkout) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <AlertTriangle size={48} className="text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Não foi possível carregar seus treinos.</h2>
        <p className="text-slate-400 text-sm max-w-md">{workoutLoadError}</p>
        <button
          onClick={loadWorkouts}
          className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-teal-500/20"
        >
          [ TENTAR NOVAMENTE ]
        </button>
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

      {/* Seção Dedicada: Contato e Acompanhamento com Personal Trainer (Requisito 9) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border border-teal-500/20 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 block">
                Acompanhamento Profissional
              </span>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                PRECISA DE AJUDA COM SEU TREINO?
              </h3>
              {associatedTrainer ? (
                <p className="text-xs text-teal-300 mt-0.5">
                  Seu Personal Trainer responsável: <strong className="text-white">{associatedTrainer.name}</strong> ({associatedTrainer.profession})
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">
                  Você ainda não possui um profissional de treinamento associado. Tire dúvidas sobre execução e periodização.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {associatedTrainer ? (
              <button
                onClick={() => {
                  setTrainerContactId(associatedTrainer.id);
                  setIsContactModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <MessageSquare size={16} />
                <span>FALAR COM PERSONAL</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setTrainerContactId(null);
                    setIsContactModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Users size={15} />
                  <span>ENCONTRAR PROFISSIONAL</span>
                </button>
                <button
                  onClick={() => {
                    setTrainerContactId(null);
                    setIsContactModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5"
                >
                  <PhoneCall size={15} />
                  <span>SOLICITAR CONTATO</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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
              <h2 className="text-xl font-bold text-white">Você ainda não possui um treino.</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Comece gerando um programa completo com nosso assistente ou estruture sua rotina manualmente.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => handleTabChange('wizard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
                >
                  [ INICIAR MONTAGEM ]
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
                        className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-slate-700 transition shadow-sm"
                      >
                        {/* Identificador, Reordenação e Nome */}
                        <div className="flex items-start sm:items-center gap-3">
                          {/* Controles de Reordenação (Requisito 7) */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                            <button
                              onClick={() => handleMoveExercise(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-emerald-400 disabled:opacity-25 disabled:cursor-not-allowed transition"
                              title="Subir posição do exercício"
                            >
                              <ChevronUp size={15} />
                            </button>
                            <span className="text-[11px] font-black text-white px-1">{idx + 1}</span>
                            <button
                              onClick={() => handleMoveExercise(idx, 'down')}
                              disabled={idx === activeWorkout.exercises.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-emerald-400 disabled:opacity-25 disabled:cursor-not-allowed transition"
                              title="Descer posição do exercício"
                            >
                              <ChevronDown size={15} />
                            </button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-white flex flex-wrap items-center gap-2">
                              <span>{item.name || item.exercise?.name || 'Exercício'}</span>
                              {(item.muscleGroup || item.exercise?.muscleGroup) && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                                  {item.muscleGroup || item.exercise?.muscleGroup}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] mt-1 flex flex-wrap items-center gap-2">
                              <span>Equipamento: <strong className="text-slate-300">{item.equipment || item.exercise?.equipment || 'Livre'}</strong></span>
                              {item.notes && (
                                <span className="text-slate-400 italic bg-slate-800/60 px-2 py-0.5 rounded-md">
                                  "{item.notes}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Parâmetros Prescritos e Botões de Ação */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 text-center min-w-[90px]">
                              <span className="font-extrabold text-white text-xs block">
                                {item.sets} × {item.reps}
                              </span>
                              <span className="text-[10px] text-slate-400">séries × reps</span>
                            </div>

                            <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 text-center min-w-[95px]">
                              <span className="font-extrabold text-teal-400 text-xs block">
                                {item.weightKg > 0 ? `${item.weightKg} kg` : 'Corporal'}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.restSeconds}s desc.</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() =>
                                setEditingExercise({
                                  id: item.id,
                                  exerciseName: item.name || item.exercise?.name || 'Exercício',
                                  sets: item.sets,
                                  reps: item.reps,
                                  weightKg: item.weightKg,
                                  restSeconds: item.restSeconds,
                                  notes: item.notes || '',
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
                              title="Editar séries, repetições e carga"
                            >
                              <Edit2 size={13} />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => handleRemoveExercise(item.id)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Remover exercício da rotina"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

                  {wizardWorkoutError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-md mx-auto text-left">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="shrink-0 text-rose-400" />
                        <span>{wizardWorkoutError}</span>
                      </div>
                      <button
                        onClick={handleFinishWizard}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-white font-bold text-xs shrink-0 transition"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}

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

      {/* MODAL ADICIONAR EXERCÍCIO À ROTINA ATIVA (2 ETAPAS: MÚSCULOS -> EXERCÍCIOS) */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pb-safe">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header do Modal */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {exerciseModalStep === 'muscles'
                      ? 'Adicionar Exercícios: Escolha os Músculos'
                      : 'Adicionar Exercícios à Ficha'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {exerciseModalStep === 'muscles'
                      ? 'Etapa 1 de 2: Grupos musculares alvo'
                      : `Etapa 2 de 2: Seleção para ${activeWorkout?.name || 'Treino'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddExerciseModalOpen(false);
                  setExerciseModalError(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* ETAPA 1: SELEÇÃO DE MÚSCULOS */}
            {exerciseModalStep === 'muscles' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="text-base sm:text-lg font-extrabold text-white">
                    Quais músculos você deseja trabalhar neste treino?
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Selecione um ou vários grupos musculares. O catálogo exibirá apenas os exercícios correspondentes.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TARGET_MUSCLE_OPTIONS.map((m) => {
                    const isSelected = selectedTargetMuscles.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleTargetMuscle(m.id)}
                        className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 active:scale-[0.98] ${
                          isSelected
                            ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border-teal-500 shadow-md shadow-teal-500/10'
                            : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-sm text-white">{m.label}</span>
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition ${
                              isSelected
                                ? 'bg-teal-500 text-slate-950 font-black'
                                : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            <Check size={13} strokeWidth={3} />
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {exerciseModalError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                    <span>{exerciseModalError}</span>
                  </div>
                )}

                {/* Footer Fixo da Etapa 1 */}
                <div className="pt-2 sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pb-1">
                  <button
                    type="button"
                    onClick={handleProceedToExerciseSelection}
                    disabled={selectedTargetMuscles.length === 0}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.99]"
                  >
                    <span>
                      {selectedTargetMuscles.length === 0
                        ? 'Selecione ao menos um músculo'
                        : `Continuar para Exercícios (${selectedTargetMuscles.length} selecionado${
                            selectedTargetMuscles.length > 1 ? 's' : ''
                          })`}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: LISTAGEM FILTRADA E ADIÇÃO IMEDIATA */}
            {exerciseModalStep === 'exercises' && (
              <>
                <div className="p-4 border-b border-slate-800 bg-slate-900/95 space-y-3">
                  {/* Barra de Músculos Selecionados e Botão Voltar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setExerciseModalStep('muscles')}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold py-1 px-2 rounded-lg bg-teal-500/10 border border-teal-500/20 transition"
                    >
                      <ArrowLeft size={13} />
                      <span>Alterar Músculos</span>
                    </button>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedTargetMuscles.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Busca textual nos exercícios filtrados */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      value={searchExQuery}
                      onChange={(e) => handleSearchExerciseInModal(e.target.value)}
                      placeholder="Pesquisar nos músculos selecionados (ex: Supino, Puxada, Agachamento...)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-teal-500 placeholder:text-slate-500"
                      autoFocus
                    />
                    {exerciseSearchLoading && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-400 animate-spin" size={15} />
                    )}
                  </div>
                </div>

                {/* Lista de Exercícios Filtrados com Adição Imediata */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[240px]">
                  {exerciseModalError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                      <span>{exerciseModalError}</span>
                    </div>
                  )}

                  {catalogExercises.length === 0 && !exerciseSearchLoading ? (
                    <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                      <Dumbbell size={32} className="mx-auto text-slate-600" />
                      <p>Nenhum exercício encontrado com os filtros atuais.</p>
                      <button
                        type="button"
                        onClick={() => setExerciseModalStep('muscles')}
                        className="text-xs text-teal-400 underline font-semibold"
                      >
                        Selecionar outros grupamentos musculares
                      </button>
                    </div>
                  ) : (
                    catalogExercises.map((ex) => {
                      const isAlreadyAdded = activeWorkout?.exercises?.some(
                        (item) => item.exerciseId === ex.id
                      );
                      const isAddingThis = addingExerciseId === ex.id;

                      return (
                        <div
                          key={ex.id}
                          className={`p-3.5 rounded-2xl border transition flex items-center justify-between text-xs gap-3 ${
                            isAlreadyAdded
                              ? 'bg-slate-900/60 border-emerald-500/30'
                              : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm truncate">{ex.name}</span>
                              {isAlreadyAdded && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                                  Na ficha
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              <span className="text-teal-400 font-semibold">{ex.muscleGroup}</span>
                              {ex.equipment && <span> • Equipamento: {ex.equipment}</span>}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAlreadyAdded ? (
                              <button
                                type="button"
                                disabled
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 cursor-default"
                              >
                                <Check size={14} strokeWidth={2.5} />
                                <span>Adicionado</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickAddExercise(ex)}
                                disabled={isAddingThis}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition disabled:opacity-50"
                              >
                                {isAddingThis ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Adicionando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} strokeWidth={2.5} />
                                    <span>Adicionar</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Sempre Visível e Seguro para Mobile */}
                <div className="sticky bottom-0 z-30 p-4 pb-6 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[11px]">Exercícios no treino:</span>
                    <strong className="text-white text-sm font-black">
                      {activeWorkout?.exercises?.length || 0} exercícios na ficha
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddExerciseModalOpen(false);
                      setExerciseModalError(null);
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Concluir Seleção
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR EXERCÍCIO EXISTENTE NA ROTINA */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit2 size={16} className="text-teal-400" />
                <span>Editar Exercício da Rotina</span>
              </h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Exercício:</span>
              <strong className="text-white text-sm">{editingExercise.exerciseName}</strong>
            </div>

            <form onSubmit={handleUpdateExercise} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Séries (1–20):</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editingExercise.sets || ''}
                    onChange={(e) =>
                      setEditingExercise({ ...editingExercise, sets: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Repetições (1–100):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingExercise.reps || ''}
                    onChange={(e) =>
                      setEditingExercise({ ...editingExercise, reps: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Carga (kg):</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={editingExercise.weightKg === 0 ? '0' : editingExercise.weightKg || ''}
                    onChange={(e) =>
                      setEditingExercise({ ...editingExercise, weightKg: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Descanso (s):</label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={editingExercise.restSeconds || ''}
                    onChange={(e) =>
                      setEditingExercise({ ...editingExercise, restSeconds: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold text-xs block mb-1">Observações Técnicas:</label>
                <input
                  type="text"
                  value={editingExercise.notes}
                  onChange={(e) =>
                    setEditingExercise({ ...editingExercise, notes: e.target.value })
                  }
                  placeholder="Ex: Foco no pico de contração"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingExercise}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                >
                  {isUpdatingExercise ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONTATO COM PROFISSIONAL / PERSONAL TRAINER */}
      <ProfessionalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialContactId={trainerContactId}
      />
    </div>
  );
};
