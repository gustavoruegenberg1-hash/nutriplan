import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Award,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  Send,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const ProfessionalDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat com cliente
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Modal Vincular Novo Aluno
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [linking, setLinking] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profRes, clientsRes] = await Promise.all([
        api.get('/professionals/me'),
        api.get('/professionals/clients'),
      ]);
      setProfile(profRes.data);
      setClients(clientsRes.data);
    } catch {
      setError('Falha ao carregar informações do painel profissional.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openChatWithClient = async (client: any) => {
    setSelectedClient(client);
    setIsChatOpen(true);
    try {
      const res = await api.get(`/messages/${client.id}`);
      setChatMessages(res.data);
    } catch {
      setChatMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;

    setSendingMsg(true);
    try {
      const res = await api.post(`/messages/${selectedClient.id}`, {
        content: newMessage.trim(),
      });
      setChatMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch {
      // ignore
    } finally {
      setSendingMsg(false);
    }
  };

  const openLinkModal = async () => {
    setIsLinkModalOpen(true);
    try {
      const res = await api.get('/admin/users');
      setAllUsers(res.data.filter((u: any) => u.role === 'USER'));
    } catch {
      // ignore
    }
  };

  const handleLinkClient = async (userId: string) => {
    setLinking(true);
    try {
      await api.post(`/professionals/clients/${userId}/link`);
      await loadDashboardData();
      setIsLinkModalOpen(false);
    } catch {
      alert('Erro ao vincular aluno.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando painel profissional...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  const status = profile?.status || 'PENDING';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12 text-slate-100">
      {/* 1. Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Award className="text-teal-400" size={28} />
              <span>Painel do Especialista</span>
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : status === 'PENDING'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
              }`}
            >
              {status === 'APPROVED' ? 'Aprovado' : status === 'PENDING' ? 'Em Análise' : 'Revisão Solicitada'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Supervisão clínica, prescrição dietética e acompanhamento de alunos.
          </p>
        </div>

        {status === 'APPROVED' && (
          <button
            onClick={openLinkModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Vincular Novo Aluno</span>
          </button>
        )}
      </div>

      {/* 2. Banner de Status (Se não for aprovado) */}
      {status === 'PENDING' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm space-y-2">
          <div className="font-bold flex items-center gap-2 text-base text-amber-300">
            <Clock size={20} />
            <span>Seu cadastro profissional está em processo de verificação</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Nossa equipe administrativa está validando seu número de registro profissional ({profile?.councilNumber}).
            Assim que a credencial for homologada, você terá acesso completo para prescrever dietas e acompanhar seus alunos.
          </p>
        </div>
      )}

      {status === 'CORRECTION_REQUESTED' && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm space-y-2">
          <div className="font-bold flex items-center gap-2 text-base text-rose-300">
            <AlertTriangle size={20} />
            <span>Ajustes solicitados pela equipe de moderação</span>
          </div>
          <p className="text-slate-300">
            <strong>Parecer do Administrador:</strong> {profile?.reviewNotes || 'Por favor, revise os documentos submetidos.'}
          </p>
        </div>
      )}

      {/* 3. Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Alunos Ativos</span>
            <Users size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{clients.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Sob sua supervisão direta</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Registro Profissional</span>
            <ShieldCheck size={18} className="text-teal-400" />
          </div>
          <div className="text-lg font-bold text-white">{profile?.councilNumber || 'Em análise'}</div>
          <span className="text-xs text-slate-400 mt-1 block">
            {profile?.specialty === 'NUTRITIONIST' ? 'Nutricionista Clínico' : 'Treinador / EF'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Atendimento Integrado</span>
            <MessageSquare size={18} className="text-sky-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">Canal Seguro Ativo</div>
          <span className="text-xs text-slate-400 mt-1 block">Comunicação direta com alunos</span>
        </div>
      </div>

      {/* 4. Lista de Alunos / Clientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            <span>Seus Alunos e Pacientes</span>
          </h2>
          <span className="text-xs text-slate-400">{clients.length} cadastrados</span>
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <Users size={48} className="mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">Nenhum aluno vinculado ainda</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Quando você for associado a pacientes ou vincular alunos pelo e-mail, eles aparecerão aqui com metas, planos e canal de chat.
            </p>
            {status === 'APPROVED' && (
              <button
                onClick={openLinkModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                Vincular Aluno Agora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Objetivo:</span>
                      <strong className="text-slate-200">
                        {c.goal === 'LOSE_WEIGHT' ? 'Emagrecimento' : c.goal === 'GAIN_WEIGHT' ? 'Hipertrofia' : 'Manutenção'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Peso Atual:</span>
                      <strong className="text-slate-200">{c.weight ? `${c.weight} kg` : '--'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openChatWithClient(c)}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>Conversar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer / Modal de Chat com o Aluno */}
      {isChatOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
            {/* Header do Chat */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Conversa com {selectedClient.name}</h3>
                <span className="text-[11px] text-emerald-400 font-medium">Aluno NutriPlan</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhuma mensagem ainda. Inicie o suporte com seu aluno.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sender_id !== selectedClient.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs ${
                          isMe
                            ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input de envio */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua orientação técnica ou tire dúvidas..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vincular Novo Aluno */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Vincular Novo Aluno</h3>
            <p className="text-xs text-slate-400">
              Selecione um usuário cadastrado na plataforma para assumir sua supervisão profissional:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-white block">{u.name}</strong>
                    <span className="text-slate-400">{u.email}</span>
                  </div>
                  <button
                    onClick={() => handleLinkClient(u.id)}
                    disabled={linking}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition disabled:opacity-50"
                  >
                    Vincular
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
