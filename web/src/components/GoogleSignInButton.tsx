import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleSignInButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'Continuar com o Google',
  onSuccess,
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '663037343222-5uissbggo7s0qkuv9522l5j39hph52tl.apps.googleusercontent.com';

  useEffect(() => {
    if (!googleClientId) return;

    // Inicializa o One Tap do Google de forma silenciosa para conveniência
    const interval = setInterval(() => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        clearInterval(interval);

        google.accounts.id.initialize({
          client_id: googleClientId,
          auto_select: false,
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
      }
    }, 250);

    return () => clearInterval(interval);
  }, [googleClientId]);

  const handleSignIn = async () => {
    try {
      const google = (window as any).google;

      if (!google?.accounts) {
        onError?.('O serviço do Google ainda está carregando. Tente novamente em alguns segundos.');
        return;
      }

      // Método principal: Token Client oficial do Google (popup limpo acionado pelo botão personalizado)
      if (google.accounts.oauth2) {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === 'origin_mismatch') {
                onError?.(
                  'Origem não autorizada (400: origin_mismatch). Adicione a URL do site em "Origens JavaScript autorizadas" no Google Cloud Console.'
                );
              } else {
                onError?.(`Erro Google: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                await loginWithGoogle(tokenResponse.access_token);
                onSuccess?.();
              } catch (err: any) {
                const msg = err.response?.data?.message || 'Falha ao autenticar com o Google.';
                onError?.(msg);
              } finally {
                setLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            setLoading(false);
            if (err?.type === 'popup_closed') {
              return; // O usuário apenas fechou a janela do Google
            }
            onError?.('Não foi possível abrir o login do Google. Verifique se popups estão permitidos.');
          },
        });

        tokenClient.requestAccessToken();
        return;
      }

      // Fallback para One Tap caso oauth2 ainda não esteja disponível
      if (google.accounts.id) {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            onError?.('Não foi possível exibir o login do Google. Tente novamente.');
          }
        });
      }
    } catch (err: any) {
      onError?.(err?.message || 'Erro inesperado ao conectar com o Google.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      aria-label={text}
      className="w-full h-12 px-4 bg-slate-950/80 hover:bg-slate-900 active:bg-slate-950 text-white font-medium rounded-xl border border-slate-700/80 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed select-none"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-300">Conectando ao Google...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
          >
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
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {text}
          </span>
        </>
      )}
    </button>
  );
};
