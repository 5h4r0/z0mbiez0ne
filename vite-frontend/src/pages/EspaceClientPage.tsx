import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../store/authStore';
import '../styles/pages.scss';

type Tab = 'login' | 'register';

export default function EspaceClientPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/espace-client';

  // already logged in
  if (user) {
    return (
      <div className="static-page">
        <div className="static-page__inner">
          <h1 className="static-page__title">MON ESPACE</h1>
          <p className="text-(--color-text-muted) mb-2">
            Connecté en tant que <strong className="text-(--color-text)">{user.firstname} {user.lastname}</strong>
          </p>
          <p className="text-(--color-text-muted) text-sm mb-8">{user.email}</p>
          <button
            type="button"
            onClick={async () => {
              await useAuthStore.getState().logout();
            }}
            className="border border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(fd.get('email') as string, fd.get('password') as string);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await register({
        firstname: fd.get('firstname') as string,
        lastname: fd.get('lastname') as string,
        email: fd.get('email') as string,
        password: fd.get('password') as string,
        confirm: fd.get('confirm') as string,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-(--color-text) text-sm placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-red)';
  const labelClass = 'block text-xs text-(--color-text-muted) uppercase tracking-widest mb-1';

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-120">
        <h1 className="static-page__title">MON ESPACE</h1>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b border-(--color-border)">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); }}
              className={`px-5 py-2.5 text-sm font-semibold tracking-wider uppercase border-b-2 -mb-px transition-colors duration-200 bg-transparent cursor-pointer ${
                tab === t
                  ? 'text-(--color-red) border-(--color-red)'
                  : 'text-(--color-text-muted) border-transparent hover:text-(--color-text)'
              }`}
            >
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {error && (
          <p className="bg-red-950/40 border border-(--color-red) text-(--color-red) text-sm rounded px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className={labelClass}>Email</label>
              <input id="login-email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>Mot de passe</label>
              <input id="login-password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstname" className={labelClass}>Prénom</label>
                <input id="reg-firstname" name="firstname" type="text" required autoComplete="given-name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="reg-lastname" className={labelClass}>Nom</label>
                <input id="reg-lastname" name="lastname" type="text" required autoComplete="family-name" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>Email</label>
              <input id="reg-email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="reg-password" className={labelClass}>Mot de passe</label>
              <input id="reg-password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
              <p className="text-[0.72rem] text-(--color-text-muted) mt-1">8 car. min., majuscule, chiffre, caractère spécial.</p>
            </div>
            <div>
              <label htmlFor="reg-confirm" className={labelClass}>Confirmer le mot de passe</label>
              <input id="reg-confirm" name="confirm" type="password" required autoComplete="new-password" className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Inscription…' : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
