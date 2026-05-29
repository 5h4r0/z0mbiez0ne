// vite-frontend/src/components/manage/ManageLayout.tsx
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import './manage.css';

const NAV_LINKS = [
  { to: '/manage', label: 'Hub', end: true },
  { to: '/manage/activities', label: 'Activités' },
  { to: '/manage/categories', label: 'Catégories' },
  { to: '/manage/sessions', label: 'Sessions' },
  { to: '/manage/orders', label: 'Commandes' },
  { to: '/manage/users', label: 'Utilisateurs' },
];

export default function ManageLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await useAuthStore.getState().logout();
    navigate('/manage/login', { replace: true });
  }

  return (
    <div className="manage-shell">
      <aside className="manage-sidebar">
        <div className="manage-sidebar__brand">BACKOFFICE</div>
        <nav className="manage-sidebar__nav">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `manage-sidebar__link${isActive ? ' manage-sidebar__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="manage-sidebar__logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </aside>
      <main className="manage-content">
        <Outlet />
      </main>
    </div>
  );
}
