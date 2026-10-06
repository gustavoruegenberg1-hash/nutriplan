import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Users,
  Search,
  MessageSquare,
  Target,
  Send,
  ChevronRight,
} from 'lucide-react';

export const ProfessionalClients: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/professionals/clients');
        setClients(res.data);
        if (res.data.length > 0) {
          setSelectedClient(res.data[0]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const openChat = async (client: any) => {
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

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-emerald-400" size={28} />
            <span>Gestão de Alunos & Pacientes</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Supervisione evolução antropométrica, adesão ao plano nutricional e comunicação técnica.
          </p>
        </div>
      </div>

      {/* Grid com Lista de Alunos e Detalhe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Lista de Alunos */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno por nome ou e-mail..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
                Nenhum aluno encontrado.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{client.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{client.email}</div>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-emerald-400' : 'text-slate-600'} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna da Direita: Perfil Detalhado do Aluno Selecionado */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedClient.name}</h2>
                  <p className="text-xs text-slate-400">{selectedClient.email}</p>
                </div>
                <button
                  onClick={() => openChat(selectedClient)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <MessageSquare size={15} />
                  <span>Abrir Canal de Chat</span>
                </button>
              </div>

              {/* Métricas do Aluno */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Peso Atual</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {selectedClient.weight ? `${selectedClient.weight} kg` : '--'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Altura</span>
                  <div className="text-lg font-bold text-teal-400 mt-1">
                    {selectedClient.height ? `${selectedClient.height} cm` : '--'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Objetivo</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {selectedClient.goal === 'LOSE_WEIGHT'
                      ? 'Emagrecimento'
                      : selectedClient.goal === 'GAIN_WEIGHT'
                      ? 'Hipertrofia'
                      : 'Manutenção'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Idade</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {selectedClient.age ? `${selectedClient.age} anos` : '--'}
                  </div>
                </div>
              </div>

              {/* Informações de Acompanhamento */}
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" />
                  <span>Diretrizes de Atendimento Clínico</span>
                </h4>
                <p>
                  Como responsável técnico, utilize o canal de comunicação para orientar o aluno sobre substituições na base TACO, adequação dos macronutrientes da dieta e controle de sobrecarga progressiva nos treinos.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
              Selecione um aluno para inspecionar seus dados.
            </div>
          )}
        </div>
      </div>

      {/* Drawer / Modal de Chat com o Aluno */}
      {isChatOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">Conversa com {selectedClient.name}</h3>
                <span className="text-[11px] text-emerald-400 font-medium">Canal Seguro</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhuma mensagem ainda. Inicie o diálogo.
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

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua orientação..."
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
    </div>
  );
};
