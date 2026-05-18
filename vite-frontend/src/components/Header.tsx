import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useBasketStore } from '../store/basketStore';

const NAV_LINKS = [
  { label: 'Activités', to: '/les-epreuves' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'Catégories', to: '/categories-epreuves' },
  { label: 'Contact', to: '/contact' },
];

function ZombieLogo() {
  return (
    <Link to="/" className="no-underline">
      <span className="font-['bebas-neue-regular',sans-serif] font-bold text-2xl text-(--color-gold) tracking-[0.01em] whitespace-nowrap">
        the <span className="text-(--color-red)">zØmbie</span> zØne
      </span>
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useBasketStore((s) => s.totalItems());

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-100 bg-[rgba(10,10,10,0.95)] backdrop-blur-sm border-b border-(--color-border)">
      <div className="max-w-350 mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <ZombieLogo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
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

          <NavLink
            to="/espace-client"
            className={({ isActive }) =>
              `text-[0.8rem] font-semibold tracking-[0.04em] px-4 py-1.5 rounded no-underline border-none transition-colors duration-200 text-white ${
                isActive ? 'bg-(--color-red-hover)' : 'bg-(--color-red)'
              }`
            }
          >
            Mon compte
          </NavLink>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="block md:hidden bg-transparent border-none cursor-pointer text-(--color-text) p-1"
        >
          <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="bg-[rgba(10,10,10,0.98)] border-t border-(--color-border) px-6 py-4 flex flex-col gap-4"
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
          <NavLink
            to="/espace-client"
            onClick={() => setMenuOpen(false)}
            className="text-(--color-red) no-underline font-semibold"
          >
            Mon compte
          </NavLink>
        </nav>
      )}
    </header>
  );
}
