import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { professionalsService } from '../services/professionalsService';
import { Professional, ProfessionalType } from '../types/professionals';
import { ProfessionalCard } from '../components/professionals/ProfessionalCard';
import { ProfessionalFilter } from '../components/professionals/ProfessionalFilter';
import {
  Users,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const ProfessionalsList: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedType, setSelectedType] = useState<'ALL' | ProfessionalType>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Contagem de conversas ativas
  const [activeConversationsCount, setActiveConversationsCount] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await professionalsService.fetchProfessionals();
      setProfessionals(data);

      const convs = await professionalsService.fetchConversations();
      setActiveConversationsCount(convs.length);
    } catch (err: any) {
      setError('Não foi possível carregar a lista de profissionais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aplicação dos filtros em tempo real
  const filteredProfessionals = professionals.filter((p) => {
    if (selectedType !== 'ALL' && p.type !== selectedType) {
      return false;
    }
    if (onlyAvailable && p.status !== 'ACTIVE') {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSpecialty = p.specialty.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchLocation = p.location.toLowerCase().includes(q);
      if (!matchName && !matchSpecialty && !matchBio && !matchLocation) {
        return false;
      }
    }
    return true;
  });

  const counts = {
    all: professionals.length,
    nutritionists: professionals.filter((p) => p.type === 'NUTRITIONIST').length,
    trainers: professionals.filter((p) => p.type === 'TRAINER').length,
  };

  const handleChatClick = async (prof: Professional) => {
    try {
      const res = await professionalsService.getOrCreateConversation(prof.id);
      navigate(`/chat/${res.conversation.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao iniciar conversa');
    }
  };

  const handleViewProfile = (prof: Professional) => {
    navigate(`/professionals/${prof.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Cabeçalho Principal e Atalho para Chat */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Rede de Especialistas Credenciados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profissionais de Nutrição e Treino
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Consulte perfis com registros no CRN e CREF, tire dúvidas sobre dieta ou treinos e
            inicie conversas privadas com acompanhamento especializado.
          </p>
        </div>

        {/* Botão para Acessar Minhas Conversas */}
        <button
          onClick={() => navigate('/chat')}
          className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-surface-alt hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
          <span>Minhas Conversas</span>
          {activeConversationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
              {activeConversationsCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Aviso de Responsabilidade Profissional & Ética */}
      <div className="p-3.5 rounded-2xl bg-surface border border-surface-border text-slate-400 text-xs flex items-start gap-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Aviso Ético e Responsabilidade Técnica: </strong>
          Os profissionais listados são independentes e devidamente registrados em seus respectivos
          conselhos (CRN / CREF). O chat interno destina-se a orientação, acompanhamento e consultoria,
          não configurando serviço de pronto atendimento médico emergencial.
        </div>
      </div>

      {/* 3. Barra de Filtros e Busca */}
      <ProfessionalFilter
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onlyAvailable={onlyAvailable}
        onOnlyAvailableChange={setOnlyAvailable}
        counts={counts}
      />

      {/* 4. Lista de Cards / Estados de Carregamento e Vazio */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 bg-surface rounded-2xl border border-surface-border" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-surface rounded-2xl border border-rose-500/30 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Erro ao Carregar</h3>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-surface-border p-10 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Nenhum profissional encontrado
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Não encontramos nenhum profissional correspondente aos filtros e termos de pesquisa
            selecionados.
          </p>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSearchTerm('');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProfessionals.map((prof) => (
            <ProfessionalCard
              key={prof.id}
              professional={prof}
              onChatClick={handleChatClick}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
