import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { apiFetch } from '../store/authStore';
import '../styles/pages.scss';

type OrderLine = {
  id: number;
  session_id: number;
  tickets_qty: number;
  amount: number;
  activity_title: string | null;
  session: { id: number; date: string; date_iso: string; unit_price: number; status: string };
};

type Order = {
  id: number;
  status: string;
  total_amount: number;
  taxes: number;
  created_at: string;
  payment_method: string | null;
  payment_date: string | null;
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

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // TODO: intégrer Stripe pour le paiement réel — gérer les cas d'échec,
  // refus de carte, 3DS, remboursement. Prévoir mode test avec carte Stripe test.
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paid, setPaid] = useState(false);

  async function handleCancel() {
    if (!confirmCancel) { setConfirmCancel(true); return; }
    setCancelling(true);
    setCancelError('');
    try {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(data.message ?? 'Erreur lors de l\'annulation');
      setOrder((o) => o ? { ...o, status: 'Cancelled' } : o);
      setConfirmCancel(false);
    } catch (err) {
      setCancelError((err as Error).message);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  }

  async function handlePay() {
    setPaying(true);
    setPayError('');
    try {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmed' }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(data.message ?? 'Erreur lors du paiement');
      setOrder((o) => o ? { ...o, status: 'Confirmed' } : o);
      setPaid(true);
    } catch (err) {
      setPayError((err as Error).message);
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    let cancelled = false;
    apiFetch(`/api/orders/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<{ data: Order }>; })
      .then((d) => { if (!cancelled) setOrder(d.data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="static-page">
        <div className="static-page__inner max-w-2xl">
          <div className="skeleton-card__body flex flex-col gap-3">
            <div className="skeleton-card__line skeleton-card__line--medium h-6" />
            <div className="skeleton-card__line skeleton-card__line--full h-4" />
            <div className="skeleton-card__line skeleton-card__line--full h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="static-page">
        <div className="static-page__inner">
          <p className="text-(--color-text-muted) mb-6">Cette commande est introuvable ou vous n'y avez pas accès.</p>
          <Link to="/espace-client" className="text-(--color-red) no-underline">← Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  const totalTickets = order.lines.reduce((s, l) => s + l.tickets_qty, 0);
  const pageTitle = order.lines[0]?.activity_title ?? `Commande #${order.id}`;
  const isPending = order.status === 'Pending';
  const isConfirmed = order.status === 'Confirmed';

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-2xl">
        <Link to="/espace-client" className="text-(--color-text-muted) text-sm no-underline hover:text-(--color-red) transition-colors duration-200 mb-6 inline-block">
          ← Retour au dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <h1 className="static-page__title mb-0">{pageTitle}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${STATUS_CLASS[order.status] ?? STATUS_CLASS.Cancelled}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-10">
          {[
            { label: 'Date', value: formatShortDate(order.created_at) },
            { label: 'Billets', value: `${totalTickets}` },
            { label: 'Total TTC', value: `€${order.total_amount.toFixed(2)}`, highlight: isConfirmed || paid },
            { label: 'TVA', value: `${(order.taxes * 100).toFixed(0)} %` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-(--color-surface) border border-(--color-border) rounded-lg p-4">
              <div className="text-xs text-(--color-text-muted) uppercase tracking-widest mb-1">{label}</div>
              <div className={`text-sm font-bold ${highlight ? 'text-green-400' : 'text-(--color-text)'}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Lines */}
        <h2 className="font-['bebas-neue-regular',sans-serif] text-[1.1rem] tracking-widest text-(--color-text) mb-4">
          DÉTAIL DES BILLETS
        </h2>
        <div className="flex flex-col gap-3">
          {order.lines.map((line) => (
            <div key={line.id} className="bg-(--color-surface) border border-(--color-border) rounded-lg p-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <div className="text-sm font-bold text-(--color-text) mb-0.5">
                  {line.activity_title ?? `Session #${line.session_id}`}
                </div>
                <div className={`text-xs ${isConfirmed || paid ? 'text-green-400' : 'text-(--color-text-muted)'}`}>
                  {formatSessionDate(line.session.date_iso)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-(--color-text-muted)">{line.tickets_qty} × €{line.session.unit_price.toFixed(2)}</div>
                <div className="text-base font-bold text-(--color-red)">€{line.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions — uniquement si Pending */}
        {isPending && (
          <div className="mt-10 flex flex-col gap-4">
            {/* Payer */}
            <div>
              {payError && <p className="text-(--color-red) text-sm mb-3">{payError}</p>}
              {paid ? (
                <div>
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 rounded text-sm font-bold tracking-[0.06em] uppercase border border-green-500 bg-green-500/10 text-green-400 cursor-not-allowed opacity-100 mb-3"
                  >
                    Transaction acceptée
                  </button>
                  <p className="text-green-400 font-bold text-sm leading-relaxed">
                    Votre commande est acceptée et en cours de traitement, vous recevrez un email de confirmation accompagné de votre facture dans quelques secondes.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  className="px-5 py-2.5 rounded text-sm font-bold tracking-[0.06em] uppercase border cursor-pointer transition-colors duration-200 disabled:opacity-50 bg-(--color-red) hover:bg-(--color-red-hover) text-white border-(--color-red)"
                >
                  {paying ? 'Traitement…' : 'Payer la commande'}
                </button>
              )}
            </div>

            {/* Annuler */}
            <div>
              {cancelError && <p className="text-(--color-red) text-sm mb-3">{cancelError}</p>}
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || paid}
                className={`px-5 py-2.5 rounded text-sm font-bold tracking-[0.06em] uppercase border cursor-pointer transition-colors duration-200 disabled:opacity-50 ${
                  confirmCancel
                    ? 'bg-(--color-red) hover:bg-(--color-red-hover) text-white border-(--color-red)'
                    : 'bg-transparent border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red)'
                }`}
              >
                {cancelling ? 'Annulation…' : confirmCancel ? 'CONFIRMER L\'ANNULATION' : 'Annuler la commande'}
              </button>
              {confirmCancel && (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="block mt-2 text-sm text-(--color-text-muted) hover:text-(--color-text) bg-transparent border-none cursor-pointer p-0 transition-colors duration-200"
                >
                  ← Retour
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message post-paiement si status déjà Confirmed au chargement */}
        {isConfirmed && !paid && (
          <p className="mt-10 text-green-400 font-bold text-sm leading-relaxed">
            Votre commande est acceptée et en cours de traitement, vous recevrez un email de confirmation accompagné de votre facture dans quelques secondes.
          </p>
        )}
      </div>
    </div>
  );
}
