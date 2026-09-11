import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professionalsService } from '../services/professionalsService';
import { Professional } from '../types/professionals';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Utensils,
  Dumbbell,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  FileBadge,
  Sparkles,
  Check,
} from 'lucide-react';

export const ProfessionalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState<boolean>(false);

  useEffect(() => {
    const loadProf = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await professionalsService.fetchProfessionalById(id);
        setProfessional(data);
      } catch (err: any) {
        setError(err.message || 'Profissional não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    loadProf();
  }, [id]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!professional || professional.status !== 'ACTIVE') {
      return;
    }

    setIsStartingChat(true);
    try {
      const res = await professionalsService.getOrCreateConversation(professional.id);
      navigate(`/chat/${res.conversation.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao iniciar conversa');
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-surface rounded-lg" />
        <div className="h-64 bg-surface rounded-2xl border border-surface-border" />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Profissional não encontrado</h2>
        <p className="text-xs text-slate-400 mb-5">{error || 'O ID informado não existe.'}</p>
        <button
          onClick={() => navigate('/professionals')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const isNutritionist = professional.type === 'NUTRITIONIST';
  const isAvailable = professional.status === 'ACTIVE';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/professionals')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para a lista de profissionais</span>
      </button>

      {/* Cartão de Apresentação Principal */}
      <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-6">
        {/* Luz ambiente decorativa */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isNutritionist ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Foto de Perfil */}
          <div className="relative flex-shrink-0">
            <img
              src={professional.avatarUrl}
              alt={professional.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-3 border-surface-border shadow-lg"
            />
            {professional.isVerified && (
              <span
                title="Credenciado e Verificado"
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full ring-4 ring-surface shadow-md"
              >
                <CheckCircle2 className="w-5 h-5" />
              </span>
            )}
          </div>

          {/* Dados Pessoais e Badges */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                  isNutritionist
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {isNutritionist ? (
                  <>
                    <Utensils className="w-3.5 h-3.5" />
                    Nutricionista Credenciado
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-3.5 h-3.5" />
                    Personal Trainer Credenciado
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-surface-alt text-slate-200 border border-slate-700">
                <FileBadge className="w-3.5 h-3.5 text-slate-400" />
                {professional.registrationNumber}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isAvailable
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isAvailable ? 'Disponível para atendimento' : 'Agenda temporariamente fechada'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {professional.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-semibold mt-1">
              {professional.specialty}
            </p>

            {/* Avaliações, Exp e Localização */}
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 mt-3 pt-3 border-t border-surface-border/60 flex-wrap">
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{professional.rating.toFixed(2)}</span>
                <span className="text-slate-400 font-normal">
                  ({professional.reviewCount} avaliações de pacientes)
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{professional.experienceYears} anos de atuação</span>
              </div>

              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{professional.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Ação Destacado */}
        <div className="mt-6 pt-5 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left text-xs text-slate-400">
            {professional.pricing && (
              <span className="font-semibold text-slate-200 block sm:inline mr-2">
                Investimento: {professional.pricing} &bull;
              </span>
            )}
            Comunicação privada direta via chat interno.
          </div>

          <button
            onClick={handleStartChat}
            disabled={!isAvailable || isStartingChat}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isAvailable
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 text-white hover:brightness-110 active:scale-95 shadow-emerald-950/60'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {isStartingChat
                ? 'Abrindo conversa...'
                : isAvailable
                ? 'Conversar com Profissional'
                : 'Profissional Indisponível'}
            </span>
          </button>
        </div>
      </div>

      {/* Grid de Informações Detalhadas: Biografia e Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biografia e Filosofia */}
        <div className="md:col-span-2 bg-surface border border-surface-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Apresentação e Metodologia</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {professional.bio}
          </p>

          <div className="mt-6 pt-5 border-t border-surface-border/60">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Registro nos Órgãos Competentes
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inscrição profissional validada sob registro nº{' '}
              <strong className="text-white font-mono">{professional.registrationNumber}</strong>. O
              exercício da profissão obedece rigorosamente às diretrizes do Código de Ética do
              Conselho Federal correspondente ({isNutritionist ? 'CFN / CRN' : 'CONFEF / CREF'}).
            </p>
          </div>
        </div>

        {/* Serviços e Áreas de Atuação */}
        <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Áreas de Foco</span>
            </h2>

            <ul className="space-y-2.5">
              {(professional.services || [
                'Atendimento individualizado',
                'Acompanhamento de metas',
                'Respostas técnicas a dúvidas',
              ]).map((serv: string, index: number) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span>{serv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-surface-alt border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Suas conversas e dados de saúde são privados e protegidos.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
