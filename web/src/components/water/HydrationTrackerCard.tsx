import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  Bell,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { waterReminderService, WaterReminderConfig } from '../../services/waterReminderService';
import { gamificationService } from '../../services/gamificationService';
import { triggerHapticFeedback } from '../../utils/mobile';

interface HydrationTrackerCardProps {
  compact?: boolean;
}

export const HydrationTrackerCard: React.FC<HydrationTrackerCardProps> = ({ compact = false }) => {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Configuração dos lembretes
  const [config, setConfig] = useState<WaterReminderConfig>(() =>
    waterReminderService.getConfig(userId)
  );

  // Copos de água bebidos hoje (sincronizados com a gamificação / pet)
  const [waterCups, setWaterCups] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cálculo da meta científica de hidratação: 35ml por kg de peso corporal
  const userWeight = user?.weight ? Number(user.weight) : 70;
  const targetWaterMl = Math.round(userWeight * 35); // Ex: 70kg * 35 = 2.450 ml
  const cupSizeMl = 250;
  const targetCups = Math.max(6, Math.ceil(targetWaterMl / cupSizeMl));

  useEffect(() => {
    if (userId) {
      setConfig(waterReminderService.getConfig(userId));

      const local = gamificationService.getLocalPet(userId);
      if (local?.vitality?.waterCups !== undefined) {
        setWaterCups(local.vitality.waterCups);
      }

      gamificationService.fetchPet(userId).then((res) => {
        if (res?.pet?.vitality?.waterCups !== undefined) {
          setWaterCups(res.pet.vitality.waterCups);
        }
      }).catch(() => {});
    }
  }, [userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddWater = async () => {
    triggerHapticFeedback();
    const newCount = waterCups + 1;
    setWaterCups(newCount);

    try {
      const res = await gamificationService.recordAction(userId, 'DRINK_WATER');
      waterReminderService.recordWaterDrunk(userId);
      setConfig(waterReminderService.getConfig(userId));
      showToast(res.message || '+250ml registrados! Seu corpo e mascote agradecem.');
    } catch {
      waterReminderService.recordWaterDrunk(userId);
      setConfig(waterReminderService.getConfig(userId));
      showToast('+250ml de água registrados com sucesso!');
    }
  };

  const handleRemoveWater = async () => {
    if (waterCups <= 0) return;
    triggerHapticFeedback();
    const newCount = waterCups - 1;
    setWaterCups(newCount);

    try {
      await gamificationService.recordAction(userId, 'REMOVE_WATER');
    } catch {
      // Ignora erro offline
    }
  };

  const handleUpdateConfig = (updates: Partial<WaterReminderConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    waterReminderService.saveConfig(userId, updated);
  };

  const handleTestNotification = async () => {
    const granted = await waterReminderService.requestNotificationPermission();
    waterReminderService.sendNativeNotification(
      '💧 Hora de Beber Água! - NutriPlan',
      'Lembrete de hidratação funcionando perfeitamente no seu dispositivo!'
    );
    showToast(
      granted
        ? 'Notificação nativa enviada para o seu sistema!'
        : 'Lembretes exibidos via alertas internos do aplicativo.'
    );
  };

  const currentWaterMl = waterCups * cupSizeMl;
  const progressPct = Math.min(100, Math.round((currentWaterMl / targetWaterMl) * 100));

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0b1329] via-[#0f172a] to-[#022c22]/20 border border-cyan-500/30 p-5 sm:p-6 shadow-xl shadow-cyan-950/20 relative overflow-hidden transition-all">
      {/* Glow de fundo estético */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <Droplets className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">Hidratação & Lembretes</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                35 ml/kg
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Meta baseada no seu peso ({userWeight} kg):{' '}
              <strong className="text-cyan-300 font-semibold">{targetWaterMl.toLocaleString()} ml</strong> / dia
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-cyan-300 border border-slate-700 transition cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          <span>Configurar Lembretes</span>
          {isConfigOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Toast informativo */}
      {toastMessage && (
        <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Progresso e Métricas */}
      <div className="space-y-2 relative z-10 mb-5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">
            Progresso de Hoje:{' '}
            <strong className="text-white text-sm">
              {currentWaterMl.toLocaleString()} ml
            </strong>{' '}
            <span className="text-slate-400 font-normal">
              ({waterCups} de {targetCups} copos)
            </span>
          </span>
          <span className="text-cyan-400 font-bold text-sm">{progressPct}%</span>
        </div>

        <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Copos Visuais e Botões de Registro Rápido */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 pt-1">
        {/* Ícones de Copos */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-md">
          {Array.from({ length: Math.min(12, Math.max(targetCups, waterCups)) }).map((_, idx) => {
            const isFilled = idx < waterCups;
            return (
              <div
                key={idx}
                className={`w-7 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300 scale-105 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-600'
                }`}
                title={`Copo ${idx + 1} (250ml)`}
              >
                <Droplets className={`w-4 h-4 ${isFilled ? 'fill-cyan-400' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Botões + e - */}
        <div className="flex items-center gap-2">
          {waterCups > 0 && (
            <button
              type="button"
              onClick={handleRemoveWater}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Remover 1 copo"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleAddWater}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Beber Copo (+250ml)</span>
          </button>
        </div>
      </div>

      {/* PAINEL EXPANSÍVEL DE CONFIGURAÇÃO DE LEMBRETES */}
      {isConfigOpen && (
        <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Lembretes Automáticos no Aplicativo
              </h4>
              <p className="text-[11px] text-slate-400">
                Receba alertas sonoros e notificações na tela para não esquecer de beber água.
              </p>
            </div>

            {/* Toggle Ativar / Desativar */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleUpdateConfig({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-300">
                {config.enabled ? 'Ativados' : 'Desativados'}
              </span>
            </label>
          </div>

          {config.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Intervalo entre Lembretes
                </label>
                <select
                  value={config.intervalMinutes}
                  onChange={(e) =>
                    handleUpdateConfig({ intervalMinutes: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value={30}>A cada 30 minutos</option>
                  <option value={45}>A cada 45 minutos</option>
                  <option value={60}>A cada 1 hora (Padrão)</option>
                  <option value={90}>A cada 1h 30min</option>
                  <option value={120}>A cada 2 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Começar a Lembrar às
                </label>
                <input
                  type="time"
                  value={config.startTime}
                  onChange={(e) => handleUpdateConfig({ startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Parar Lembretes às
                </label>
                <input
                  type="time"
                  value={config.endTime}
                  onChange={(e) => handleUpdateConfig({ endTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Rodapé da Configuração */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Próximo lembrete previsto:{' '}
              <strong className="text-white">
                {waterReminderService.getNextReminderTime(userId)}
              </strong>
            </span>

            <button
              type="button"
              onClick={handleTestNotification}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              Testar Notificação Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
