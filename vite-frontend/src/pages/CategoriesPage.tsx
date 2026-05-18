import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import CategoryCard from '../components/home/CategoryCard';
import Pagination from '../components/Pagination';
import SkeletonGrid from '../components/SkeletonGrid';
import { useFetch } from '../hooks/useFetch';
import '../styles/pages.scss';
import { type Category, parsePaginated } from '../types/api';

export default function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const { data: raw, loading, error } = useFetch<unknown>(`/api/categories?limit=12&page=${page}`);

  const { data: categories, totalPages } = useMemo(
    () => (raw !== null ? parsePaginated<Category>(raw) : { data: [], totalPages: 1 }),
    [raw],
  );

  return (
    <div className="page-wrapper">
      <div className="list-page__header">
        <h1 className="list-page__title">EXPLOREZ NOS CATÉGORIES</h1>
      </div>

      <div className="list-page__content">
        {loading && <SkeletonGrid />}
        {error && <p className="list-page__error">Les catégories ne sont pas disponibles pour le moment.</p>}

        {!loading && !error && categories.length === 0 && (
          <p className="list-page__empty">Aucune catégorie disponible pour le moment.</p>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
            <div className="list-page__grid">
              {categories.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} buildHref={(p) => `?page=${p}`} />
          </>
        )}
      </div>
    </div>
  );
}
