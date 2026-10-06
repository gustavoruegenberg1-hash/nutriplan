import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Dumbbell, Apple, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { to: '/diet', label: 'Dieta', icon: UtensilsCrossed },
    { to: '/workouts', label: 'Treinos', icon: Dumbbell },
    { to: '/foods', label: 'Alimentos', icon: Apple },
    { to: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 text-slate-400">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
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
  );
};
