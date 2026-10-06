import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Dumbbell,
  Plus,
  Trash2,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  X,
  ShieldAlert,
  ChevronRight,
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
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Novo Treino
  const [isNewWorkoutModalOpen, setIsNewWorkoutModalOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutSplit, setNewWorkoutSplit] = useState('Treino A');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState(60);
  const [newWorkoutDesc, setNewWorkoutDesc] = useState('');

  // Modal Adicionar Exercício
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [catalogExercises, setCatalogExercises] = useState<ExerciseItem[]>([]);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [exerciseSets, setExerciseSets] = useState(4);
  const [exerciseReps, setExerciseReps] = useState(10);
  const [exerciseWeightKg, setExerciseWeightKg] = useState(20);
  const [exerciseRestSec, setExerciseRestSec] = useState(60);
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Modal Registrar Execução (Log)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logDurationMin, setLogDurationMin] = useState(60);
  const [logNotes, setLogNotes] = useState('');
  const [logExercises, setLogExercises] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      setsCompleted: number;
      repsCompleted: number;
      weightUsedKg: number;
      notes: string;
    }>
  >([]);

  const loadWorkouts = async () => {
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data);
      if (res.data.length > 0) {
        // Carrega o primeiro ou preserva o ativo se existir
        const currentId = activeWorkout?.id;
        const targetId = currentId && res.data.some((w: any) => w.id === currentId) ? currentId : res.data[0].id;
        const detailRes = await api.get(`/workouts/${targetId}`);
        setActiveWorkout(detailRes.data);
      } else {
        setActiveWorkout(null);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao carregar fichas de treino.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Busca exercícios do catálogo quando abre modal
  useEffect(() => {
    if (isAddExerciseModalOpen) {
      const fetchCatalog = async () => {
        try {
          const res = await api.get('/exercises', {
            params: {
              query: searchExerciseQuery || undefined,
              muscleGroup: selectedMuscleFilter || undefined,
              limit: 50,
            },
          });
          setCatalogExercises(res.data);
        } catch {
          // ignore
        }
      };
      const timer = setTimeout(fetchCatalog, 200);
      return () => clearTimeout(timer);
    }
  }, [isAddExerciseModalOpen, searchExerciseQuery, selectedMuscleFilter]);

  const selectWorkout = async (workoutId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/workouts/${workoutId}`);
      setActiveWorkout(res.data);
    } catch {
      setFeedback({ type: 'error', message: 'Falha ao abrir detalhes do treino.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkoutName.trim()) return;
    try {
      const res = await api.post('/workouts', {
        name: newWorkoutName,
        splitName: newWorkoutSplit,
        estimatedDurationMin: Number(newWorkoutDuration),
        description: newWorkoutDesc || undefined,
      });
      setIsNewWorkoutModalOpen(false);
      setNewWorkoutName('');
      setNewWorkoutDesc('');
      setFeedback({ type: 'success', message: 'Ficha de treino criada com sucesso!' });
      await loadWorkouts();
      selectWorkout(res.data.id);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao criar treino.' });
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Deseja realmente remover esta rotina de treino? Os registros passados de execução continuarão preservados no histórico (RN24).')) {
      return;
    }
    try {
      await api.delete(`/workouts/${workoutId}`);
      setFeedback({ type: 'success', message: 'Treino removido com sucesso.' });
      await loadWorkouts();
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao remover treino.' });
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkout || !selectedExercise) return;
    try {
      await api.post(`/workouts/${activeWorkout.id}/exercises`, {
        exerciseId: selectedExercise.id,
        sets: Number(exerciseSets),
        reps: Number(exerciseReps),
        weightKg: Number(exerciseWeightKg),
        restSeconds: Number(exerciseRestSec),
        notes: exerciseNotes || undefined,
      });
      setIsAddExerciseModalOpen(false);
      setSelectedExercise(null);
      setExerciseNotes('');
      setFeedback({ type: 'success', message: 'Exercício adicionado ao treino!' });
      // Recarrega treino ativo
      const detailRes = await api.get(`/workouts/${activeWorkout.id}`);
      setActiveWorkout(detailRes.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao adicionar exercício.' });
    }
  };

  const handleRemoveExercise = async (workoutExerciseId: string) => {
    if (!activeWorkout) return;
    if (!confirm('Remover este exercício da ficha?')) return;
    try {
      await api.delete(`/workouts/${activeWorkout.id}/exercises/${workoutExerciseId}`);
      setFeedback({ type: 'success', message: 'Exercício removido.' });
      const detailRes = await api.get(`/workouts/${activeWorkout.id}`);
      setActiveWorkout(detailRes.data);
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao remover exercício.' });
    }
  };

  // Abre modal de log e pré-popula exercícios
  const openLogModal = () => {
    if (!activeWorkout) return;
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogDurationMin(activeWorkout.estimatedDurationMin || 60);
    setLogNotes('');
    setLogExercises(
      activeWorkout.exercises.map((item) => ({
        exerciseId: item.exerciseId,
        exerciseName: item.exercise?.name || 'Exercício',
        setsCompleted: item.sets,
        repsCompleted: item.reps,
        weightUsedKg: item.weightKg,
        notes: '',
      }))
    );
    setIsLogModalOpen(true);
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkout) return;
    try {
      await api.post(`/workouts/${activeWorkout.id}/log`, {
        performedDate: logDate,
        durationMin: Number(logDurationMin),
        notes: logNotes || undefined,
        exercises: logExercises,
      });
      setIsLogModalOpen(false);
      setFeedback({ type: 'success', message: 'Execução do treino registrada com sucesso no histórico!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao registrar treino.' });
    }
  };

  const muscleGroups = [
    'Todos',
    'Peito',
    'Costas',
    'Quadríceps',
    'Posterior de Coxa',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Abdômen',
    'Panturrilha',
  ];

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
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Módulo de Treinos
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              RN14 - RN25
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Planejamento de rotinas personalizadas, divisão de grupos musculares e registro de execução.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/exercises"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition flex items-center gap-1.5"
          >
            <Dumbbell size={16} className="text-emerald-400" />
            <span>Catálogo Completo</span>
          </Link>
          <button
            onClick={() => setIsNewWorkoutModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Nova Ficha</span>
          </button>
        </div>
      </div>

      {/* Seletor de Fichas / Rotinas */}
      {workouts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {workouts.map((w) => (
            <button
              key={w.id}
              onClick={() => selectWorkout(w.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 border ${
                activeWorkout?.id === w.id
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Dumbbell size={15} />
              <span>{w.name}</span>
              {w.splitName && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {w.splitName}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo Principal do Treino Ativo */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Carregando treino...
        </div>
      ) : activeWorkout ? (
        <div className="space-y-6">
          {/* Card Resumo do Treino Selecionado */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeWorkout.name}</h2>
                {activeWorkout.splitName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
                    {activeWorkout.splitName}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">
                {activeWorkout.description || 'Ficha personalizada de treinamento resistido.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-emerald-400" />
                  Estimativa: {activeWorkout.estimatedDurationMin || 60} min
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell size={13} className="text-teal-400" />
                  {activeWorkout.exercises.length} {activeWorkout.exercises.length === 1 ? 'exercício' : 'exercícios'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                onClick={openLogModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition flex items-center gap-1.5"
              >
                <PlayCircle size={17} />
                <span>Registrar Execução</span>
              </button>
              <button
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Adicionar Exercício</span>
              </button>
              <button
                onClick={() => handleDeleteWorkout(activeWorkout.id)}
                title="Remover rotina"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Lista de Exercícios na Ficha */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-200">Exercícios da Rotina</h3>
              <span className="text-xs text-slate-400">Total: {activeWorkout.exercises.length}</span>
            </div>

            {activeWorkout.exercises.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                <Dumbbell size={36} className="mx-auto text-slate-600" />
                <p className="text-sm text-slate-400">Nenhum exercício cadastrado nesta rotina ainda.</p>
                <button
                  onClick={() => setIsAddExerciseModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-semibold transition"
                >
                  Adicionar Primeiro Exercício
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeWorkout.exercises.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-base leading-tight">
                            {item.exercise?.name || 'Exercício'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {item.exercise?.muscleGroup}
                          </span>
                          {item.exercise?.equipment && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.exercise?.equipment}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                        title="Remover da ficha"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Dados de Séries, Reps e Carga */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Séries</div>
                        <div className="text-base font-extrabold text-emerald-400">{item.sets}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Repetições</div>
                        <div className="text-base font-extrabold text-white">{item.reps}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Carga Sugerida</div>
                        <div className="text-base font-extrabold text-teal-300">
                          {item.weightKg > 0 ? `${item.weightKg} kg` : 'Corpóreo'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/40">
                      <span>Descanso: {item.restSeconds || 60}s</span>
                      {item.notes && <span className="italic text-slate-400 truncate max-w-[200px]">{item.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
          <Dumbbell size={48} className="mx-auto text-slate-600" />
          <h2 className="text-lg font-bold text-slate-200">Nenhuma ficha de treino cadastrada</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Crie sua primeira ficha de treino (ex: Treino A - Peito e Tríceps, Treino B - Costas e Bíceps) para começar a acompanhar seu progresso.
          </p>
          <button
            onClick={() => setIsNewWorkoutModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            Criar Ficha de Treino
          </button>
        </div>
      )}

      {/* Aviso Legal de Saúde (RN27) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert size={18} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Aviso Legal de Responsabilidade (RN27):</span> O NutriPlan v2 fornece fichas de treino como ferramenta referencial de organização esportiva. Para prescrição individualizada de cargas e correção postural em patologias, consulte um profissional de Educação Física habilitado (CREF).
        </div>
      </div>

      {/* ================= MODAL NOVO TREINO ================= */}
      {isNewWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-emerald-400" />
                Nova Ficha de Treino
              </h3>
              <button onClick={() => setIsNewWorkoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkout} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Ficha *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino A - Peitoral e Tríceps"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Divisão / Split</label>
                  <select
                    value={newWorkoutSplit}
                    onChange={(e) => setNewWorkoutSplit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Treino A">Treino A</option>
                    <option value="Treino B">Treino B</option>
                    <option value="Treino C">Treino C</option>
                    <option value="Treino D">Treino D</option>
                    <option value="Superior">Superior</option>
                    <option value="Inferior">Inferior</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração Est. (min)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newWorkoutDuration}
                    onChange={(e) => setNewWorkoutDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Foco</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Foco em hipertrofia de peito superior e deltoides."
                  value={newWorkoutDesc}
                  onChange={(e) => setNewWorkoutDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewWorkoutModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
                >
                  Salvar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ADICIONAR EXERCÍCIO ================= */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-emerald-400" />
                Adicionar Exercício à Ficha
              </h3>
              <button onClick={() => setIsAddExerciseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Barra de Pesquisa e Filtro de Músculo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar exercício (ex: Supino, Agachamento)..."
                    value={searchExerciseQuery}
                    onChange={(e) => setSearchExerciseQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedMuscleFilter}
                    onChange={(e) => setSelectedMuscleFilter(e.target.value === 'Todos' ? '' : e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {muscleGroups.map((m) => (
                      <option key={m} value={m === 'Todos' ? '' : m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Seleção do Catálogo */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-800 bg-slate-950/50">
                {catalogExercises.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Nenhum exercício encontrado.</div>
                ) : (
                  catalogExercises.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => setSelectedExercise(ex)}
                      className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition ${
                        selectedExercise?.id === ex.id
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{ex.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {ex.muscleGroup} • {ex.equipment || 'Livre'}
                        </div>
                      </div>
                      {selectedExercise?.id === ex.id && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </button>
                  ))
                )}
              </div>

              {selectedExercise && (
                <form onSubmit={handleAddExercise} className="space-y-4 pt-2 border-t border-slate-800 text-sm">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Exercício Selecionado:</span>
                      <div className="font-bold text-white text-sm">{selectedExercise.name}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedExercise.muscleGroup}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Séries</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={exerciseSets}
                        onChange={(e) => setExerciseSets(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Repetições</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={exerciseReps}
                        onChange={(e) => setExerciseReps(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Carga (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={exerciseWeightKg}
                        onChange={(e) => setExerciseWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Descanso (s)</label>
                      <input
                        type="number"
                        min="0"
                        max="600"
                        value={exerciseRestSec}
                        onChange={(e) => setExerciseRestSec(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-center font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Instruções / Observações</label>
                    <input
                      type="text"
                      placeholder="Ex: Drop-set na última série; foco na fase excêntrica."
                      value={exerciseNotes}
                      onChange={(e) => setExerciseNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddExerciseModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20"
                    >
                      Adicionar Exercício
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL REGISTRAR EXECUÇÃO ================= */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <PlayCircle size={18} className="text-teal-400" />
                  Registrar Execução de Treino
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ficha: <span className="font-semibold text-slate-200">{activeWorkout?.name}</span> (RN24 - Histórico Imutável)
                </p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-5 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Realização *</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração Real (minutos) *</label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    required
                    value={logDurationMin}
                    onChange={(e) => setLogDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações da Sessão</label>
                <input
                  type="text"
                  placeholder="Ex: Treino muito intenso, boa progressão de carga no supino."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Tabela de Exercícios Executados */}
              <div className="space-y-2 pt-2">
                <span className="block text-xs font-semibold text-slate-300">
                  Exercícios Realizados (Ajuste séries e cargas executadas):
                </span>
                <div className="space-y-2">
                  {logExercises.map((item, idx) => (
                    <div
                      key={item.exerciseId}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">
                          {idx + 1}. {item.exerciseName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-400">Séries Feitas</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.setsCompleted}
                            onChange={(e) => {
                              const updated = [...logExercises];
                              updated[idx].setsCompleted = Number(e.target.value);
                              setLogExercises(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-center font-bold text-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400">Reps Médias</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.repsCompleted}
                            onChange={(e) => {
                              const updated = [...logExercises];
                              updated[idx].repsCompleted = Number(e.target.value);
                              setLogExercises(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-center font-bold text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400">Carga Usada (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.weightUsedKg}
                            onChange={(e) => {
                              const updated = [...logExercises];
                              updated[idx].weightUsedKg = Number(e.target.value);
                              setLogExercises(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-center font-bold text-teal-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <Link
                  to="/history"
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                >
                  Ver histórico completo de treinos <ChevronRight size={14} />
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold shadow-lg shadow-teal-500/20"
                  >
                    Concluir e Salvar Log
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
