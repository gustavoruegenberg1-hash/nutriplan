import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Dumbbell,
  Search,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { formatFriendlyName } from '../utils/formatters';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficultyLevel?: string;
  description?: string;
  instructions?: string;
}

export const ExerciseCatalog: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<Exercise | null>(null);

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
    'Glúteos',
    'Panturrilha',
  ];

  const equipments = [
    'Todos',
    'Halteres',
    'Barra',
    'Máquina',
    'Polia',
    'Peso Corporal',
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await api.get('/exercises', {
          params: {
            query: searchQuery || undefined,
            muscleGroup: selectedMuscle === 'Todos' || !selectedMuscle ? undefined : selectedMuscle,
            equipment: selectedEquipment === 'Todos' || !selectedEquipment ? undefined : selectedEquipment,
            limit: 60,
          },
        });
        setExercises(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchExercises, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Banco de Exercícios
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold flex items-center gap-1">
              <Dumbbell size={12} />
              128 Exercícios Cadastrados
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Catálogo completo com agrupamentos musculares, biomecânica e instruções de execução técnica.
          </p>
        </div>
      </div>

      {/* Controles de Filtro e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome (ex: Supino, Barra Fixa, Agachamento)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500"
          >
            {muscleGroups.map((m) => (
              <option key={m} value={m}>
                {m === 'Todos' ? 'Todos os Músculos' : m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500"
          >
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq === 'Todos' ? 'Todos os Equipamentos' : eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Exercícios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Exibindo {exercises.length} exercícios</span>
          <span>Clique em um exercício para ler instruções e detalhes</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Carregando catálogo...
          </div>
        ) : exercises.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
            <Activity size={36} className="mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Nenhum exercício encontrado com esses filtros.</p>
            <p className="text-xs text-slate-500">Tente buscar por outro nome ou limpar os seletores de músculo e equipamento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exercises.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedExerciseDetail(item)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/50 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 whitespace-nowrap">
                      {formatFriendlyName(item.muscleGroup)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {formatFriendlyName(item.equipment) || 'Peso Corporal'}
                    </span>
                    {item.difficultyLevel && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60 text-[11px]">
                        Nível: {formatFriendlyName(item.difficultyLevel)}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 pt-1">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-teal-400 font-semibold pt-2 border-t border-slate-800/50">
                  <span>Ver execução técnica</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Exercício */}
      {selectedExerciseDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-xl text-white">{selectedExerciseDetail.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                    {formatFriendlyName(selectedExerciseDetail.muscleGroup)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {formatFriendlyName(selectedExerciseDetail.equipment) || 'Peso Corporal'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExerciseDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedExerciseDetail.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descrição</h4>
                  <p className="text-slate-200 mt-1 text-xs leading-relaxed">
                    {selectedExerciseDetail.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instruções de Execução</h4>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed mt-1">
                  {selectedExerciseDetail.instructions ||
                    'Posicione-se com postura ereta, estabilize o core e realize a fase excêntrica de forma controlada. Evite compensações articulares.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedExerciseDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
