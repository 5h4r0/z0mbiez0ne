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
    fetch(`/api/categories/${categorySlug}`)
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

  if (error || !category) {
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
          Cette catégorie n'existe pas ou a été dévorée.
        </p>
        <Link to="/categories-epreuves" style={{ color: 'var(--color-red)', textDecoration: 'none' }}>
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
        <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--color-text-muted)', marginBottom: '48px' }}>
          {category.description}
        </p>

        <h2
          style={{
            fontFamily: "'bebas-neue-regular', serif",
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--color-text)',
            letterSpacing: '0.08em',
            marginBottom: '32px',
          }}
        >
          LES ÉPREUVES DE CETTE CATÉGORIE
        </h2>

        {activitiesLoading && (
          <div className="list-page__grid" style={{ marginBottom: 0 }}>
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
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Aucune épreuve dans cette catégorie.</p>
        )}

        {!activitiesLoading && activities.length > 0 && (
          <div className="list-page__grid" style={{ marginBottom: 0 }}>
            {activities.map((a, i) => (
              <ActivityCard key={a.id} activity={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
