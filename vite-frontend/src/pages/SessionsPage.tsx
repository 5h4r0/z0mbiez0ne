import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import SessionCard from '../components/home/SessionCard';
import Pagination from '../components/Pagination';
import type { PaginatedResponse, Session } from '../types/api';
import '../styles/pages.scss';

type StatusFilter = 'all' | 'Scheduled' | 'Completed' | 'Cancelled';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Toutes',
  Scheduled: 'Planifiées',
  Completed: 'Terminées',
  Cancelled: 'Annulées',
};

function parseSessions(raw: unknown): { data: Session[]; totalPages: number } {
  if (Array.isArray(raw)) return { data: raw as Session[], totalPages: 1 };
  const p = raw as PaginatedResponse<Session>;
  return { data: p.data ?? [], totalPages: p.totalPages ?? 1 };
}

function SkeletonGrid() {
  return (
    <div className="list-page__grid">
      {Array.from({ length: 8 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <div key={i} className="skeleton-card">
          <div className="skeleton-card__img" />
          <div className="skeleton-card__body">
            <div className="skeleton-card__line skeleton-card__line--medium" />
            <div className="skeleton-card__line skeleton-card__line--short" />
            <div className="skeleton-card__line skeleton-card__line--full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('Scheduled');

  useEffect(() => {
    setLoading(true);
    setError(false);
    const statusParam = status === 'all' ? '' : `&status=${status}`;
    fetch(`/api/sessions?limit=12&page=${page}&sort=date&order=asc${statusParam}`)
      .then((r) => r.json())
      .then((raw: unknown) => {
        const parsed = parseSessions(raw);
        setSessions(parsed.data);
        setTotalPages(parsed.totalPages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, status]);

  function handleStatusChange(s: StatusFilter) {
    setStatus(s);
    setSearchParams({});
  }

  return (
    <div className="page-wrapper">
      <div className="list-page__header">
        <h1 className="list-page__title">PROCHAINES SESSIONS</h1>

        <div className="filter-pills">
          {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pills__pill${status === s ? ' filter-pills__pill--active' : ''}`}
              onClick={() => handleStatusChange(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="list-page__content">
        {loading && <SkeletonGrid />}
        {error && <p className="list-page__error">Les sessions ne sont pas disponibles pour le moment.</p>}

        {!loading && !error && sessions.length === 0 && (
          <p className="list-page__empty">Aucune session disponible pour le moment.</p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <>
            <div className="list-page__grid">
              {sessions.map((s, i) => (
                <SessionCard key={s.id} session={s} index={i} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} buildHref={(p) => `?page=${p}`} />
          </>
        )}
      </div>
    </div>
  );
}
