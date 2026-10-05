import axios from 'axios';

const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // Se estiver hospedado no Render
    if (hostname.includes('onrender.com')) {
      return 'https://nutriplan-api-p20v.onrender.com';
    }
    return `${protocol}//${hostname}:3000`;
  }
  return 'http://localhost:3000';
};

const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos para absorver cold start de servidores na nuvem (Render)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Desperta silenciosamente a API do modo de espera
export const pingServer = async () => {
  try {
    await api.get('/health', { timeout: 60000 });
  } catch {
    // Silencioso - apenas para acordar instâncias em hibernação
  }
};

// Add Authorization header dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutriplan_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses and automatic retry on network failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry automático de 1 tentativa em caso de Network Error / Timeout (cold start)
    if (config && (!error.response || error.code === 'ECONNABORTED') && !config._retry) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return api(config);
    }

    if (error.response?.status === 401) {
      // If token expired, clear and redirect to login if not already on public route
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.dispatchEvent(new Event('auth:unauthorized'));
        localStorage.removeItem('nutriplan_token');
        localStorage.removeItem('nutriplan_user');
      }
    }
    return Promise.reject(error);
  }
);
