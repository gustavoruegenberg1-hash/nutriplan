import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ requiresVerification: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nutriplan_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nutriplan_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
      localStorage.setItem('nutriplan_user', JSON.stringify(data));
    } catch (err: any) {
      console.error('Failed to fetch profile', err);
      // Apenas limpa a sessão se o token for explicitamente rejeitado com 401
      if (err.response?.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('nutriplan_token');
        localStorage.removeItem('nutriplan_user');
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nutriplan_token');
      if (storedToken) {
        setToken(storedToken);
        await refreshProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const accessToken = data.accessToken;
    localStorage.setItem('nutriplan_token', accessToken);
    setToken(accessToken);
    await refreshProfile();
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return { requiresVerification: data.requiresVerification ?? true };
  };

  const verifyEmail = async (email: string, code: string) => {
    const { data } = await api.post('/auth/verify-email', { email, code });
    if (data.accessToken) {
      localStorage.setItem('nutriplan_token', data.accessToken);
      setToken(data.accessToken);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('nutriplan_user', JSON.stringify(data.user));
      } else {
        await refreshProfile();
      }
    }
  };

  const resendCode = async (email: string) => {
    const { data } = await api.post('/auth/resend-code', { email });
    return data;
  };

  const loginWithGoogle = async (credential: string) => {
    const { data } = await api.post('/auth/google', { credential });
    const accessToken = data.accessToken;
    localStorage.setItem('nutriplan_token', accessToken);
    setToken(accessToken);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('nutriplan_user', JSON.stringify(data.user));
    } else {
      await refreshProfile();
    }
  };

  const logout = (clearAll = false) => {
    localStorage.removeItem('nutriplan_token');
    localStorage.removeItem('nutriplan_user');
    if (clearAll) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('nutriplan_') || key.startsWith('nutrihero_')) {
          localStorage.removeItem(key);
        }
      });
    }
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const updateProfile = async (data: Partial<User>) => {
    try {
      const { data: updated } = await api.patch('/auth/profile', data);
      setUser(updated);
      localStorage.setItem('nutriplan_user', JSON.stringify(updated));
    } catch (err) {
      console.warn('Falha na API ao atualizar perfil, salvando no cache local do navegador', err);
      setUser((prev) => {
        if (!prev) return null;
        const merged = { ...prev, ...data };
        localStorage.setItem('nutriplan_user', JSON.stringify(merged));
        return merged as User;
      });
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendCode,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
