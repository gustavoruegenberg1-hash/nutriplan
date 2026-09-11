import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Swords, Utensils, Dumbbell, BookOpen, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { triggerHapticFeedback } from '../utils/mobile';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { label: 'Início', path: '/', icon: LayoutDashboard },
    { label: 'Dieta', path: '/diet', icon: Utensils },
    { label: 'Treino', path: '/workout', icon: Dumbbell },
    { label: 'NutriHero', path: '/jogo', icon: Swords },
    { label: 'Ciência', path: '/articles', icon: BookOpen },
  ];

  const isTabActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-canvas/95 backdrop-blur-xl border-t border-surface-border pb-[env(safe-area-inset-bottom,8px)] pt-1 px-2 shadow-2xl">
      <nav className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              onClick={() => triggerHapticFeedback()}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 active:scale-95 select-none ${
                active
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  active ? 'bg-emerald-500/15 shadow-sm shadow-emerald-500/20' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
