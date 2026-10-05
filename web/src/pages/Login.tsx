import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Lock, Mail, ArrowRight, AlertCircle, RotateCw } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { pingServer } from '../api/client';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isServerWarming, setIsServerWarming] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Acorda o servidor em segundo plano assim que a tela abre
  useEffect(() => {
    pingServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setIsServerWarming(false);

    // Se demorar mais de 3.5s, avisa o usuário que o servidor está acordando
    const warmTimer = setTimeout(() => {
      setIsServerWarming(true);
    }, 3500);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response || err.code === 'ECONNABORTED') {
        setError(
          'O servidor seguro estava em repouso e acabou de inicializar. Por favor, clique novamente em "Entrar na Plataforma".'
        );
      } else {
        setError(
          err.response?.data?.message || 'E-mail ou senha incorretos. Verifique e tente novamente.'
        );
      }
    } finally {
      clearTimeout(warmTimer);
      setIsServerWarming(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Bem-vindo de volta!</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Acesse seu plano personalizado de dieta e treino
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-2 text-rose-400 text-sm">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
              {error.includes('repouso') && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="self-start text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5 cursor-pointer pl-8"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tentar entrar agora</span>
                </button>
              )}
            </div>
          )}

          {/* Login com Google (Gmail) */}
          <div className="mb-6">
            <GoogleSignInButton
              text="Entrar com o Google"
              onSuccess={() => navigate('/')}
              onError={(msg) => setError(msg)}
            />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-medium tracking-wider">
                  Ou acesse com e-mail
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {isServerWarming && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                <RotateCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Conectando ao servidor seguro... Isso pode levar alguns segundos se o servidor estiver saindo do repouso.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              <span>{loading ? (isServerWarming ? 'Conectando...' : 'Entrando...') : 'Entrar na Plataforma'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
