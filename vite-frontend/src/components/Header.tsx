import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { useBasketStore } from '../store/basketStore';

const NAV_LINKS = [
  { label: 'Activités', to: '/les-epreuves' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'Catégories', to: '/categories-epreuves' },
  { label: 'Contact', to: '/contact' },
];

const BTN_RED = 'text-[0.8rem] font-semibold tracking-[0.04em] px-4 py-2 rounded no-underline border-none transition-colors duration-200 text-white bg-(--color-red)';

function ZombieLogo() {
  return (
    <Link to="/" className="no-underline">
      <img src="/images/zz_logo.webp" alt="z0mbie z0ne logo ;)" className="zzlogo" />
      {/* <span className="font-montserrat font-bold text-2xl text-(--color-gold) tracking-[0.01em] whitespace-nowrap">the <span className="text---color-red)">zØmbie</span> zØne</span> */}
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useBasketStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const isInsideDashboard = pathname.startsWith('/dashboard/');
  const isOnDashboard = pathname === '/dashboard';

  function DashboardLink({ onClick }: { onClick?: () => void }) {
    if (isInsideDashboard) {
      return <Link to="/dashboard" onClick={onClick} className={BTN_RED}>Compte</Link>;
    }
    if (isOnDashboard) {
      return (
        <Link
          to="/dashboard/settings"
          onClick={onClick}
          className="inline-flex items-center border border-(--color-border) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm no-underline transition-colors duration-200"
        >
          Paramètres
        </Link>
      );
    }
    return <Link to="/dashboard" onClick={onClick} className={BTN_RED}>Compte</Link>;
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-100 bg-[rgba(10,10,10,0.95)] backdrop-blur-sm border-b border-(--color-border)">
      <div className="max-w-350 mx-auto px-6 min-h-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <ZombieLogo />

        {/* Desktop nav */}
        <nav className="hidden nav:flex items-center gap-8" aria-label="Navigation principale">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-[0.04em] py-1 border-b-2 no-underline transition-colors duration-200 ${
                  isActive
                    ? 'text-(--color-red) border-(--color-red)'
                    : 'text-(--color-text) border-transparent hover:text-(--color-red)'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/panier"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium py-1 no-underline transition-colors duration-200 ${
                isActive ? 'text-(--color-red)' : 'text-(--color-text)'
              }`
            }
          >
            <ShoppingCart size={18} />
            <span className="bg-(--color-red) text-white rounded-full text-[0.65rem] font-bold px-1 min-w-4 text-center">
              {totalItems}
            </span>
          </NavLink>

          {user?.role_id === 2 && (
            <NavLink
              to="/manage"
              className={({ isActive }) =>
                `text-[0.75rem] font-bold tracking-[0.08em] px-3 py-2 rounded no-underline border transition-colors duration-200 uppercase ${
                  isActive ? 'border-(--color-red) text-(--color-red)' : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-red) hover:text-(--color-red)'
                }`
              }
            >
              Backoffice
            </NavLink>
          )}

          {!user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-[0.8rem] font-semibold tracking-[0.04em] px-4 py-2 rounded no-underline border-none transition-colors duration-200 text-white ${
                  isActive ? 'bg-(--color-red-hover)' : 'bg-(--color-red)'
                }`
              }
            >
              Compte
            </NavLink>
          )}

          {user && (
            <div className="mt-0 flex flex-wrap gap-3">
              <DashboardLink />
              <button
                type="button"
                onClick={async () => { await useAuthStore.getState().logout(); }}
                className="border border-(--color-border) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="block nav:hidden bg-transparent border-none cursor-pointer text-(--color-text) p-1"
        >
          <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="bg-[rgba(10,10,10,0.98)] border-t border-(--color-border) px-6 py-10 flex flex-col gap-4"
          aria-label="Menu mobile"
        >
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `no-underline font-medium ${isActive ? 'text-(--color-red)' : 'text-(--color-text)'}`
              }
            >
              {label}
            </NavLink>
          ))}
          {user?.role_id === 2 && (
            <NavLink
              to="/manage"
              onClick={() => setMenuOpen(false)}
              className="text-(--color-text-muted) no-underline font-bold uppercase text-xs tracking-widest"
            >
              Backoffice
            </NavLink>
          )}
          {!user && (
            <NavLink
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-(--color-red) no-underline font-semibold"
            >
              Mon compte
            </NavLink>
          )}

          {user && (
            <div className="flex flex-col gap-3 items-start">
              <DashboardLink onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                onClick={async () => { await useAuthStore.getState().logout(); }}
                className="border border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
