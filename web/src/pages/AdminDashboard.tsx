import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService, AdminStats, AdminUpdateUserData } from '../services/adminService';
import { User } from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  Ban,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser, refreshProfile } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modais
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<AdminUpdateUserData>({});
  const [editLoading, setEditLoading] = useState<boolean>(false);

  const [banTargetUser, setBanTargetUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState<string>('');
  const [banLoading, setBanLoading] = useState<boolean>(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Claim initial admin
  const [claimLoading, setClaimLoading] = useState<boolean>(false);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      if (isAdmin) {
        const [statsData, usersData] = await Promise.all([
          adminService.getStats().catch(() => null),
          adminService.listUsers(),
        ]);
        if (statsData) setStats(statsData);
        setUsers(usersData);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados administrativos:', err);
      setErrorMsg(err.response?.data?.message || 'Falha ao carregar dados de usuários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Reivindicar administrador inicial se for o primeiro usuário
  const handleClaimAdmin = async () => {
    setClaimLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminService.claimInitialAdmin();
      showNotification(res.message || 'Privilégios de Administrador concedidos com sucesso!');
      await refreshProfile();
      await loadData();
    } catch (err: any) {
      showNotification(
        err.response?.data?.message || 'Não foi possível reivindicar privilégios de administrador.',
        true,
      );
    } finally {
      setClaimLoading(false);
    }
  };

  // Abrir Modal de Edição
  const openEditModal = (target: User) => {
    setEditingUser(target);
    setEditFormData({
      name: target.name,
      email: target.email,
      role: (target.role as any) || 'USER',
      isEmailVerified: target.isEmailVerified ?? false,
      weight: target.weight ?? null,
      height: target.height ?? null,
      age: target.age ?? null,
      gender: target.gender ? (target.gender as string).toLowerCase() : null,
      goal: target.goal ? (target.goal as string).toLowerCase() : null,
      activityLevel: target.activityLevel ? (target.activityLevel as string).toLowerCase() : null,
    });
  };

  // Salvar Edição
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    try {
      const updated = await adminService.updateUser(editingUser.id, editFormData);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showNotification(`Dados de ${updated.name} atualizados com sucesso!`);
      setEditingUser(null);
      loadData(true);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Erro ao atualizar dados do usuário.', true);
    } finally {
      setEditLoading(false);
    }
  };

  // Abrir Modal de Banimento/Reativação
  const openBanModal = (target: User) => {
    setBanTargetUser(target);
    setBanReason(target.banReason || '');
  };

  // Salvar Banimento/Reativação
  const handleConfirmBan = async () => {
    if (!banTargetUser) return;
    setBanLoading(true);
    const nextBanStatus = !banTargetUser.isBanned;
    try {
      const updated = await adminService.banUser(
        banTargetUser.id,
        nextBanStatus,
        nextBanStatus ? banReason : undefined,
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showNotification(
        nextBanStatus
          ? `Conta de ${updated.name} foi suspensa.`
          : `Conta de ${updated.name} foi reativada com sucesso!`,
      );
      setBanTargetUser(null);
      loadData(true);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Erro ao alterar status de suspensão.', true);
    } finally {
      setBanLoading(false);
    }
  };

  // Abrir Modal de Exclusão
  const openDeleteModal = (target: User) => {
    setDeleteTargetUser(target);
  };

  // Salvar Exclusão
  const handleConfirmDelete = async () => {
    if (!deleteTargetUser) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteUser(deleteTargetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      showNotification(`Usuário ${deleteTargetUser.name} foi excluído definitivamente.`);
      setDeleteTargetUser(null);
      loadData(true);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Erro ao excluir usuário.', true);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Lista filtrada no frontend
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Texto
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(term);
        const matchesEmail = u.email?.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail) return false;
      }
      // Papel (Role)
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }
      // Status
      if (statusFilter === 'banned' && !u.isBanned) return false;
      if (statusFilter === 'active' && u.isBanned) return false;

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Se o usuário não for administrador
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-surface rounded-2xl border border-surface-border p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito: Administrador</h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-6 text-sm">
            Esta área é protegida e restrita exclusivamente para administradores do sistema NutriPlan.
            Se você for o responsável pela implantação, você pode reivindicar o acesso inicial caso ainda
            não exista nenhum administrador configurado.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm max-w-md mx-auto">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleClaimAdmin}
              disabled={claimLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {claimLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Reivindicar Administrador Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Painel Administrativo
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold uppercase">
                  Admin
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Gerencie usuários, papéis de acesso, suspensões e registros do NutriPlan de forma segura.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-surface-alt hover:bg-surface border border-surface-border text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total de Usuários</span>
            <span className="text-xl font-bold text-white tracking-tight">
              {stats ? stats.totalUsers : users.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Usuários Ativos</span>
            <span className="text-xl font-bold text-emerald-400 tracking-tight">
              {stats ? stats.activeUsers : users.filter((u) => !u.isBanned).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Suspensos / Banidos</span>
            <span className="text-xl font-bold text-rose-400 tracking-tight">
              {stats ? stats.bannedUsers : users.filter((u) => !!u.isBanned).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Administradores</span>
            <span className="text-xl font-bold text-purple-300 tracking-tight">
              {stats ? stats.totalAdmins : users.filter((u) => u.role === 'ADMIN').length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex items-center gap-3.5 shadow-sm col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Profissionais</span>
            <span className="text-xl font-bold text-blue-300 tracking-tight">
              {stats ? stats.totalProfessionals : users.filter((u) => u.role === 'PROFESSIONAL').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-surface-border p-4 flex flex-col md:flex-row items-center gap-3 justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Role selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL">Todos os Papéis</option>
            <option value="USER">Usuário Comum (USER)</option>
            <option value="ADMIN">Administrador (ADMIN)</option>
            <option value="PROFESSIONAL">Profissional (PROFESSIONAL)</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-1/2 md:w-auto px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="active">Apenas Ativos</option>
            <option value="banned">Apenas Suspensos</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <p className="text-sm">Carregando usuários do sistema...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-base font-semibold text-slate-300">Nenhum usuário encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os termos de busca ou filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-surface-alt/70 border-b border-surface-border text-xs uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Usuário</th>
                  <th className="px-5 py-3.5 font-semibold">Papel</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">E-mail</th>
                  <th className="px-5 py-3.5 font-semibold">Dados Metabólicos</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => {
                  const isCurrentAuthUser = u.id === currentUser?.id;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-surface-alt/40 transition-colors ${
                        u.isBanned ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Nome e Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-sm text-slate-200 flex-shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {u.name || 'Sem nome'}
                              {isCurrentAuthUser && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Papel (Role) */}
                      <td className="px-5 py-4">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                            <Shield className="w-3 h-3 text-purple-400" />
                            Admin
                          </span>
                        ) : u.role === 'PROFESSIONAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            Profissional
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            Usuário
                          </span>
                        )}
                      </td>

                      {/* Status (Ativo vs Banido) */}
                      <td className="px-5 py-4">
                        {u.isBanned ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 border border-rose-500/30 text-rose-300 w-fit">
                              <Ban className="w-3 h-3 text-rose-400" />
                              Suspenso
                            </span>
                            {u.banReason && (
                              <span className="text-[11px] text-rose-400/80 mt-1 truncate max-w-xs" title={u.banReason}>
                                Motivo: {u.banReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </td>

                      {/* E-mail Verificado */}
                      <td className="px-5 py-4">
                        {u.isEmailVerified ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verificado
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* Dados Metabólicos */}
                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div>
                          {u.weight ? `${u.weight} kg` : '--'} &middot;{' '}
                          {u.height ? `${u.height} cm` : '--'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 capitalize">
                          {u.goal ? u.goal.replace('_', ' ') : 'Sem objetivo'}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Editar */}
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar informações do usuário"
                            className="p-1.5 rounded-lg bg-surface-alt hover:bg-slate-700 text-slate-300 hover:text-white border border-surface-border transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Suspender / Reativar */}
                          <button
                            onClick={() => openBanModal(u)}
                            disabled={isCurrentAuthUser}
                            title={
                              isCurrentAuthUser
                                ? 'Você não pode suspender sua própria conta'
                                : u.isBanned
                                ? 'Reativar conta'
                                : 'Suspender/Banir conta'
                            }
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.isBanned
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => openDeleteModal(u)}
                            disabled={isCurrentAuthUser}
                            title={
                              isCurrentAuthUser
                                ? 'Você não pode excluir sua própria conta'
                                : 'Excluir usuário definitivamente'
                            }
                            className="p-1.5 rounded-lg bg-surface-alt hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-surface-border hover:border-rose-500/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: EDITAR USUÁRIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-surface-border w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Pencil className="w-5 h-5 text-emerald-400" />
                <span>Editar Informações do Usuário</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nome */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* E-mail */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço de E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Papel (Role) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Papel de Acesso
                  </label>
                  <select
                    value={editFormData.role || 'USER'}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                  >
                    <option value="USER">USER (Comum)</option>
                    <option value="ADMIN">ADMIN (Administrador)</option>
                    <option value="PROFESSIONAL">PROFESSIONAL (Especialista)</option>
                  </select>
                </div>

                {/* E-mail Verificado */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-surface-alt border border-surface-border rounded-xl text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!editFormData.isEmailVerified}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, isEmailVerified: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                    />
                    <span>E-mail Verificado</span>
                  </label>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editFormData.weight ?? ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        weight: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={editFormData.height ?? ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        height: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Idade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Idade (anos)
                  </label>
                  <input
                    type="number"
                    value={editFormData.age ?? ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        age: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Objetivo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Objetivo
                  </label>
                  <select
                    value={editFormData.goal || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, goal: e.target.value || null })}
                    className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                  >
                    <option value="">Não especificado</option>
                    <option value="lose_weight">Emagrecimento</option>
                    <option value="maintain">Manutenção</option>
                    <option value="gain_weight">Hipertrofia / Ganho</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-surface-alt hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BANIR / REATIVAR */}
      {banTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-surface-border w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  banTargetUser.isBanned
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {banTargetUser.isBanned ? <CheckCircle2 className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {banTargetUser.isBanned ? 'Reativar Conta de Usuário' : 'Suspender Conta de Usuário'}
                </h3>
                <p className="text-xs text-slate-400">
                  {banTargetUser.name} ({banTargetUser.email})
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              {banTargetUser.isBanned
                ? 'Ao reativar esta conta, o usuário poderá realizar login novamente e utilizar a plataforma normalmente.'
                : 'Ao suspender esta conta, o usuário será desconectado e impedido de fazer login ou realizar ações na plataforma.'}
            </p>

            {!banTargetUser.isBanned && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo da suspensão (exibido para o usuário):
                </label>
                <textarea
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Ex: Violação das diretrizes da comunidade ou uso indevido..."
                  className="w-full px-3 py-2 bg-surface-alt border border-surface-border rounded-xl text-sm text-white focus:outline-none focus:border-rose-500/50 resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBanTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                disabled={banLoading}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  banTargetUser.isBanned
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {banLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>{banTargetUser.isBanned ? 'Confirmar Reativação' : 'Confirmar Suspensão'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUIR DEFINITIVAMENTE */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-rose-500/30 w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Excluir Conta Definitivamente?</h3>
                <p className="text-xs text-rose-400">Ação permanente e irreversível</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Você tem certeza de que deseja remover permanentemente o usuário{' '}
              <strong className="text-white">{deleteTargetUser.name}</strong> (
              <span className="text-slate-400">{deleteTargetUser.email}</span>)?
            </p>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300">
              Todos os dados vinculados a este usuário serão excluídos da base de dados.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-alt hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Excluir Usuário</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
