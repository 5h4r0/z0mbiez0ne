import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Session } from '../types/api';
import '../styles/pages.scss';

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
}

export default function SessionDetailPage() {
  const params = useParams<{ id?: string; slug?: string }>();
  const id = params.id ?? params.slug?.split('-').at(-1);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/sessions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((raw: unknown) => {
        const data = (raw as { data?: Session }).data ?? (raw as Session);
        setSession(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const activity = session?.activity ?? null;
  const total = session ? (quantity * Number.parseFloat(session.unit_price)).toFixed(2) : '0.00';
  const imgUrl = activity?.image_filename
    ? `/images/${activity.image_filename}`
    : 'https://placehold.co/1400x600/141414/888?text=Session';

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="h-[60vh] bg-(--color-surface)" />
        <div className="detail-body">
          <div className="skeleton-card__body flex flex-col gap-3">
            <div className="skeleton-card__line skeleton-card__line--medium h-5" />
            <div className="skeleton-card__line skeleton-card__line--full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center min-h-[80vh]">
        <p className="text-(--color-text-muted) mb-6">Cette session n'existe pas ou a été dévorée.</p>
        <Link to="/sessions" className="text-(--color-red) no-underline">
          ← Toutes les sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="detail-hero">
        <div className="detail-hero__bg" style={{ backgroundImage: `url('${imgUrl}')` }} />
        <div className="detail-hero__content">
          <Link to={activity?.slug ? `/${activity.slug}` : '/les-epreuves'} className="detail-hero__back">
            ← Retour à {activity?.title ?? "l'épreuve"}
          </Link>
          <h1 className="detail-hero__title">
            {activity?.title ?? 'Session'} — Session du {formatLongDate(session.date)}
          </h1>
        </div>
      </div>

      <div className="detail-body">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-10">
          {[
            { label: 'Date', value: formatLongDate(session.date) },
            { label: 'Heure', value: formatTime(session.date) },
            { label: 'Places disponibles', value: `${session.capacity}` },
            { label: 'Prix unitaire', value: `€${Number.parseFloat(session.unit_price).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-(--color-surface) border border-(--color-border) rounded-lg p-4">
              <div className="text-xs text-(--color-text-muted) uppercase tracking-widest mb-1.5">{label}</div>
              <div className="text-base font-bold text-(--color-text) capitalize">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-lg p-8">
          <h2 className="font-['bebas-neue-regular',sans-serif] font-bold text-[1.1rem] text-(--color-text) tracking-widest mb-6">
            RÉSERVER VOS PLACES
          </h2>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <label htmlFor="qty" className="text-sm text-(--color-text-muted)">
              Nombre de places :
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="bg-(--color-border) border-none text-(--color-text) w-8 h-8 rounded cursor-pointer text-base"
              >
                −
              </button>
              <span id="qty" className="text-[1.1rem] font-bold text-(--color-text) min-w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="bg-(--color-border) border-none text-(--color-text) w-8 h-8 rounded cursor-pointer text-base"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-[0.85rem] text-(--color-text-muted)">Total : </span>
              <span className="text-2xl font-bold text-(--color-red)">€{total}</span>
            </div>
            <button
              type="button"
              onClick={() => console.log('Ajout au panier', { sessionId: session.id, quantity, total })}
              className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-8 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
