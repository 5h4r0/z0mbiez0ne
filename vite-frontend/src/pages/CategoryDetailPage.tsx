import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import ActivityCard from '../components/home/ActivityCard';
import type { Activity, Category, PaginatedResponse } from '../types/api';
import '../styles/pages.scss';

export default function CategoryDetailPage() {
  const params = useParams<{ categorySlug?: string; slug?: string }>();
  const categorySlug = params.categorySlug ?? params.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);
    setError(false);
    fetch(`/api/categories/by-slug/${categorySlug}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: unknown) => setCategory(data as Category))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) return;
    setActivitiesLoading(true);
    fetch(`/api/activities?category_slug=${categorySlug}&limit=12`)
      .then((r) => r.json())
      .then((raw: unknown) => {
        const rows = Array.isArray(raw) ? raw : ((raw as PaginatedResponse<Activity>).data ?? []);
        setActivities(rows as Activity[]);
      })
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, [categorySlug]);

  const imgUrl = category?.image_filename
    ? `/images/${category.image_filename}`
    : `https://placehold.co/1400x600/141414/888?text=${encodeURIComponent(category?.title ?? '')}`;

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

  if (error || !category) {
    return (
      <div className="page-wrapper flex flex-col items-center justify-center min-h-[80vh]">
        <p className="text-(--color-text-muted) mb-6">Cette catégorie n'existe pas ou a été dévorée.</p>
        <Link to="/categories-epreuves" className="text-(--color-red) no-underline">
          ← Toutes les catégories
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="detail-hero">
        <div className="detail-hero__bg" style={{ backgroundImage: `url('${imgUrl}')` }} />
        <div className="detail-hero__content">
          <Link to="/categories-epreuves" className="detail-hero__back">
            ← Toutes les catégories
          </Link>
          <h1 className="detail-hero__title">{category.title}</h1>
        </div>
      </div>

      <div className="detail-body">
        <p className="text-base leading-7 text-(--color-text-muted) mb-12">{category.description}</p>

        <h2 className="font-['bebas-neue-regular',sans-serif] font-bold text-[1.1rem] text-(--color-text) tracking-widest mb-8">
          LES ÉPREUVES DE CETTE CATÉGORIE
        </h2>

        {activitiesLoading && (
          <div className="list-page__grid mb-0">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="skeleton-card">
                <div className="skeleton-card__img" />
                <div className="skeleton-card__body">
                  <div className="skeleton-card__line skeleton-card__line--medium" />
                  <div className="skeleton-card__line skeleton-card__line--full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!activitiesLoading && activities.length === 0 && (
          <p className="text-(--color-text-muted) text-sm">Aucune épreuve dans cette catégorie.</p>
        )}

        {!activitiesLoading && activities.length > 0 && (
          <div className="list-page__grid mb-0">
            {activities.map((a, i) => (
              <ActivityCard key={a.id} activity={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
