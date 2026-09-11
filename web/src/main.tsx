import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeNativeMobileApp } from './utils/mobile';

// Inicializa status bar, splash screen, listeners nativos e Service Worker
initializeNativeMobileApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
