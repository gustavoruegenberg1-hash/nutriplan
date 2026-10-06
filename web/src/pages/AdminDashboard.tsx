import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  ShieldCheck,
  Users,
  Award,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determina aba ativa baseado na rota
  const getInitialTab = () => {
    if (location.pathname.includes('/professionals')) return 'professionals';
    if (location.pathname.includes('/users')) return 'users';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'professionals' | 'users'>(getInitialTab);
  const [overview, setOverview] = useState<any>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Modal de Avaliação de Profissional
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState<any | null>(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);
  const [evalAction, setEvalAction] = useState<'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED'>('APPROVED');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, profRes, usrRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/professionals'),
        api.get('/admin/users'),
      ]);
      setOverview(ovRes.data);
      setProfessionals(profRes.data);
      setAllUsers(usrRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('/professionals')) setActiveTab('professionals');
    else if (location.pathname.includes('/users')) setActiveTab('users');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'professionals' | 'users') => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/admin');
    else if (tab === 'professionals') navigate('/admin/professionals');
    else if (tab === 'users') navigate('/admin/users');
  };

  const openEvaluationModal = (prof: any, action: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUESTED') => {
    setSelectedProf(prof);
    setEvalAction(action);
    setEvalNotes(prof.reviewNotes || '');
    setEvalModalOpen(true);
  };

  const submitEvaluation = async () => {
    if (!selectedProf) return;
    setSubmittingEval(true);
    try {
      await api.put(`/admin/professionals/${selectedProf.id}/status`, {
        status: evalAction,
        reviewNotes: evalNotes.trim() || undefined,
      });
      await loadAllAdminData();
      setEvalModalOpen(false);
      setSelectedProf(null);
    } catch {
      alert('Falha ao processar avaliação.');
    } finally {
      setSubmittingEval(false);
    }
  };

  const filteredProfessionals = professionals.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Carregando painel de administração e governança...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-400" size={28} />
            <span>Administração da Plataforma</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Governança de usuários, auditoria e moderação de conselhos profissionais (CRN / CREF).
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Navegação por Abas do Administrador */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Visão Geral & Métricas
        </button>

        <button
          onClick={() => handleTabChange('professionals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
            activeTab === 'professionals'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span>Moderação de Especialistas</span>
          {overview?.pendingProfessionalsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {overview.pendingProfessionalsCount} pendentes
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activeTab === 'users'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          Gestão de Usuários
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Total de Usuários</span>
              <div className="text-3xl font-extrabold text-white mt-1">{overview?.totalUsers || 0}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Contas registradas</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Especialistas Ativos</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {overview?.activeProfessionalsCount || 0}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Homologados CRN/CREF</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Aprovações Pendentes</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                {overview?.pendingProfessionalsCount || 0}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Aguardando análise</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Dietas Criadas</span>
              <div className="text-3xl font-extrabold text-teal-400 mt-1">{overview?.totalDiets || 0}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Com base TACO</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Treinos Concluídos</span>
              <div className="text-3xl font-extrabold text-indigo-400 mt-1">
                {overview?.totalWorkoutLogs || 0}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Registros no histórico</span>
            </div>
          </div>

          {/* Cards de Acesso Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => handleTabChange('professionals')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Award size={20} />
                </div>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
              <h3 className="font-bold text-white text-base">Moderar Cadastros de Especialistas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Revise as credenciais anexadas pelos nutricionistas e educadores físicos, aprove registros ou solicite retificação.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('users')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Users size={20} />
                </div>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
              <h3 className="font-bold text-white text-base">Gerenciar Base de Usuários</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspecione todos os alunos, profissionais e administradores registrados na plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PROFISSIONAIS */}
      {activeTab === 'professionals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">Filtrar por Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Pendentes de Homologação</option>
                <option value="APPROVED">Aprovados</option>
                <option value="CORRECTION_REQUESTED">Correção Solicitada</option>
                <option value="REJECTED">Rejeitados</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              {filteredProfessionals.length} profissionais encontrados
            </span>
          </div>

          {filteredProfessionals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-sm">
              Nenhum profissional encontrado com este filtro.
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Profissional</th>
                      <th className="p-3.5">Especialidade</th>
                      <th className="p-3.5">Registro</th>
                      <th className="p-3.5">Documentos</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProfessionals.map((prof) => (
                      <tr key={prof.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <strong className="text-white block text-sm">{prof.name}</strong>
                          <span className="text-slate-400">{prof.email}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-teal-400">
                            {prof.specialty === 'NUTRITIONIST' ? 'Nutricionista' : 'Treinador / EF'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-white">{prof.councilNumber}</td>
                        <td className="p-3.5">
                          {prof.documentName ? (
                            <span className="flex items-center gap-1 text-slate-300">
                              <FileText size={14} className="text-emerald-400" />
                              <span>{prof.documentName}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">Sem anexo</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              prof.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : prof.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : prof.status === 'CORRECTION_REQUESTED'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {prof.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEvaluationModal(prof, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs transition"
                            title="Aprovar profissional"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => openEvaluationModal(prof, 'CORRECTION_REQUESTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition"
                            title="Solicitar correção"
                          >
                            Corrigir
                          </button>
                          <button
                            onClick={() => openEvaluationModal(prof, 'REJECTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition"
                            title="Rejeitar cadastro"
                          >
                            Rejeitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: USUÁRIOS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário por nome, e-mail ou perfil..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400">{filteredUsers.length} usuários</span>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Nome</th>
                    <th className="p-3.5">E-mail</th>
                    <th className="p-3.5">Perfil (Role)</th>
                    <th className="p-3.5">Data de Cadastro</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-bold text-white">{u.name}</td>
                      <td className="p-3.5 text-slate-400">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : u.role === 'PROFESSIONAL'
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5">
                        <span className="text-emerald-400 font-medium">Ativo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO DE PROFISSIONAL */}
      {evalModalOpen && selectedProf && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              Avaliar Credenciamento: {selectedProf.name}
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-800/50 text-xs text-slate-300 space-y-1">
              <div><strong>Registro:</strong> {selectedProf.councilNumber}</div>
              <div><strong>Especialidade:</strong> {selectedProf.specialty}</div>
              <div><strong>Documento Anexo:</strong> {selectedProf.documentName || 'Não anexado'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Decisão da Moderação:
              </label>
              <select
                value={evalAction}
                onChange={(e) => setEvalAction(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="APPROVED">Aprovar Registro</option>
                <option value="CORRECTION_REQUESTED">Solicitar Correção de Documento</option>
                <option value="REJECTED">Rejeitar Inscrição</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Parecer / Observações para o Profissional:
              </label>
              <textarea
                rows={3}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                placeholder="Justificativa da aprovação ou orientações de reenvio..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitEvaluation}
                disabled={submittingEval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {submittingEval ? 'Processando...' : 'Confirmar Decisão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
