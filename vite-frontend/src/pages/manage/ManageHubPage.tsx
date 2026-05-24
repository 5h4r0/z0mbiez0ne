// vite-frontend/src/pages/manage/ManageHubPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { apiFetch } from '../../store/authStore';
import '../../components/manage/manage.css';

interface Stats {
  activities: number;
  categories: number;
  scheduledSessions: number;
  pendingOrders: number;
  users: number;
}

export default function ManageHubPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/activities').then((r) => r.ok ? r.json() : null),
      apiFetch('/api/categories').then((r) => r.ok ? r.json() : null),
      apiFetch('/api/sessions?status=Scheduled').then((r) => r.ok ? r.json() : null),
      apiFetch('/api/orders?status=Pending').then((r) => r.ok ? r.json() : null),
      apiFetch('/api/users').then((r) => r.ok ? r.json() : null),
    ]).then(([activities, categories, sessions, orders, users]) => {
      setStats({
        activities: activities?.total ?? activities?.data?.length ?? 0,
        categories: categories?.total ?? categories?.data?.length ?? 0,
        scheduledSessions: sessions?.total ?? sessions?.data?.length ?? 0,
        pendingOrders: orders?.total ?? orders?.data?.length ?? 0,
        users: users?.total ?? users?.data?.length ?? 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { to: '/manage/activities', label: 'Activités', count: stats?.activities },
    { to: '/manage/categories', label: 'Catégories', count: stats?.categories },
    { to: '/manage/sessions', label: 'Sessions planifiées', count: stats?.scheduledSessions },
    { to: '/manage/orders', label: 'Commandes en attente', count: stats?.pendingOrders },
    { to: '/manage/users', label: 'Utilisateurs', count: stats?.users },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Hub</h1>
      </div>

      <div className="manage-hub__grid">
        {cards.map(({ to, label, count }) => (
          <Link key={to} to={to} className="manage-hub__card">
            <div className="manage-hub__card-label">{label}</div>
            {count != null && (
              <div className="manage-hub__card-count">{count}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
