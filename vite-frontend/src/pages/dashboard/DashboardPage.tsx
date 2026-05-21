import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { apiFetch, useAuthStore } from '../../store/authStore';
import '../../styles/pages.scss';

type Tab = 'login' | 'register';

type OrderLine = { id: number; session_id: number; tickets_qty: number; amount: number; activity_title: string | null };
type Order = {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  lines: OrderLine[];
};

const STATUS_LABEL: Record<string, string> = {
  Pending: 'En attente',
  Confirmed: 'Confirmée',
  Cancelled: 'Annulée',
  Refunded: 'Remboursée',
};

const STATUS_CLASS: Record<string, string> = {
  Pending: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Confirmed: 'text-green-400 bg-green-400/10 border-green-400/30',
  Cancelled: 'text-(--color-text-muted) bg-(--color-surface) border-(--color-border)',
  Refunded: 'text-(--color-text-muted) bg-(--color-surface) border-(--color-border)',
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EspaceClientPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user, isHydrating } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(false);
    apiFetch('/api/orders/mine')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<{ data: Order[] }>; })
      .then((d) => { if (!cancelled) setOrders(d.data); })
      .catch(() => { if (!cancelled) setOrdersError(true); })
      .finally(() => { if (!cancelled) setOrdersLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

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

  // already logged in
  if (user) {
    return (
      <div className="static-page">
        <div className="static-page__inner max-w-2xl">
          <h1 className="static-page__title">MON ESPACE</h1>
          <p className="text-(--color-text-muted) mb-1">
            Connecté en tant que <strong className="text-(--color-text)">{user.firstname} {user.lastname}</strong>
          </p>
          <p className="text-(--color-text-muted) text-sm mb-10">{user.email}</p>

          <h2 className="font-montserrat text-[1.1rem] tracking-widest text-(--color-text) mb-5">
            MES COMMANDES
          </h2>

          {ordersLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card__body flex flex-col gap-2 bg-(--color-surface) border border-(--color-border) rounded-lg p-5">
                  <div className="skeleton-card__line skeleton-card__line--medium h-4" />
                  <div className="skeleton-card__line skeleton-card__line--full h-3" />
                </div>
              ))}
            </div>
          )}

          {!ordersLoading && ordersError && (
            <p className="text-(--color-text-muted) text-sm">Impossible de charger les commandes.</p>
          )}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <p className="text-(--color-text-muted) text-sm">Aucune commande pour l'instant.</p>
          )}

          {!ordersLoading && !ordersError && orders.length > 0 && (
            <div className="flex flex-col gap-3">
              {orders.filter((o) => o.status !== 'Cancelled').map((order) => (
                <Link
                  key={order.id}
                  to={`/dashboard/commandes/${order.id}`}
                  className="block no-underline bg-(--color-surface) border border-(--color-border) rounded-lg p-5 hover:border-(--color-red) transition-colors duration-200"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <div className="text-sm font-bold text-(--color-text) mb-1">
                      {order.lines[0]?.activity_title ?? `Commande #${order.id}`}
                    </div>
                      <div className="text-xs text-(--color-text-muted)">
                        {order.lines.reduce((s, l) => s + l.tickets_qty, 0)} billet(s) · créée le {formatShortDate(order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${STATUS_CLASS[order.status] ?? STATUS_CLASS.Cancelled}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                      <span className="text-base font-bold text-(--color-red)">€{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={async () => { await useAuthStore.getState().logout(); }}
            className="mt-10 border border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
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
