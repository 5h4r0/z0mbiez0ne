import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Activity, Session } from '../types/api';
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

function parseSessionPath(sessionPath: string): { slug: string; sessionId: number } | null {
  const parts = sessionPath.split('-');
  if (parts.length < 2) return null;
  const lastPart = parts[parts.length - 1];
  const sessionId = Number.parseInt(lastPart, 10);
  if (Number.isNaN(sessionId)) return null;
  const slug = parts.slice(0, -1).join('-');
  return { slug, sessionId };
}

export default function SessionDetailPage() {
  const params = useParams<{ sessionPath?: string; slug?: string }>();
  const sessionPath = params.sessionPath ?? params.slug;

  const [session, setSession] = useState<Session | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const parsed = sessionPath ? parseSessionPath(sessionPath) : null;

  useEffect(() => {
    if (!parsed) {
      setError(true);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/sessions/${parsed.sessionId}`).then((r) => {
        if (!r.ok) throw new Error('session not found');
        return r.json() as Promise<Session>;
      }),
      fetch(`/api/activities/${parsed.slug}`).then((r) => {
        if (!r.ok) throw new Error('activity not found');
        return r.json() as Promise<Activity>;
      }),
    ])
      .then(([s, a]) => {
        setSession(s);
        setActivity(a);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPath]);

  const total = session ? (quantity * Number.parseFloat(session.unit_price)).toFixed(2) : '0.00';

  const imgUrl = activity?.image_filename
    ? `/images/${activity.image_filename}`
    : `https://placehold.co/1400x600/141414/888?text=Session`;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ height: '60vh', backgroundColor: 'var(--color-surface)' }} />
        <div className="detail-body">
          <div className="skeleton-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-card__line skeleton-card__line--medium" style={{ height: '20px' }} />
            <div className="skeleton-card__line skeleton-card__line--full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session || !activity) {
    return (
      <div
        className="page-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Cette session n'existe pas ou a été dévorée.
        </p>
        <Link to="/sessions" style={{ color: 'var(--color-red)', textDecoration: 'none' }}>
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
          <Link to={`/${parsed?.slug}`} className="detail-hero__back">
            ← Retour à {activity.title}
          </Link>
          <h1 className="detail-hero__title">
            {activity.title} — Session du {formatLongDate(session.date)}
          </h1>
        </div>
      </div>

      <div className="detail-body">
        {/* Métadonnées */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {[
            { label: 'Date', value: formatLongDate(session.date) },
            { label: 'Heure', value: formatTime(session.date) },
            { label: 'Places disponibles', value: `${session.capacity}` },
            { label: 'Prix unitaire', value: `€${Number.parseFloat(session.unit_price).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}
              >
                {label}
              </div>
              <div
                style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'capitalize' }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Description activité */}
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--color-text-muted)', marginBottom: '48px' }}>
          {activity.description}
        </p>

        {/* Bloc réservation */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          <h2
            style={{
              fontFamily: "'bebas-neue-regular', serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--color-text)',
              letterSpacing: '0.08em',
              marginBottom: '24px',
            }}
          >
            RÉSERVER VOS PLACES
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <label htmlFor="qty" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Nombre de places :
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  backgroundColor: 'var(--color-border)',
                  border: 'none',
                  color: 'var(--color-text)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                −
              </button>
              <span
                id="qty"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                style={{
                  backgroundColor: 'var(--color-border)',
                  border: 'none',
                  color: 'var(--color-text)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                +
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total : </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-red)' }}>€{total}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Ajout au panier', { sessionId: session.id, quantity, total });
              }}
              style={{
                backgroundColor: 'var(--color-red)',
                color: '#fff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-red-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-red)';
              }}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
