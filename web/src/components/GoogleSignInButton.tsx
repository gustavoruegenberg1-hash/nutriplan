import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '663037343222-5uissbggo7s0qkuv9522l5j39hph52tl.apps.googleusercontent.com';

  useEffect(() => {
    if (!googleClientId) return;

    const interval = setInterval(() => {
      const google = (window as any).google;
      if (google?.accounts?.id && buttonRef.current) {
        clearInterval(interval);

        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                setLoading(true);
                await loginWithGoogle(response.credential);
                onSuccess?.();
              } catch (err: any) {
                const msg = err.response?.data?.message || 'Falha ao autenticar com o Google.';
                onError?.(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });

        buttonRef.current.innerHTML = '';
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: '100%',
          logo_alignment: 'left',
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId]);

  // Se o Client ID não estiver configurado ou estiver em modo simulação
  const handleCustomGoogleClick = async () => {
    if (!googleClientId) {
      setShowConfigModal(true);
      return;
    }

    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.prompt();
    } else {
      setShowConfigModal(true);
    }
  };

  const handleSimulateGoogleLogin = async () => {
    setShowConfigModal(false);
    setLoading(true);
    try {
      // Simula uma credencial JWT do Google de teste para permitir validação em desenvolvimento
      const mockPayload = {
        email: 'usuario.google@gmail.com',
        name: 'Usuário Google Teste',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        sub: 'google_mock_' + Date.now(),
      };
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(mockPayload));
      const mockJwt = `${header}.${payload}.mocksignature`;

      await loginWithGoogle(mockJwt);
      onSuccess?.();
    } catch (err: any) {
      onError?.(err.response?.data?.message || 'Erro ao simular login do Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        {googleClientId ? (
          <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
        ) : (
          <button
            type="button"
            onClick={handleCustomGoogleClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 text-white font-medium rounded-xl border border-slate-700 transition duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? 'Conectando...' : 'Continuar com o Google'}</span>
          </button>
        )}
      </div>

      {/* Modal explicativo quando VITE_GOOGLE_CLIENT_ID não estiver definido */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Login com Google (Gmail)</h3>
                <p className="text-xs text-slate-400">Integração Google Identity Services</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              O backend já está 100% pronto para autenticar contas Google e sincronizar perfis!
            </p>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 mb-5 space-y-2">
              <p>
                📌 <strong>Como ativar o botão oficial em produção:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Crie uma credencial OAuth 2.0 gratuita em <span className="text-blue-400">console.cloud.google.com</span></li>
                <li>Adicione seu Client ID como <code className="text-emerald-400">VITE_GOOGLE_CLIENT_ID</code> nas variáveis de ambiente.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleSimulateGoogleLogin}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition duration-200 text-center"
              >
                Testar Login Google Agora
              </button>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
