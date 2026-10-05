import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, ActivityLevel, Gender, Goal, PainDetail } from '../types';
import {
  User as UserIcon,
  Flame,
  HeartPulse,
  Scale,
  Check,
  AlertCircle,
  Shield,
  ShieldAlert,
  Dumbbell,
  Utensils,
  Plus,
  X,
  Lock,
  LogOut,
} from 'lucide-react';

const commonAllergiesList = [
  'Leite',
  'Ovos',
  'Amendoim',
  'Castanhas / Nozes',
  'Soja',
  'Trigo / Glúten',
  'Peixes',
  'Frutos do mar',
];

const commonIntolerancesList = [
  'Lactose',
  'Glúten',
  'Frutose',
  'FODMAPs',
  'Histamina',
];

const bodyRegionsList = [
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

const muscleGroupsList = [
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

const movementsList = [
  'Agachar',
  'Correr',
  'Saltar',
  'Empurrar na horizontal (Supino)',
  'Empurrar na vertical (Desenvolvimento)',
  'Puxar na vertical (Barra/Puxada)',
  'Puxar na horizontal (Remada)',
  'Levantar os braços acima da cabeça',
  'Flexionar o joelho sob carga',
  'Rotacionar o tronco com peso',
  'Flexionar o quadril (Stiff/Terra)',
];

const equipmentList = [
  { id: 'FULL_GYM', label: 'Academia completa' },
  { id: 'DUMBBELLS', label: 'Halteres' },
  { id: 'BARBELL', label: 'Barra e Anilhas' },
  { id: 'BENCH', label: 'Banco reto / regulável' },
  { id: 'MACHINES', label: 'Máquinas de musculação' },
  { id: 'RESISTANCE_BANDS', label: 'Elásticos / Extensores' },
  { id: 'BODYWEIGHT', label: 'Peso corporal (Calistenia)' },
  { id: 'CARDIO_MACHINES', label: 'Esteira / Bicicleta' },
];

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  // Dados Básicos
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [goal, setGoal] = useState<Goal>('maintain');

  // Alergias e Nutrição
  const [hasFoodAllergies, setHasFoodAllergies] = useState<boolean | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [hasFoodIntolerances, setHasFoodIntolerances] = useState<boolean | null>(null);
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [needsProfessionalSupervision, setNeedsProfessionalSupervision] = useState<'YES' | 'NO' | 'UNSURE' | string | null>(null);
  const [dietaryRestrictionsNotes, setDietaryRestrictionsNotes] = useState('');

  // Exercícios e Limitações
  const [experienceLevel, setExperienceLevel] = useState<string>('BEGINNER');
  const [trainingFrequencyDays, setTrainingFrequencyDays] = useState<number>(4);
  const [hasPhysicalDisabilities, setHasPhysicalDisabilities] = useState<string>('NO');
  const [affectedBodyRegions, setAffectedBodyRegions] = useState<string[]>([]);
  const [physicalDisabilityNotes, setPhysicalDisabilityNotes] = useState('');
  const [hasMuscleInjuries, setHasMuscleInjuries] = useState<string>('NO');
  const [affectedMuscles, setAffectedMuscles] = useState<string[]>([]);
  const [hasJointPain, setHasJointPain] = useState<string>('NO');
  const [affectedJoints, setAffectedJoints] = useState<string[]>([]);
  const [jointPainNotes, setJointPainNotes] = useState('');
  const [hasExercisePain, setHasExercisePain] = useState<string>('NO');
  const [painRegion, setPainRegion] = useState('');
  const [painMovement, setPainMovement] = useState('');
  const [painIntensity, setPainIntensity] = useState<number>(5);
  const [difficultMovements, setDifficultMovements] = useState<string[]>([]);
  const [exercisesToAvoid, setExercisesToAvoid] = useState<string[]>([]);
  const [customAvoidExercise, setCustomAvoidExercise] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(['FULL_GYM']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metas' | 'dieta' | 'treino'>('metas');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setWeight(user.weight?.toString() || '');
      setHeight(user.height?.toString() || '');
      setAge(user.age?.toString() || '');
      setBodyFatPct(user.bodyFatPct?.toString() || '');
      if (user.gender) setGender(user.gender.toLowerCase() as Gender);
      if (user.activityLevel) setActivityLevel(user.activityLevel.toLowerCase() as ActivityLevel);
      if (user.goal) setGoal(user.goal.toLowerCase() as Goal);

      setHasFoodAllergies(user.hasFoodAllergies ?? null);
      setAllergies(user.allergies || []);
      setHasFoodIntolerances(user.hasFoodIntolerances ?? null);
      setIntolerances(user.intolerances || []);
      setNeedsProfessionalSupervision(user.needsProfessionalSupervision ?? null);
      setDietaryRestrictionsNotes(user.dietaryRestrictionsNotes || '');

      setExperienceLevel(user.experienceLevel || 'BEGINNER');
      setTrainingFrequencyDays(user.trainingFrequencyDays || 4);
      setHasPhysicalDisabilities(user.hasPhysicalDisabilities || 'NO');
      setAffectedBodyRegions(user.affectedBodyRegions || []);
      setPhysicalDisabilityNotes(user.physicalDisabilityNotes || '');
      setHasMuscleInjuries(user.hasMuscleInjuries || 'NO');
      setAffectedMuscles(user.affectedMuscles || []);
      setHasJointPain(user.hasJointPain || 'NO');
      setAffectedJoints(user.affectedJoints || []);
      setJointPainNotes(user.jointPainNotes || '');
      setHasExercisePain(user.hasExercisePain || 'NO');
      if (user.painDetails && user.painDetails.length > 0) {
        setPainRegion(user.painDetails[0].region || '');
        setPainMovement(user.painDetails[0].movement || '');
        setPainIntensity(user.painDetails[0].intensity || 5);
      }
      setDifficultMovements(user.difficultMovements || []);
      setExercisesToAvoid(user.exercisesToAvoid || []);
      setAvailableEquipment(user.availableEquipment && user.availableEquipment.length > 0 ? user.availableEquipment : ['FULL_GYM']);
    }
  }, [user]);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomAllergy = () => {
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

  const toggleArrayItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addAvoidExercise = () => {
    const trimmed = customAvoidExercise.trim();
    if (trimmed && !exercisesToAvoid.includes(trimmed)) {
      setExercisesToAvoid((prev) => [...prev, trimmed]);
      setCustomAvoidExercise('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const painDetails: PainDetail[] =
        hasExercisePain === 'YES' || hasExercisePain === 'SOMETIMES'
          ? [{ region: painRegion, movement: painMovement, intensity: painIntensity }]
          : [];

      const updateData: Partial<User> = {
        name,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age, 10) : null,
        bodyFatPct: bodyFatPct ? Math.min(60, Math.max(3, parseFloat(bodyFatPct))) : null,
        gender: gender ? (gender.toLowerCase() as Gender) : null,
        activityLevel: activityLevel ? (activityLevel.toLowerCase() as ActivityLevel) : null,
        goal: goal ? (goal.toLowerCase() as Goal) : null,

        hasFoodAllergies,
        allergies: hasFoodAllergies ? allergies : [],
        hasFoodIntolerances,
        intolerances: hasFoodIntolerances ? intolerances : [],
        needsProfessionalSupervision,
        dietaryRestrictionsNotes,

        experienceLevel,
        trainingFrequencyDays,
        weightTrainingExperience: experienceLevel === 'RETURNING' ? 'PREVIOUSLY' : (experienceLevel === 'BEGINNER' ? 'NEVER' : 'CURRENTLY'),
        weightTrainingTimeMonths: experienceLevel === 'ADVANCED' ? 36 : (experienceLevel === 'INTERMEDIATE' ? 12 : 3),
        hasPhysicalDisabilities,
        affectedBodyRegions: hasPhysicalDisabilities === 'YES' ? affectedBodyRegions : [],
        physicalDisabilityNotes,
        hasMuscleInjuries,
        affectedMuscles: hasMuscleInjuries === 'YES' ? affectedMuscles : [],
        hasJointPain,
        affectedJoints: hasJointPain === 'YES' ? affectedJoints : [],
        jointPainNotes,
        hasExercisePain,
        painDetails,
        difficultMovements,
        exercisesToAvoid,
        availableEquipment,
      };

      await updateProfile(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.data?.message === 'Unauthorized') {
        setError('Sua sessão expirou. Por favor, faça login novamente para salvar as alterações.');
      } else {
        setError(err.response?.data?.message || 'Erro ao atualizar dados do perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserIcon className="w-6 h-6" />
          </div>
          <span>Perfil, Saúde & Avaliação Física</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Informe seus dados corporais, restrições alimentares e limitações físicas para recomendações precisas e seguras
        </p>
      </div>

      {/* Banner de Administrador */}
      {user?.role === 'ADMIN' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                Privilégio de Administrador Ativo
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Você tem permissão para gerenciar contas, aplicar suspensões e editar dados de usuários no sistema.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Acessar Painel Admin</span>
          </Link>
        </div>
      )}

      {/* Metrics Highlights (TMB / TDEE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Taxa Metabólica Basal (TMB)
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {user?.bmr ? Math.round(user.bmr) : '--'}
            </span>
            <span className="text-sm font-medium text-slate-400">kcal/dia</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Gasto energético mínimo do corpo em repouso absoluto (Fórmula de Mifflin-St Jeor).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Gasto Energético Total Diário (TDEE)
            </span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {user?.tdee ? Math.round(user.tdee) : '--'}
            </span>
            <span className="text-sm font-medium text-slate-400">kcal/dia</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Energia gasta incluindo trabalho diário, digestão de alimentos e exercícios físicos.
          </p>
        </div>
      </div>

      {/* Seletor de Abas para Organização e Foco */}
      <div className="flex rounded-2xl bg-surface border border-surface-border p-1.5 gap-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('metas')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'metas'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-canvas/50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. Dados & Metas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dieta')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'dieta'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-canvas/50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>2. Restrições & Alergias</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('treino')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'treino'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-canvas/50'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>3. Treino & Lesões</span>
        </button>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: Dados Antropométricos e Metas */}
        {activeTab === 'metas' && (
          <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-extrabold text-white">1. Dados Corporais & Objetivos</h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Sexo Biológico
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 75.5"
                  className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm text-center font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 178"
                  className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm text-center font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Idade (anos)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ex: 28"
                  className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm text-center font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2" title="Opcional: refina a proporção do seu avatar no jogo NutriHero">
                  % Gordura (Opcional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  max="60"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  placeholder="Ex: 15.0"
                  className="w-full px-4 py-3 bg-canvas border border-emerald-500/40 rounded-xl text-white text-sm text-center font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 md:col-span-2 -mt-3">
              💡 <strong>% de Gordura Corporal</strong> é opcional (3% a 60%). Ele calibra as proporções de massa magra/cintura do seu avatar no jogo <strong>NutriHero</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nível de Atividade Física
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                <option value="lightly_active">Levemente Ativo (treino 1 a 3 dias/sem)</option>
                <option value="moderately_active">Moderadamente Ativo (treino 3 a 5 dias/sem)</option>
                <option value="very_active">Muito Ativo (treino pesado 6 a 7 dias/sem)</option>
                <option value="extra_active">Extremamente Ativo (atleta / 2x ao dia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Objetivo Principal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="lose_weight">Emagrecimento / Queima de Gordura (Déficit Calórico)</option>
                <option value="maintain">Manutenção / Recomposição Corporal</option>
                <option value="gain_weight">Hipertrofia / Ganho de Massa Muscular (Superávit)</option>
              </select>
            </div>
          </div>
        </div>
      )}

        {/* SEÇÃO 2: Restrições e Cuidados Alimentares */}
        {activeTab === 'dieta' && (
          <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
              <Utensils className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-extrabold text-white">2. Restrições e Cuidados Alimentares</h2>
            </div>

          {/* Pergunta Alergias */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Você possui alguma alergia alimentar?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="hasFoodAllergies"
                  checked={hasFoodAllergies === false}
                  onChange={() => setHasFoodAllergies(false)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Não</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="hasFoodAllergies"
                  checked={hasFoodAllergies === true}
                  onChange={() => setHasFoodAllergies(true)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Sim</span>
              </label>
            </div>

            {hasFoodAllergies === true && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-3 mt-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-semibold">
                  Selecione os alimentos aos quais você possui alergia (não serão recomendados na sua dieta):
                </span>
                <div className="flex flex-wrap gap-2">
                  {commonAllergiesList.map((item) => {
                    const isSelected = allergies.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleAllergy(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-400'
                            : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
                        }`}
                      >
                        {item} {isSelected ? '✕' : '+'}
                      </button>
                    );
                  })}
                </div>

                {/* Adicionar Alimento Personalizado */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    placeholder="Adicionar outro alimento..."
                    className="px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs flex-1 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pergunta Intolerâncias */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Você possui alguma intolerância alimentar conhecida?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="hasFoodIntolerances"
                  checked={hasFoodIntolerances === false}
                  onChange={() => setHasFoodIntolerances(false)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Não</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="hasFoodIntolerances"
                  checked={hasFoodIntolerances === true}
                  onChange={() => setHasFoodIntolerances(true)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Sim</span>
              </label>
            </div>

            {hasFoodIntolerances === true && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-2 mt-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-semibold">
                  Selecione as intolerâncias que possui:
                </span>
                <div className="flex flex-wrap gap-2">
                  {commonIntolerancesList.map((item) => {
                    const isSelected = intolerances.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleIntolerance(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
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

          {/* Acompanhamento Profissional */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Existe alguma condição de saúde ou alimentação que exija acompanhamento profissional?
            </label>
            <div className="flex flex-wrap gap-4">
              {['NO', 'YES', 'UNSURE'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="needsProfessionalSupervision"
                    checked={needsProfessionalSupervision === opt}
                    onChange={() => setNeedsProfessionalSupervision(opt)}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <span>
                    {opt === 'NO' ? 'Não' : opt === 'YES' ? 'Sim' : 'Não tenho certeza'}
                  </span>
                </label>
              ))}
            </div>

            {(needsProfessionalSupervision === 'YES' || needsProfessionalSupervision === 'UNSURE') && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Aviso de Orientação Profissional</span>
                </div>
                <p>
                  As informações e cálculos do aplicativo são puramente educativos. Se você possui uma condição clínica,
                  alergia severa ou dúvida sobre sua saúde, consulte um médico ou nutricionista para prescrição individualizada.
                </p>
                <input
                  type="text"
                  value={dietaryRestrictionsNotes}
                  onChange={(e) => setDietaryRestrictionsNotes(e.target.value)}
                  placeholder="Observações complementares (opcional)..."
                  className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-xl text-white text-xs mt-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO 3: Condições e Limitações para Exercícios */}
      {activeTab === 'treino' && (
        <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
            <Dumbbell className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-extrabold text-white">3. Condições e Limitações para Exercícios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nível de Experiência com Treinos
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="BEGINNER">Iniciante (nunca treinou ou menos de 6 meses)</option>
                <option value="INTERMEDIATE">Intermediário (6 meses a 2 anos de treino)</option>
                <option value="ADVANCED">Avançado (mais de 2 anos consistentes)</option>
                <option value="RETURNING">Retornando (já treinou antes, voltando aos treinos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Frequência Semanal Pretendida
              </label>
              <select
                value={trainingFrequencyDays}
                onChange={(e) => setTrainingFrequencyDays(Number(e.target.value))}
                className="w-full px-4 py-3 bg-canvas border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'dia por semana' : 'dias por semana'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deficiência Física / Limitação de Movimento */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Possui alguma deficiência física ou limitação de movimento?
            </label>
            <div className="flex gap-4">
              {['NO', 'YES', 'UNSURE'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="hasPhysicalDisabilities"
                    checked={hasPhysicalDisabilities === opt}
                    onChange={() => setHasPhysicalDisabilities(opt)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt === 'NO' ? 'Não' : opt === 'YES' ? 'Sim' : 'Não tenho certeza'}</span>
                </label>
              ))}
            </div>

            {hasPhysicalDisabilities === 'YES' && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-3 mt-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-semibold">
                  Selecione as regiões afetadas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {bodyRegionsList.map((region) => {
                    const isSelected = affectedBodyRegions.includes(region);
                    return (
                      <button
                        type="button"
                        key={region}
                        onClick={() => toggleArrayItem(affectedBodyRegions, setAffectedBodyRegions, region)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                            : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
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
                  placeholder="Descreva brevemente a limitação (opcional)..."
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Problemas Musculares */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Possui atualmente algum problema, lesão ou estiramento em algum músculo?
            </label>
            <div className="flex gap-4">
              {['NO', 'YES', 'UNSURE'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMuscleInjuries"
                    checked={hasMuscleInjuries === opt}
                    onChange={() => setHasMuscleInjuries(opt)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt === 'NO' ? 'Não' : opt === 'YES' ? 'Sim' : 'Não tenho certeza'}</span>
                </label>
              ))}
            </div>

            {hasMuscleInjuries === 'YES' && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-3 mt-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-semibold">
                  Selecione os grupos musculares com lesão ou problema:
                </span>
                <div className="flex flex-wrap gap-2">
                  {muscleGroupsList.map((m) => {
                    const isSelected = affectedMuscles.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => toggleArrayItem(affectedMuscles, setAffectedMuscles, m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
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

          {/* Problemas nas Articulações */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Possui dor, inflamação ou lesão conhecida em alguma articulação?
            </label>
            <div className="flex gap-4">
              {['NO', 'YES', 'UNSURE'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="hasJointPain"
                    checked={hasJointPain === opt}
                    onChange={() => setHasJointPain(opt)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt === 'NO' ? 'Não' : opt === 'YES' ? 'Sim' : 'Não tenho certeza'}</span>
                </label>
              ))}
            </div>

            {hasJointPain === 'YES' && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-3 mt-3 animate-in fade-in">
                <span className="text-xs text-slate-400 block font-semibold">
                  Selecione as articulações afetadas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {bodyRegionsList.map((j) => {
                    const isSelected = affectedJoints.includes(j);
                    return (
                      <button
                        type="button"
                        key={j}
                        onClick={() => toggleArrayItem(affectedJoints, setAffectedJoints, j)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
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
                  placeholder="Ex: Condromalácia patelar grau 2 no joelho direito..."
                  className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Dor Durante Exercícios */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Você sente dor durante ou após algum movimento específico?
            </label>
            <div className="flex gap-4">
              {['NO', 'YES', 'SOMETIMES'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="hasExercisePain"
                    checked={hasExercisePain === opt}
                    onChange={() => setHasExercisePain(opt)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span>{opt === 'NO' ? 'Não' : opt === 'YES' ? 'Sim' : 'Às vezes'}</span>
                </label>
              ))}
            </div>

            {(hasExercisePain === 'YES' || hasExercisePain === 'SOMETIMES') && (
              <div className="p-4 rounded-2xl bg-canvas border border-surface-border space-y-3 mt-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Região
                    </label>
                    <input
                      type="text"
                      value={painRegion}
                      onChange={(e) => setPainRegion(e.target.value)}
                      placeholder="Ex: Joelho direito"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
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
                      placeholder="Ex: Agachamento profundo"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Intensidade Percebida ({painIntensity}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painIntensity}
                      onChange={(e) => setPainIntensity(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Movimentos com Dificuldade */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Movimentos que você possui dificuldade ou limitação para realizar:
            </label>
            <div className="flex flex-wrap gap-2">
              {movementsList.map((m) => {
                const isSelected = difficultMovements.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleArrayItem(difficultMovements, setDifficultMovements, m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-canvas text-slate-400 hover:text-white border border-surface-border'
                    }`}
                  >
                    {m} {isSelected ? '✕' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercícios a Evitar */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Exercícios específicos que você prefere evitar na rotina:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {exercisesToAvoid.map((ex) => (
                <span
                  key={ex}
                  className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{ex}</span>
                  <button
                    type="button"
                    onClick={() => setExercisesToAvoid((prev) => prev.filter((i) => i !== ex))}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAvoidExercise}
                onChange={(e) => setCustomAvoidExercise(e.target.value)}
                placeholder="Ex: Desenvolvimento com Barra, Stiff..."
                className="px-3 py-2 bg-canvas border border-surface-border rounded-xl text-white text-xs flex-1 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={addAvoidExercise}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Equipamentos Disponíveis */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Equipamentos aos quais você possui acesso para treinar:
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentList.map((eq) => {
                const isSelected = availableEquipment.includes(eq.id);
                return (
                  <button
                    type="button"
                    key={eq.id}
                    onClick={() => toggleArrayItem(availableEquipment, setAvailableEquipment, eq.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-canvas text-slate-400 hover:text-white border border-surface-border'
                    }`}
                  >
                    {eq.label} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aviso Importante e Privacidade */}
          <div className="p-4 rounded-2xl bg-canvas border border-surface-border text-slate-400 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Privacidade & Aviso de Responsabilidade em Saúde</span>
            </div>
            <p>
              As informações fornecidas são tratadas com sigilo e utilizadas estritamente para personalização e alertas de segurança. O aplicativo não realiza diagnósticos médicos e não substitui a avaliação de um médico, fisioterapeuta ou educador físico.
            </p>
          </div>
        </div>
      )}

        {/* Mensagens de Feedback */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>Perfil, restrições e avaliação física atualizados com sucesso!</span>
          </div>
        )}

        {/* Botão de Salvar e Sair */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Todas as Alterações do Perfil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
