import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

type VerifyState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<VerifyState>('loading');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setState(res.ok ? 'success' : 'error');
      })
      .catch(() => setState('error'));
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="static-page">
        <div className="static-page__inner max-w-120">
          <p className="text-(--color-text-muted) text-sm">Vérification en cours…</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="static-page">
        <div className="static-page__inner max-w-120">
          <h1 className="static-page__title">EMAIL CONFIRMÉ</h1>
          <div className="bg-green-950/40 border border-green-700 text-green-400 text-sm rounded px-4 py-3 mb-6">
            Votre adresse email a bien été confirmée. Vous pouvez maintenant passer commande.
          </div>
          <Link
            to="/"
            className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 inline-block"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-120">
        <h1 className="static-page__title">LIEN INVALIDE</h1>
        <div className="bg-red-950/40 border border-(--color-red) text-(--color-red) text-sm rounded px-4 py-3 mb-6">
          Ce lien de vérification est invalide ou a expiré. Connectez-vous et demandez un nouveau lien depuis votre compte.
        </div>
        <Link
          to="/"
          className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 inline-block"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
