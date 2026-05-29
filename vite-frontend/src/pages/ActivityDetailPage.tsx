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
    fetch(`/api/activities/by-slug/${activitySlug}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((raw: unknown) => {
        setActivity((raw as { data: Activity }).data);
      })
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

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="h-[60vh] bg-(--color-surface)" />
        <div className="detail-body">
          <div className="skeleton-card border-none bg-transparent">
            <div className="skeleton-card__body">
              <div className="skeleton-card__line skeleton-card__line--medium h-5" />
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
      <div className="page-wrapper flex flex-col items-center justify-center min-h-[80vh]">
        <p className="text-(--color-text-muted) mb-6">Cette épreuve n'existe pas ou a été dévorée.</p>
        <Link to="/les-epreuves" className="text-(--color-red) no-underline">
          ← Toutes les épreuves
        </Link>
      </div>
    );
  }

  const imgUrl = activity.image_filename
    ? `/images/uploads/banners/${activity.image_filename}`
    : `https://placehold.co/1400x600/141414/888?text=${encodeURIComponent(activity.title)}`;

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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: contenu TipTap interne, pas de saisie utilisateur externe */}
        <div className="text-base leading-7 text-(--color-text-muted) mb-8" dangerouslySetInnerHTML={{ __html: activity.description }} />

        <div className="flex items-center gap-2 text-(--color-text-muted) text-sm mb-12">
          <span>⏱</span>
          <span>Durée : 20 min.</span>
        </div>

        <h2 className="font-montserrat font-bold text-[1.1rem] text-(--color-text) tracking-widest mb-6">
          SESSIONS DISPONIBLES
        </h2>

        {sessionsLoading && <div className="text-(--color-text-muted) text-sm">Chargement des sessions…</div>}

        {!sessionsLoading && sessions.length === 0 && (
          <p className="text-(--color-text-muted) text-sm">Aucune session planifiée pour cette épreuve.</p>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between flex-wrap gap-3 bg-(--color-surface) border border-(--color-border) rounded-lg px-5 py-4"
              >
                <span className="text-sm text-(--color-text) font-semibold capitalize">
                  {formatDate(s.date_iso)} à {formatTime(s.date_iso)}
                </span>
                <span className="text-(--color-text-muted) text-[0.85rem]">{s.available_capacity} places</span>
                <span className="text-(--color-red) font-bold">€{Number.parseFloat(s.unit_price).toFixed(2)}</span>
                <Link
                  to={`/sessions/${s.id}`}
                  className="bg-(--color-red) hover:bg-(--color-red-hover) text-white px-4 py-1.5 rounded no-underline text-[0.8rem] font-semibold uppercase tracking-wider transition-colors duration-200"
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