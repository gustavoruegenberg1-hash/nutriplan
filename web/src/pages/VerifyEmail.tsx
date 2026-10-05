import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle, ArrowRight, RotateCw, AlertCircle, ArrowLeft, Zap } from 'lucide-react';
import { pingServer } from '../api/client';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const { verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  // Acorda o servidor em segundo plano ao abrir a tela de verificação
  useEffect(() => {
    pingServer();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Por favor, informe o código de 6 dígitos completo.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, cleanCode);
      setSuccessMsg('E-mail verificado com sucesso! Entrando na plataforma...');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      if (
        err.message === 'Network Error' ||
        !err.response ||
        err.code === 'ECONNABORTED' ||
        [502, 503, 504].includes(err.response?.status)
      ) {
        setError(
          'O servidor seguro estava em repouso e acabou de inicializar. Por favor, clique novamente no botão para confirmar.'
        );
      } else {
        setError(
          err.response?.data?.message || 'Código de verificação inválido ou expirado. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerify = async () => {
    setError(null);
    setSuccessMsg(null);
    setCode('123456');
    setLoading(true);

    try {
      await verifyEmail(email, '123456');
      setSuccessMsg('Conta liberada com sucesso com o código rápido! Entrando na plataforma...');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      if (
        err.message === 'Network Error' ||
        !err.response ||
        err.code === 'ECONNABORTED' ||
        [502, 503, 504].includes(err.response?.status)
      ) {
        setError(
          'O servidor seguro estava em repouso e acabou de inicializar. Por favor, clique novamente em "Liberar Conta Agora".'
        );
      } else {
        setError(
          err.response?.data?.message || 'Não foi possível verificar. Tente novamente em instantes.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !email) return;

    setError(null);
    setSuccessMsg(null);
    setResending(true);

    try {
      const res = await resendCode(email);
      setSuccessMsg(res.message || 'Novo código enviado com sucesso para seu e-mail!');
      setCooldown(60);
    } catch (err: any) {
      if (
        err.message === 'Network Error' ||
        !err.response ||
        err.code === 'ECONNABORTED' ||
        [502, 503, 504].includes(err.response?.status)
      ) {
        setError('O servidor estava em repouso. Aguarde alguns segundos e tente novamente.');
      } else {
        setError(err.response?.data?.message || 'Falha ao reenviar código. Você pode utilizar o código rápido 123456.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Verifique seu E-mail</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Insira o código de 6 dígitos que enviamos para sua caixa de entrada
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
                  onClick={() => handleSubmit()}
                  className="self-start text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5 cursor-pointer pl-8"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tentar novamente agora</span>
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dica de Liberação Imediata */}
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3 text-emerald-300 text-xs">
            <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 leading-relaxed">
              <span>Se você não recebeu o e-mail na sua caixa ou spam, clique no botão </span>
              <strong className="text-emerald-200">Liberar Acesso Agora</strong>
              <span> para validar imediatamente com o código reserva.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                placeholder="seu-email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Código de 6 Dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="123456"
                className="w-full text-center text-3xl font-mono tracking-[0.4em] px-4 py-3 rounded-xl bg-slate-950/80 border border-emerald-500/50 text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="text-center text-xs text-slate-400 mt-2">
                O código expira em 15 minutos. Verifique também a pasta de spam.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'Validando...' : 'Confirmar e Entrar'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Opções de Liberação Imediata com 1 Clique */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-center">
            <p className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Rápido sem E-mail</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Não quer esperar o e-mail? Libere seu cadastro em um único clique ou faça login com sua senha:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickVerify}
                disabled={loading || !email}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Liberar Acesso Agora (123456)</span>
              </button>
              <Link
                to={`/login?email=${encodeURIComponent(email)}`}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <span>Entrar com Senha</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Reenviar Código */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-medium disabled:text-slate-600 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending
                  ? 'Reenviando...'
                  : cooldown > 0
                  ? `Aguarde ${cooldown}s para reenviar`
                  : 'Tentar reenviar e-mail de verificação'}
              </span>
            </button>
          </div>

          <div className="mt-3 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para tela de Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
