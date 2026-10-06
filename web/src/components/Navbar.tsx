import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Users,
  Award,
} from 'lucide-react';
import { ProfessionalContactModal } from './ProfessionalContactModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const role = user?.role || 'USER';

  // Links dinâmicos por perfil
  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Visão Geral', icon: ShieldCheck, exact: true },
        { to: '/admin/professionals', label: 'Profissionais', icon: Award },
        { to: '/admin/users', label: 'Usuários', icon: Users },
      ];
    }
    if (role === 'PROFESSIONAL') {
      return [
        { to: '/professional', label: 'Painel', icon: LayoutDashboard, exact: true },
        { to: '/professional/clients', label: 'Meus Clientes', icon: Users },
      ];
    }
    // USER comum (Apenas as abas principais de rotina: Dashboard, Dieta e Treino)
    return [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/diet', label: 'Dieta', icon: UtensilsCrossed },
      { to: '/workouts', label: 'Treino', icon: Dumbbell },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={role === 'ADMIN' ? '/admin' : role === 'PROFESSIONAL' ? '/professional' : '/dashboard'}
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white hover:opacity-90 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              NP
            </div>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              NutriPlan <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2</span>
            </span>
          </Link>

          {/* Navegação Principal Condensada (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Lado Direito: Contato / Perfil / Sair */}
          <div className="flex items-center gap-2 sm:gap-3">
            {role === 'USER' && (
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 text-xs font-bold transition shadow-sm"
              >
                <MessageSquare size={14} />
                <span>Falar com Profissional</span>
              </button>
            )}

            {/* Acesso ao Perfil pelo Avatar / Inicial do Usuário */}
            <Link
              to="/profile"
              title="Acessar meu Perfil"
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition group ${
                location.pathname === '/profile'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate max-w-[120px]">
                  {user?.name || 'Meu Perfil'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {role === 'ADMIN' ? 'Administrador' : role === 'PROFESSIONAL' ? 'Profissional' : 'Meu Perfil'}
                </span>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              title="Encerrar Sessão"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline text-xs font-bold">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Contato com Profissionais */}
      <ProfessionalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
