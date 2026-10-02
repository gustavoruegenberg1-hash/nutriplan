import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Utensils,
  Dumbbell,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Flame,
  MessageCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Hoje', path: '/', icon: LayoutDashboard },
    { label: 'Dieta', path: '/diet', icon: Utensils },
    { label: 'Treino', path: '/workout', icon: Dumbbell },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                Nutri<span className="text-emerald-400">Plan</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wide">
                DIETA &middot; TREINO &middot; CIÊNCIA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-surface-alt/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/chat"
                  title="Mensagens e Chat Privado"
                  aria-label="Mensagens e Chat Privado"
                  className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-surface-alt rounded-lg transition-colors relative flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-surface-alt/80 hover:bg-surface-alt border border-surface-border/80 text-sm transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-slate-200 font-medium">{user?.name?.split(' ')[0]}</span>
                  {user?.role === 'ADMIN' && (
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  title="Sair da conta"
                  aria-label="Sair da conta"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-alt transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button / Profile (when authenticated) */}
          <div className="flex md:hidden items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  aria-label="Ir para perfil"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Link>
                <button
                  onClick={logout}
                  aria-label="Sair da conta"
                  title="Sair da conta"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu de navegação"
                aria-expanded={mobileMenuOpen}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-alt"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-slate-300 hover:bg-surface-alt'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 pb-1">
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    location.pathname.startsWith('/chat')
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-300 hover:bg-surface-alt'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Mensagens / Chat</span>
                </Link>
              </div>
              <div className="pt-3 border-t border-surface-border flex items-center justify-between px-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-slate-300"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{user?.name} (Perfil)</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-rose-400 flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-slate-300 hover:bg-surface-alt rounded-lg"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
