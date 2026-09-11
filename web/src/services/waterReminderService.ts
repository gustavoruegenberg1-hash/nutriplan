export interface WaterReminderConfig {
  enabled: boolean;
  intervalMinutes: number; // 30, 45, 60, 90, 120
  startTime: string; // "08:00"
  endTime: string; // "22:00"
  lastDrunkTimestamp: number;
  soundEnabled: boolean;
}

const DEFAULT_CONFIG: WaterReminderConfig = {
  enabled: true,
  intervalMinutes: 60,
  startTime: '08:00',
  endTime: '22:00',
  lastDrunkTimestamp: Date.now(),
  soundEnabled: true,
};

export const waterReminderService = {
  getStorageKey(userId: string): string {
    return `nutriplan_water_reminder_${userId || 'guest'}`;
  },

  getConfig(userId: string): WaterReminderConfig {
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return { ...DEFAULT_CONFIG, lastDrunkTimestamp: Date.now() };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return { ...DEFAULT_CONFIG, lastDrunkTimestamp: Date.now() };
    }
  },

  saveConfig(userId: string, config: WaterReminderConfig): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(config));
    } catch (e) {
      console.warn('Falha ao salvar configuração de lembretes de água', e);
    }
  },

  recordWaterDrunk(userId: string): void {
    const config = this.getConfig(userId);
    config.lastDrunkTimestamp = Date.now();
    this.saveConfig(userId, config);
  },

  snooze(userId: string, snoozeMinutes = 15): void {
    const config = this.getConfig(userId);
    // Empurra para frente simulando que bebeu há menos tempo
    const shiftMs = (config.intervalMinutes - snoozeMinutes) * 60 * 1000;
    config.lastDrunkTimestamp = Date.now() - Math.max(0, shiftMs);
    this.saveConfig(userId, config);
  },

  // Retorna se está dentro do horário inicial e final configurados
  isWithinOperatingHours(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(':').map((v) => parseInt(v, 10) || 0);
    const [endH, endM] = endTime.split(':').map((v) => parseInt(v, 10) || 0);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    }
    // Caso de virada de meia-noite (ex: 22:00 até 06:00)
    return currentMinutes >= startTotal || currentMinutes <= endTotal;
  },

  // Verifica se um lembrete deve ser exibido agora
  shouldRemind(userId: string): boolean {
    const config = this.getConfig(userId);
    if (!config.enabled) return false;

    // 1. Respeita o intervalo de horários
    if (!this.isWithinOperatingHours(config.startTime, config.endTime)) {
      return false;
    }

    // 2. Compara com a última ingestão registrada
    const elapsedMinutes = (Date.now() - config.lastDrunkTimestamp) / (1000 * 60);
    return elapsedMinutes >= config.intervalMinutes;
  },

  // Próximo lembrete estimado formatado HH:MM
  getNextReminderTime(userId: string): string {
    const config = this.getConfig(userId);
    if (!config.enabled) return 'Lembretes desativados';

    const nextTimestamp = config.lastDrunkTimestamp + config.intervalMinutes * 60 * 1000;
    const nextDate = new Date(nextTimestamp);
    const now = new Date();

    if (nextDate <= now) {
      return 'Agora';
    }

    const hours = String(nextDate.getHours()).padStart(2, '0');
    const minutes = String(nextDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // Solicita permissão para notificações nativas do navegador se disponíveis
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  },

  // Dispara notificação nativa do sistema operacional
  sendNativeNotification(title: string, body: string): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback silencioso
      }
    }
  },
};
