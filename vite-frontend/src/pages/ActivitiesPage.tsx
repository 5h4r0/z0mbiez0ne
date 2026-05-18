import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import ActivityCard from '../components/home/ActivityCard';
import Pagination from '../components/Pagination';
import SkeletonGrid from '../components/SkeletonGrid';
import { useFetch } from '../hooks/useFetch';
import '../styles/pages.scss';
import { type Activity, parsePaginated } from '../types/api';

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const [search, setSearch] = useState('');

  const { data: raw, loading, error } = useFetch<unknown>(`/api/activities?limit=12&page=${page}`);

  const { data: activities, totalPages } = useMemo(
    () => (raw !== null ? parsePaginated<Activity>(raw) : { data: [], totalPages: 1 }),
    [raw],
  );

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
            {search.trim() === '' && (
              <Pagination page={page} totalPages={totalPages} buildHref={(p) => `?page=${p}`} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
