import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { PasswordInput } from '../components/PasswordInput';

type TokenState = 'loading' | 'valid' | 'invalid';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [tokenState, setTokenState] = useState<TokenState>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-(--color-text) text-sm placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-red)';
  const labelClass = 'block text-xs text-(--color-text-muted) uppercase tracking-widest mb-1';

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setTokenState(res.ok ? 'valid' : 'invalid');
      })
      .catch(() => setTokenState('invalid'));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (newPassword !== confirmPassword) {
      setErrors(['Les mots de passe ne correspondent pas.']);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldErrors = data.errors?.new_password ?? [data.message ?? 'Erreur inconnue'];
        setErrors(fieldErrors);
        return;
      }
      navigate('/login', { state: { message: 'Mot de passe modifié. Vous pouvez vous connecter.' } });
    } finally {
      setLoading(false);
    }
  }

  if (tokenState === 'loading') {
    return (
      <div className="static-page">
        <div className="static-page__inner">
          <p className="text-(--color-text-muted)">Vérification du lien…</p>
        </div>
      </div>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <div className="static-page">
        <div className="static-page__inner text-center">
          <p className="text-(--color-red) mb-4">Ce lien est invalide ou a expiré.</p>
          <Link to="/forgot-password" className="text-(--color-red) hover:underline">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-120">
        <h1 className="static-page__title">NOUVEAU MOT DE PASSE</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new_password" className={labelClass}>Nouveau mot de passe</label>
            <PasswordInput
              id="new_password"
              name="new_password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
            <p className="text-[0.72rem] text-(--color-text-muted) mt-1">8 car. min., majuscule, chiffre, caractère spécial.</p>
          </div>
          <div>
            <label htmlFor="confirm_password" className={labelClass}>Confirmer le mot de passe</label>
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          {errors.length > 0 && (
            <ul className="bg-red-950/40 border border-(--color-red) text-(--color-red) text-sm rounded px-4 py-3 space-y-1">
              {errors.map((err) => <li key={err}>{err}</li>)}
            </ul>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Enregistrement…' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
