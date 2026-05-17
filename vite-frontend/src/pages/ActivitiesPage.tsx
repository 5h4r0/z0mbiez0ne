import { useEffect, useMemo, useState } from 'react';
import ActivityCard from '../components/home/ActivityCard';
import Pagination from '../components/Pagination';
import type { Activity, PaginatedResponse } from '../types/api';
import '../styles/pages.scss';

function parseActivities(raw: unknown): { data: Activity[]; totalPages: number } {
  if (Array.isArray(raw)) return { data: raw as Activity[], totalPages: 1 };
  const p = raw as PaginatedResponse<Activity>;
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
            <div className="skeleton-card__line skeleton-card__line--full" />
            <div className="skeleton-card__line skeleton-card__line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/activities?limit=12&page=${page}`)
      .then((r) => r.json())
      .then((raw: unknown) => {
        const parsed = parseActivities(raw);
        setActivities(parsed.data);
        setTotalPages(parsed.totalPages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = useMemo(
    () =>
      search.trim() === ''
        ? activities
        : activities.filter((a) => a.title.toLowerCase().includes(search.toLowerCase())),
    [activities, search],
  );

  return (
    <div className="page-wrapper">
      <div className="list-page__header">
        <h1 className="list-page__title">LES ÉPREUVES DE LA ZONE</h1>

        <div className="search-input">
          <input
            type="search"
            placeholder="Rechercher une épreuve…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="list-page__content">
        {loading && <SkeletonGrid />}
        {error && <p className="list-page__error">Les épreuves ne sont pas disponibles pour le moment.</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="list-page__empty">Aucune épreuve ne correspond à votre recherche.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="list-page__grid">
              {filtered.map((a, i) => (
                <ActivityCard key={a.id} activity={a} index={i} />
              ))}
            </div>
            {search.trim() === '' && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}
