import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ActivityDetailPage from './ActivityDetailPage';
import CategoryDetailPage from './CategoryDetailPage';
import NotFoundPage from './NotFoundPage';

type RouteType = 'activity' | 'category' | 'not-found' | 'loading';

export default function DynamicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [routeType, setRouteType] = useState<RouteType>('loading');

  useEffect(() => {
    if (!slug) {
      setRouteType('not-found');
      return;
    }

    fetch(`/api/activities/by-slug/${slug}`)
      .then((r) => {
        if (r.ok) {
          setRouteType('activity');
          return;
        }
        if (r.status !== 404) {
          setRouteType('not-found');
          return;
        }
        fetch(`/api/categories/by-slug/${slug}`).then((r2) => {
          setRouteType(r2.ok ? 'category' : 'not-found');
        });
      })
      .catch(() => setRouteType('not-found'));
  }, [slug]);

  if (routeType === 'loading') {
    return (
      <div
        style={{
          paddingTop: '64px',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Chargement…</div>
      </div>
    );
  }

  if (routeType === 'activity') return <ActivityDetailPage />;
  if (routeType === 'category') return <CategoryDetailPage />;
  return <NotFoundPage />;
}
