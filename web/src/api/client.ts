import axios from 'axios';

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutriplan_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
