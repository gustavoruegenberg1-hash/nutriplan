import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  Award,
  ChevronLeft,
} from 'lucide-react';

interface Professional {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  profession: string;
  specialty: string | null;
  registryType: string | null;
  registryNumber: string | null;
  experienceYears: number;
  bio: string | null;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  contactId: string;
  name: string;
  email: string;
  role: string;
  profession: string | null;
  specialty: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContactId?: string | null;
}

export const ProfessionalContactModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialContactId,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'chat'>('directory');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string; info?: string } | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    loadProfessionals();
    loadConversations();

    if (initialContactId) {
      openChatWithContact(initialContactId);
    }
  }, [isOpen, initialContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/professionals');
      setProfessionals(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch {
      // ignore
    }
  };

  const openChatWithContact = async (contactId: string, name?: string, info?: string) => {
    setActiveTab('chat');
    setSelectedContact({ id: contactId, name: name || 'Profissional', info });
    try {
      const res = await api.get(`/messages/${contactId}`);
      setMessages(res.data);
      // Link client if not linked
      await api.post(`/professionals/clients/${contactId}/link`, {}).catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/messages/${selectedContact.id}`, { content: newMessage });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      loadConversations();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Contato com Profissionais</h3>
              <p className="text-xs text-slate-400">Nutricionistas e Treinadores Credenciados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => {
                  setActiveTab('directory');
                  setSelectedContact(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  activeTab === 'directory' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Especialistas
              </button>
              <button
                onClick={() => {
                  setActiveTab('chat');
                  loadConversations();
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                  activeTab === 'chat' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Conversas
                {conversations.some((c) => c.unreadCount > 0) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'directory' ? (
            <div className="p-4 space-y-3">
              <div className="text-xs text-slate-400">
                Selecione um profissional para tirar dúvidas sobre sua dieta ou plano de treino:
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm">Carregando profissionais...</div>
              ) : professionals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-slate-800">
                  Nenhum profissional disponível no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">{prof.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 whitespace-nowrap">
                            {prof.profession === 'NUTRITIONIST' ? 'Nutricionista' : 'Treinador'}
                          </span>
                        </div>

                        {prof.specialty && (
                          <div className="text-xs text-emerald-400 font-medium">{prof.specialty}</div>
                        )}

                        {prof.registryNumber && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Award size={12} className="text-amber-400" />
                            <span>{prof.registryNumber}</span>
                          </div>
                        )}

                        {prof.bio && (
                          <p className="text-xs text-slate-400 line-clamp-2 pt-1">{prof.bio}</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        {prof.phone && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone size={12} /> {prof.phone}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            openChatWithContact(
                              prof.userId,
                              prof.name,
                              prof.profession === 'NUTRITIONIST' ? 'Nutricionista' : 'Treinador'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <MessageSquare size={13} />
                          <span>Falar Agora</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Tab CHAT */
            <div className="h-full flex flex-col">
              {!selectedContact ? (
                /* Lista de Conversas Recentes */
                <div className="p-4 space-y-3">
                  <div className="text-xs text-slate-400 font-semibold">Minhas Conversas Ativas:</div>
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                      <MessageSquare size={32} className="mx-auto text-slate-600" />
                      <p>Nenhuma conversa iniciada ainda.</p>
                      <button
                        onClick={() => setActiveTab('directory')}
                        className="text-xs text-teal-400 hover:underline"
                      >
                        Ver lista de profissionais disponíveis
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                      {conversations.map((conv) => (
                        <div
                          key={conv.contactId}
                          onClick={() => openChatWithContact(conv.contactId, conv.name)}
                          className="p-3.5 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{conv.name}</span>
                              {conv.profession && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {conv.profession === 'NUTRITIONIST' ? 'Nutricionista' : 'Treinador'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate max-w-sm">{conv.lastMessage || 'Conversa iniciada'}</p>
                          </div>

                          <div className="text-right space-y-1">
                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                {conv.unreadCount} nova
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500">
                              {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('pt-BR') : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Chat Ativo com Contato */
                <div className="flex-1 flex flex-col h-full">
                  {/* Topo do Chat */}
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedContact(null)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg"
                        title="Voltar às conversas"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div>
                        <div className="font-bold text-white text-sm">{selectedContact.name}</div>
                        {selectedContact.info && (
                          <div className="text-[11px] text-teal-400">{selectedContact.info}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                    {messages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-500">
                        Envie uma mensagem para iniciar o atendimento com este profissional.
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.receiverId === selectedContact.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                              }`}
                            >
                              {m.content}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 px-1">
                              {new Date(m.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Formulário de Envio */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Digite sua mensagem ou dúvida..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition disabled:opacity-50"
                      title="Enviar mensagem"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
