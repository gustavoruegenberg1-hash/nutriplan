import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { professionalsService } from '../services/professionalsService';
import {
  Conversation,
  Message,
  Professional,
  SharedProfileContext,
} from '../types/professionals';
import { ShareProfileModal } from '../components/professionals/ShareProfileModal';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Check,
  CheckCheck,
  Clock,
  User,
  Utensils,
  Dumbbell,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const ChatScreen: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentProfessional, setCurrentProfessional] = useState<Professional | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [inputContent, setInputContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal de Compartilhamento de Perfil
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Modo de visualização (para testes: Paciente vs Profissional)
  const [simulationRole, setSimulationRole] = useState<'USER' | 'PROFESSIONAL'>('USER');
  const [actingProfessionalId, setActingProfessionalId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollingTimerRef = useRef<any>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Carrega lista de conversas
  const loadConversations = async (keepSelection = true) => {
    try {
      const list = await professionalsService.fetchConversations(
        simulationRole === 'PROFESSIONAL' ? actingProfessionalId : undefined
      );
      setConversations(list);

      if (conversationId && keepSelection) {
        const found = list.find((c: Conversation) => c.id === conversationId);
        if (found) {
          setSelectedConversation(found);
        }
      }
    } catch {
      // Silencioso
    } finally {
      setLoadingConversations(false);
    }
  };

  // Carrega mensagens da conversa ativa
  const loadMessages = async (convId: string, initial = false) => {
    if (initial) setLoadingMessages(true);
    setErrorMsg(null);
    try {
      const data = await professionalsService.fetchMessages(
        convId,
        simulationRole === 'PROFESSIONAL' ? actingProfessionalId : undefined
      );
      setMessages(data.messages);
      setSelectedConversation(data.conversation);
      setCurrentProfessional(data.professional);

      // Marca como lido
      await professionalsService.markRead(
        convId,
        simulationRole === 'PROFESSIONAL' ? actingProfessionalId : undefined
      );

      if (initial) {
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar mensagens.');
    } finally {
      if (initial) setLoadingMessages(false);
    }
  };

  // Inicialização e atualização de rota
  useEffect(() => {
    loadConversations();
  }, [simulationRole, actingProfessionalId]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId, true);

      // Polling inteligente de novas mensagens a cada 4 segundos
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = setInterval(() => {
        loadMessages(conversationId, false);
      }, 4000);
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [conversationId, simulationRole, actingProfessionalId]);

  // Enviar Mensagem
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputContent.trim();
    if (!text || isSending || !selectedConversation) return;

    setIsSending(true);
    try {
      const res = await professionalsService.sendMessage(
        selectedConversation.id,
        text,
        simulationRole,
        simulationRole === 'PROFESSIONAL' ? actingProfessionalId : undefined
      );

      setInputContent('');
      setMessages((prev) => [...prev, res.message]);
      setSelectedConversation(res.conversation);

      // Atualiza na lista de conversas
      setConversations((prev) =>
        prev.map((c) => (c.id === res.conversation.id ? { ...c, ...res.conversation } : c))
      );

      setTimeout(() => scrollToBottom(), 80);
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  // Compartilhar Dados de Perfil
  const handleConfirmShare = async (data: SharedProfileContext) => {
    if (!selectedConversation) return;
    try {
      const res = await professionalsService.shareProfile(selectedConversation.id, data);
      setMessages((prev) => [...prev, res.message]);
      setSelectedConversation(res.conversation);
      setTimeout(() => scrollToBottom(), 80);
    } catch (err: any) {
      alert(err.message || 'Erro ao compartilhar perfil');
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/chat/${conv.id}`);
  };

  // Formatação de data/hora amigável
  const formatMsgTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConvDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Barra Superior de Alternância de Visão (Permite testar tanto como Paciente quanto como Profissional) */}
      <div className="bg-surface border border-surface-border rounded-xl px-3 py-2 mb-3 flex items-center justify-between text-xs flex-wrap gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Modo de Acesso:</span>
          <div className="inline-flex rounded-lg bg-surface-alt p-0.5 border border-slate-700">
            <button
              onClick={() => {
                setSimulationRole('USER');
                setActingProfessionalId('');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                simulationRole === 'USER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paciente (Você)
            </button>
            <button
              onClick={() => {
                setSimulationRole('PROFESSIONAL');
                setActingProfessionalId('prof_dra_camila');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                simulationRole === 'PROFESSIONAL' && actingProfessionalId === 'prof_dra_camila'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dra. Camila (Nutricionista)
            </button>
            <button
              onClick={() => {
                setSimulationRole('PROFESSIONAL');
                setActingProfessionalId('prof_rafael_torres');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                simulationRole === 'PROFESSIONAL' && actingProfessionalId === 'prof_rafael_torres'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prof. Rafael (Trainer)
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/professionals')}
          className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Buscar Novos Profissionais</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Container Principal do Chat: 2 Colunas no Desktop / 1 Coluna no Mobile */}
      <div className="flex-1 bg-surface border border-surface-border rounded-3xl overflow-hidden shadow-2xl flex relative">
        {/* ======================= COLUNA ESQUERDA: LISTA DE CONVERSAS ======================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-surface-border flex flex-col bg-surface-alt/40 ${
            conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Cabeçalho da Lista */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Conversas</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-semibold">
              {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
            </span>
          </div>

          {/* Lista de Conversas com Rolagem */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-surface-border/40">
            {loadingConversations ? (
              <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                Carregando conversas...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-slate-500 mx-auto mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Nenhuma conversa</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Você ainda não possui conversas ativas com profissionais.
                </p>
                <button
                  onClick={() => navigate('/professionals')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Ver Especialistas
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const isNutri = conv.professionalType === 'NUTRITIONIST';
                const displayName =
                  simulationRole === 'PROFESSIONAL' ? conv.userName || 'Paciente' : conv.professionalName;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
                        : 'hover:bg-surface-alt/60'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          conv.professionalAvatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                        }
                        alt={displayName}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-sm"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center ring-2 ring-surface shadow-sm">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {displayName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {formatConvDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isNutri ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span className="truncate">
                          {conv.professionalSpecialty || (isNutri ? 'Nutricionista' : 'Personal')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 truncate">
                        {conv.lastMessageText || 'Iniciar conversa...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================= COLUNA DIREITA: CONVERSA ATIVA ======================= */}
        <div
          className={`flex-1 flex flex-col bg-canvas ${
            conversationId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Topo do Chat: Profissional, Registro, Botão de Voltar e Ação de Compartilhar */}
              <div className="p-3 sm:p-4 border-b border-surface-border bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3 shadow-sm z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Botão de Voltar no Mobile */}
                  <button
                    onClick={() => navigate('/chat')}
                    className="md:hidden p-1.5 rounded-xl bg-surface-alt text-slate-300 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={
                      currentProfessional?.avatarUrl ||
                      selectedConversation.professionalAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                    }
                    alt={selectedConversation.professionalName}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-700 flex-shrink-0 shadow-sm"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {simulationRole === 'PROFESSIONAL'
                          ? selectedConversation.userName || 'Paciente'
                          : selectedConversation.professionalName}
                      </h3>
                      {currentProfessional?.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      <span className="text-emerald-400 font-semibold truncate">
                        {selectedConversation.professionalSpecialty || 'Especialista'}
                      </span>
                      {currentProfessional?.registrationNumber && (
                        <span className="font-mono text-slate-400">
                          &bull; {currentProfessional.registrationNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações: Compartilhar Dados de Perfil */}
                {simulationRole === 'USER' && (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                    title="Compartilhar dados de peso, objetivo e restrições com o profissional"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compartilhar Saúde</span>
                  </button>
                )}
              </div>

              {/* Corpo de Mensagens com Rolagem */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#0B0F17]/50">
                {/* Aviso inicial de início de conversa segura */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-alt/70 border border-slate-800 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Conversa privada e criptografada com profissional credenciado
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-10 text-xs text-slate-400 animate-pulse">
                    Carregando histórico de mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 max-w-xs mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-slate-500 mx-auto mb-2">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">
                      Inicie a conversa enviando uma mensagem.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Apresente seu objetivo ou envie suas dúvidas sobre alimentação e treino.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromMe =
                      (simulationRole === 'USER' && msg.senderType === 'USER') ||
                      (simulationRole === 'PROFESSIONAL' && msg.senderType === 'PROFESSIONAL');
                    const isSystemShare = msg.content.startsWith('📋 [DADOS DE SAÚDE');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 shadow-md ${
                            isSystemShare
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100'
                              : isFromMe
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-surface-alt border border-slate-700/80 text-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {/* Identificação do Remetente */}
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                            <span>
                              {msg.senderType === 'USER' ? 'Paciente' : 'Profissional'}
                            </span>
                            <span>{formatMsgTime(msg.createdAt)}</span>
                          </div>

                          {/* Conteúdo da Mensagem */}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words select-text">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de Entrada de Mensagem */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-surface-border bg-surface flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={
                    simulationRole === 'USER'
                      ? 'Digite sua mensagem para o profissional...'
                      : 'Digite sua orientação como profissional...'
                  }
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-alt border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputContent.trim() || isSending}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </>
          ) : (
            /* Estado quando nenhuma conversa foi selecionada */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-surface-alt border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Suas Conversas Privadas
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Selecione uma conversa ao lado para visualizar o histórico e enviar novas mensagens,
                ou procure um novo profissional para acompanhamento.
              </p>
              <button
                onClick={() => navigate('/professionals')}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explorar Lista de Especialistas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Compartilhamento de Perfil com Consentimento */}
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={user}
        onConfirmShare={handleConfirmShare}
      />
    </div>
  );
};
