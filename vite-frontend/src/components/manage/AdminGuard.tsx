// vite-frontend/src/components/manage/AdminGuard.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { ROLE_IDS } from '../../lib/roles';
import { apiFetch, useAuthStore } from '../../store/authStore';

export default function AdminGuard() {
  const { isHydrating } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Call réseau au montage — protège contre le bfcache
    apiFetch('/api/auth/profile')
      .then(async (r) => {
        if (!r.ok) { setIsAdmin(false); return; }
        const data = (await r.json()) as { role_id: number };
        setIsAdmin(data.role_id === ROLE_IDS.admin);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  if (isHydrating || checking) {
    return <div className="manage-loading">Vérification des droits…</div>;
  }

  if (!isAdmin) return <Navigate to="/manage/login" replace />;

  return <Outlet />;
}
