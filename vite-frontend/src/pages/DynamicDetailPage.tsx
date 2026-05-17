import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ActivityDetailPage from './ActivityDetailPage';
import CategoryDetailPage from './CategoryDetailPage';
import NotFoundPage from './NotFoundPage';
import SessionDetailPage from './SessionDetailPage';

type RouteType = 'session' | 'activity' | 'category' | 'not-found' | 'loading';

function isSessionSlug(slug: string): boolean {
  const parts = slug.split('-');
  if (parts.length < 2) return false;
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last);
}

export default function DynamicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [routeType, setRouteType] = useState<RouteType>('loading');

  useEffect(() => {
    if (!slug) {
      setRouteType('not-found');
      return;
    }

    if (isSessionSlug(slug)) {
      setRouteType('session');
      return;
    }

    // Try activity first, then category
    fetch(`/api/activities/${slug}`)
      .then((r) => {
        if (r.ok) {
          setRouteType('activity');
          return;
        }
        return fetch(`/api/categories/${slug}`).then((r2) => {
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

  if (routeType === 'session') return <SessionDetailPage />;
  if (routeType === 'activity') return <ActivityDetailPage />;
  if (routeType === 'category') return <CategoryDetailPage />;
  return <NotFoundPage />;
}
