// vite-frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { ROLE_IDS } from '../lib/roles';
import { useAuthStore } from '../store/authStore';
import '../styles/pages.scss';

type Tab = 'login' | 'register';

function resolveRedirect(roleId: number, fallback: string): string {
  if (roleId === ROLE_IDS.admin) return '/manage';
  return fallback === '/login' ? '/dashboard' : fallback;
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user, isHydrating } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';

  if (isHydrating) {
    return (
      <div className="static-page">
        <div className="static-page__inner">
          <div className="skeleton-card__body flex flex-col gap-3">
            <div className="skeleton-card__line skeleton-card__line--medium h-6" />
            <div className="skeleton-card__line skeleton-card__line--full h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to={resolveRedirect(user.role_id, redirectTo)} replace />;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(fd.get('email') as string, fd.get('password') as string);
      const u = useAuthStore.getState().user;
      navigate(u ? resolveRedirect(u.role_id, redirectTo) : '/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
