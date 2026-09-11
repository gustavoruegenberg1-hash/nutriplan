import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';

export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Inicializa os recursos nativos do dispositivo (Barra de status escura, splash screen, listeners).
 */
export async function initializeNativeMobileApp(): Promise<void> {
  if (!isNativeMobile()) {
    // Registrar Service Worker para PWA em navegadores móveis
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
    return;
  }

  try {
    // Configura a barra de status com tema escuro nativo
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B0F17' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    console.warn('Status Bar plugin error:', e);
  }

  try {
    // Esconde a Splash Screen de inicialização suavemente
    await SplashScreen.hide();
  } catch (e) {
    console.warn('Splash Screen plugin error:', e);
  }

  // Listener para o botão de voltar nativo do Android
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      // Verifica se há modal aberto antes de navegar
      const hasOpenModal = document.querySelector('[role="dialog"], [data-modal="true"]');
      if (hasOpenModal) {
        // Tenta fechar o modal clicando no botão de fechar
        const closeBtn = hasOpenModal.querySelector('[data-close-modal]');
        if (closeBtn instanceof HTMLElement) closeBtn.click();
      } else {
        window.history.back();
      }
    } else {
      CapApp.exitApp();
    }
  });
}

/**
 * Executa vibração tátil sutil (Haptic Feedback) em toques de botões e abas.
 */
export async function triggerHapticFeedback(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (isNativeMobile()) {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Ignora silenciosamente se o dispositivo não suportar
    }
  } else if ('vibrate' in navigator) {
    try {
      navigator.vibrate(10);
    } catch (e) {
      // Ignora
    }
  }
}
