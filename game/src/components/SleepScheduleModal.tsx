import React, { useState } from 'react';
import { SleepSchedule } from '../types/game';
import { Moon, Sun, Clock, Sparkles, X, CheckCircle, Bed } from 'lucide-react';

interface SleepScheduleModalProps {
  sleep: SleepSchedule;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSchedule: (bedtime: string, wakeupTime: string) => void;
  onToggleSleepState: () => void;
  onTriggerNotificationSim: (type: 'sleep' | 'wake') => void;
}

export const SleepScheduleModal: React.FC<SleepScheduleModalProps> = ({
  sleep,
  isOpen,
  onClose,
  onUpdateSchedule,
  onToggleSleepState,
  onTriggerNotificationSim,
}) => {
  const [bedtimeInput, setBedtimeInput] = useState(sleep.bedtime);
  const [wakeupInput, setWakeupInput] = useState(sleep.wakeupTime);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSchedule(bedtimeInput, wakeupInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ciclo de Sono & Recuperação</h3>
              <p className="text-[11px] text-slate-400">Notificações inteligentes para dormir e acordar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Atual do Avatar */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            sleep.isSleeping
              ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bed className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold block">
                {sleep.isSleeping ? 'Avatar está Dormindo na Cama 💤' : 'Avatar está Acordado & Ativo ⚡'}
              </span>
              <span className="text-[10px] text-slate-400">
                {sleep.isSleeping
                  ? 'Regenerando estamina com +30% de taxa passiva'
                  : 'Pronto para trabalhar, estudar e treinar'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleSleepState}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all ${
              sleep.isSleeping
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {sleep.isSleeping ? 'Acordar Avatar' : 'Colocar na Cama'}
          </button>
        </div>

        {/* Configuração de Horários */}
        <div className="grid grid-cols-2 gap-3">
          {/* Horário de Dormir */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Horário de Dormir
            </label>
            <input
              type="time"
              value={bedtimeInput}
              onChange={(e) => setBedtimeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white text-center focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Horário de Acordar */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Horário de Acordar
            </label>
            <input
              type="time"
              value={wakeupInput}
              onChange={(e) => setWakeupInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white text-center focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
        >
          {isSaved ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Clock className="w-4 h-4" />}
          <span>{isSaved ? 'Horários Salvos com Sucesso!' : 'Salvar Preferências de Sono'}</span>
        </button>

        {/* Seção de Teste de Alertas / Notificações */}
        <div className="pt-3 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            Simular Alertas em Tempo Real:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerNotificationSim('sleep')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-indigo-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Moon className="w-3.5 h-3.5" />
              Alerta de Dormir
            </button>
            <button
              onClick={() => onTriggerNotificationSim('wake')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sun className="w-3.5 h-3.5" />
              Alerta de Despertar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
