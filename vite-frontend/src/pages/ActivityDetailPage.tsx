import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Activity, Session } from '../types/api';
import '../styles/pages.scss';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
}

export default function ActivityDetailPage() {
  const params = useParams<{ activitySlug?: string; slug?: string }>();
  const activitySlug = params.activitySlug ?? params.slug;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!activitySlug) return;
    setLoading(true);
    setError(false);
    fetch(`/api/activities/${activitySlug}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: unknown) => setActivity(data as Activity))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activitySlug]);

  useEffect(() => {
    if (!activitySlug) return;
    setSessionsLoading(true);
    fetch(`/api/sessions?activity_slug=${activitySlug}&status=Scheduled&limit=6`)
      .then((r) => r.json())
      .then((raw: unknown) => {
        const rows = Array.isArray(raw) ? raw : ((raw as { data?: Session[] }).data ?? []);
        setSessions(rows as Session[]);
      })
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, [activitySlug]);

  const imgUrl = activity?.image_filename
    ? `/images/${activity.image_filename}`
    : `https://placehold.co/1400x600/141414/888?text=${encodeURIComponent(activity?.title ?? '')}`;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ height: '60vh', backgroundColor: 'var(--color-surface)', animation: 'none' }} />
        <div className="detail-body">
          <div className="skeleton-card" style={{ border: 'none', background: 'none' }}>
            <div className="skeleton-card__body">
              <div className="skeleton-card__line skeleton-card__line--medium" style={{ height: '20px' }} />
              <div className="skeleton-card__line skeleton-card__line--full" />
              <div className="skeleton-card__line skeleton-card__line--full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
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
          Cette épreuve n'existe pas ou a été dévorée.
        </p>
        <Link to="/les-epreuves" style={{ color: 'var(--color-red)', textDecoration: 'none' }}>
          ← Toutes les épreuves
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="detail-hero">
        <div className="detail-hero__bg" style={{ backgroundImage: `url('${imgUrl}')` }} />
        <div className="detail-hero__content">
          <Link to="/les-epreuves" className="detail-hero__back">
            ← Toutes les épreuves
          </Link>
          <h1 className="detail-hero__title">{activity.title}</h1>
        </div>
      </div>

      <div className="detail-body">
        <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          {activity.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            marginBottom: '48px',
          }}
        >
          <span>⏱</span>
          <span>Durée : 20 min.</span>
        </div>

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
          SESSIONS DISPONIBLES
        </h2>

        {sessionsLoading && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Chargement des sessions…</div>
        )}

        {!sessionsLoading && sessions.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Aucune session planifiée pour cette épreuve.
          </p>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {formatDate(s.date)} à {formatTime(s.date)}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{s.capacity} places</span>
                <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>
                  €{Number.parseFloat(s.unit_price).toFixed(2)}
                </span>
                <Link
                  to={`/${activitySlug}-${s.id}`}
                  style={{
                    backgroundColor: 'var(--color-red)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Réserver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
