import React from 'react';
import { GameNotification } from '../types/game';
import { Droplet, Moon, Sun, Award, CheckCircle2, X } from 'lucide-react';

interface NotificationToastProps {
  notification: GameNotification | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onConfirm,
  onDismiss,
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'water':
        return <Droplet className="w-5 h-5 text-cyan-400 animate-bounce" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'wake':
        return <Sun className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />;
      case 'promo':
        return <Award className="w-5 h-5 text-amber-400 animate-pulse" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-md border-2 border-amber-500/50 rounded-3xl p-4 shadow-2xl animate-in slide-in-from-top-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{notification.message}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recompensas Exibidas no Toast */}
      {(notification.rewardKamas > 0 || notification.rewardStamina > 0 || notification.rewardXp > 0) && (
        <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-sans">Recompensa Imediata:</span>
          {notification.rewardKamas > 0 && (
            <span className="text-amber-400 font-bold">+{notification.rewardKamas} Kamas</span>
          )}
          {notification.rewardStamina > 0 && (
            <span className="text-emerald-400 font-bold">+{notification.rewardStamina} Stamina</span>
          )}
          {notification.rewardXp > 0 && (
            <span className="text-purple-400 font-bold">+{notification.rewardXp} XP</span>
          )}
        </div>
      )}

      {/* Botão de Ação Interativo com Recompensa */}
      <button
        onClick={onConfirm}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>{notification.actionText}</span>
      </button>
    </div>
  );
};
