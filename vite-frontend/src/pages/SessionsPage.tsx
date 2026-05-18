import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import SessionCard from '../components/home/SessionCard';
import Pagination from '../components/Pagination';
import SkeletonGrid from '../components/SkeletonGrid';
import { useFetch } from '../hooks/useFetch';
import '../styles/pages.scss';
import { parsePaginated, type Session } from '../types/api';

type StatusFilter = 'all' | 'Scheduled' | 'Completed' | 'Cancelled';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Toutes',
  Scheduled: 'Planifiées',
  Completed: 'Terminées',
  Cancelled: 'Annulées',
};

export default function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const [status, setStatus] = useState<StatusFilter>('Scheduled');

  const statusParam = status === 'all' ? '' : `&status=${status}`;
  const url = `/api/sessions?limit=12&page=${page}&sort=date&order=asc${statusParam}`;
  const { data: raw, loading, error } = useFetch<unknown>(url);

  const { data: sessions, totalPages } = useMemo(
    () => (raw !== null ? parsePaginated<Session>(raw) : { data: [], totalPages: 1 }),
    [raw],
  );

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
