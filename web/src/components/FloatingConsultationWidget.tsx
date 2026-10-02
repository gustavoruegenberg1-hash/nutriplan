import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Utensils,
  Dumbbell,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerHapticFeedback } from '../utils/mobile';

export const FloatingConsultationWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Não exibir o widget flutuante se não estiver logado ou já estiver nas páginas de chat/profissionais
  if (!isAuthenticated) return null;
  if (
    location.pathname.startsWith('/chat') ||
    location.pathname.startsWith('/professionals') ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  const isDietPage = location.pathname.startsWith('/diet');
  const isWorkoutPage = location.pathname.startsWith('/workout');

  // Rótulo contextual dinâmico para o botão
  const buttonLabel = isDietPage
    ? 'Consultar Nutricionista'
    : isWorkoutPage
    ? 'Consultar Personal Trainer'
    : 'Consultar Especialista';

  // Fecha o balão ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    triggerHapticFeedback();
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 select-none"
    >
      {/* Balão de Consulta Expandido (Popover) */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl shadow-black/60 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Cabeçalho do Balão */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white tracking-tight">
                  Consultoria Especializada
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Conecte-se com profissionais credenciados para planos sob medida
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Fechar"
              aria-label="Fechar balão"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Opções de Consulta */}
          <div className="space-y-2.5">
            {/* Opção Nutricionista */}
            <div
              onClick={() => handleNavigate('/professionals?type=NUTRITIONIST')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                isDietPage
                  ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                    Nutricionista Clínico & Esportivo
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    CRN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Plano alimentar individual, cálculo de macros e acompanhamento clínico.
                </p>
                <div className="mt-2 text-[11px] text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Consultar Nutricionistas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Opção Personal Trainer */}
            <div
              onClick={() => handleNavigate('/professionals?type=TRAINER')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                isWorkoutPage
                  ? 'bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/20 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-blue-500/40'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">
                    Personal Trainer
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                    CREF
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Periodização de treino biomecânico, hipertrofia, emagrecimento e postura.
                </p>
                <div className="mt-2 text-[11px] text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Consultar Personal Trainers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé com link para Chat e Todos os Profissionais */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handleNavigate('/professionals')}
              className="text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Ver Todos</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/chat')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mensagens Privadas</span>
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante (Balão de Consulta) */}
      <button
        type="button"
        onClick={() => {
          triggerHapticFeedback();
          setIsOpen((prev) => !prev);
        }}
        className={`group flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 ${
          isOpen
            ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30 ring-4 ring-emerald-500/20'
            : isDietPage
            ? 'bg-gradient-to-r from-slate-900 to-slate-950 hover:from-emerald-950 hover:to-slate-900 text-white border border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/60 ring-2 ring-emerald-500/20'
            : isWorkoutPage
            ? 'bg-gradient-to-r from-slate-900 to-slate-950 hover:from-blue-950 hover:to-slate-900 text-white border border-blue-500/50 hover:border-blue-400 shadow-blue-950/60 ring-2 ring-blue-500/20'
            : 'bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-white border border-emerald-500/40 hover:border-emerald-400 shadow-black/60 ring-2 ring-emerald-500/10'
        }`}
        title="Consultar Personal Trainer ou Nutricionista"
        aria-label="Consultar Personal Trainer ou Nutricionista"
      >
        {/* Ícone e Indicador Online Pulsante */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-4 h-4 stroke-[3]" />
          ) : isDietPage ? (
            <Utensils className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          ) : isWorkoutPage ? (
            <Dumbbell className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          ) : (
            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}

          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>

        {/* Texto do Balão Flutuante */}
        <span className="text-xs font-bold tracking-tight whitespace-nowrap hidden sm:inline">
          {isOpen ? 'Fechar' : buttonLabel}
        </span>

        {/* Versão condensada para celular */}
        <span className="text-xs font-bold tracking-tight whitespace-nowrap sm:hidden">
          {isOpen
            ? 'Fechar'
            : isDietPage
            ? 'Nutricionista'
            : isWorkoutPage
            ? 'Personal'
            : 'Consultar'}
        </span>
      </button>
    </div>
  );
};
