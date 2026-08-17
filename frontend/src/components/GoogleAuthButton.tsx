import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (err: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError, text = 'continue_with' }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1023456789012-samplewoxxappgoogleclientid.apps.googleusercontent.com';

  useEffect(() => {
    // Dynamically load Google Identity Services SDK script
    const loadGoogleScript = () => {
      if (document.getElementById('google-jssdk')) {
        renderButton();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderButton();
      };
      document.body.appendChild(script);
    };

    const renderButton = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else if (onError) {
              onError(new Error('Aucun identifiant Google reçu.'));
            }
          }
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text,
          width: '100%',
          logo_alignment: 'left'
        });
      }
    };

    loadGoogleScript();
  }, [clientId, onSuccess, onError, text]);

  const handleNativeFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]">
        {/* Fallback stylized Google Button */}
        <button
          type="button"
          onClick={handleNativeFallbackClick}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>
      </div>
    </div>
  );
};
