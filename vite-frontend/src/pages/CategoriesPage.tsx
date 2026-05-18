import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import CategoryCard from '../components/home/CategoryCard';
import Pagination from '../components/Pagination';
import type { Category, PaginatedResponse } from '../types/api';
import '../styles/pages.scss';

function parseCategories(raw: unknown): { data: Category[]; totalPages: number } {
  if (Array.isArray(raw)) return { data: raw as Category[], totalPages: 1 };
  const p = raw as PaginatedResponse<Category>;
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

export default function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/categories?limit=12&page=${page}`)
      .then((r) => r.json())
      .then((raw: unknown) => {
        const parsed = parseCategories(raw);
        setCategories(parsed.data);
        setTotalPages(parsed.totalPages);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

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
