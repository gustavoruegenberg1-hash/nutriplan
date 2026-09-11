import React from 'react';
import { Droplets, X, Clock, Check } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/mobile';
import { waterReminderService } from '../../services/waterReminderService';
import { gamificationService } from '../../services/gamificationService';

interface WaterReminderModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onWaterRecorded?: (message: string) => void;
}

export const WaterReminderModal: React.FC<WaterReminderModalProps> = ({
  userId,
  isOpen,
  onClose,
  onWaterRecorded,
}) => {
  if (!isOpen) return null;

  const handleDrink = async () => {
    triggerHapticFeedback();
    try {
      const res = await gamificationService.recordAction(userId, 'DRINK_WATER');
      waterReminderService.recordWaterDrunk(userId);
      if (onWaterRecorded) {
        onWaterRecorded(res.message || 'Hidratação registrada com sucesso! (+250ml)');
      }
    } catch {
      waterReminderService.recordWaterDrunk(userId);
      if (onWaterRecorded) {
        onWaterRecorded('Copo de água registrado! Seu corpo agradece.');
      }
    }
    onClose();
  };

  const handleSnooze = () => {
    triggerHapticFeedback();
    waterReminderService.snooze(userId, 15);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0B0F17] border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/60">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Conteúdo */}
        <div className="flex flex-col items-center text-center relative z-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
            <Droplets className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Lembrete de Hidratação
            </span>
            <h3 className="text-xl font-black text-white mt-2">
              Hora de Beber Água!
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Manter-se hidratado estimula a queima metabólica, acelera a recuperação muscular e previne fadiga física e mental.
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            <button
              onClick={handleDrink}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Droplets className="w-4 h-4 fill-slate-950" />
              <span>Registrar Copo d'Água (+250ml)</span>
            </button>

            <button
              onClick={handleSnooze}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lembrar em 15 minutos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
