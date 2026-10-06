import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  User,
  ShieldCheck,
  Award,
  Users,
  MessageSquare,
} from 'lucide-react';
import { ProfessionalContactModal } from './ProfessionalContactModal';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const role = user?.role || 'USER';

  const getNavItems = () => {
    if (role === 'ADMIN') {
      return [
        { to: '/admin', label: 'Painel', icon: ShieldCheck, exact: true },
        { to: '/admin/professionals', label: 'Especialistas', icon: Award },
        { to: '/admin/users', label: 'Usuários', icon: Users },
        { to: '/profile', label: 'Perfil', icon: User },
      ];
    }
    if (role === 'PROFESSIONAL') {
      return [
        { to: '/professional', label: 'Painel', icon: LayoutDashboard, exact: true },
        { to: '/professional/clients', label: 'Clientes', icon: Users },
        { to: '/profile', label: 'Perfil', icon: User },
      ];
    }
    // USER comum: 4 abas + botão rápido de contato opcional
    return [
      { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
      { to: '/diet', label: 'Dieta', icon: UtensilsCrossed },
      { to: '/workouts', label: 'Treino', icon: Dumbbell },
      { to: '/profile', label: 'Perfil', icon: User },
    ];
  };

  const navItems = getNavItems();
  const colsClass = navItems.length === 3 ? 'grid-cols-3' : navItems.length === 4 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 text-slate-400">
        <div className={`grid ${colsClass} h-16`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  active ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button para contato rápido no mobile (se usuário comum) */}
      {role === 'USER' && (
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 p-3.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition"
          aria-label="Falar com profissional"
          title="Falar com profissional"
        >
          <MessageSquare size={22} className="stroke-[2.5]" />
        </button>
      )}

      <ProfessionalContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
};
