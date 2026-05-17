import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';

const NAV_LINKS = [
  { label: 'Activités', to: '/les-epreuves' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'Catégories', to: '/categories-epreuves' },
  { label: 'Contact', to: '/contact' },
];

function ZombieLogo() {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <span
        style={{
          fontFamily: "'bebas-neue-regular', serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--color-gold)',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        The <span style={{ color: 'var(--color-red)' }}>zØmbie</span> zØne
      </span>
    </Link>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.04em',
  padding: '4px 0',
  borderBottom: '2px solid transparent',
  transition: 'color 0.2s, border-color 0.2s',
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <ZombieLogo />

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} aria-label="Navigation principale">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...navLinkStyle,
                color: isActive ? 'var(--color-red)' : 'var(--color-text)',
                borderBottomColor: isActive ? 'var(--color-red)' : 'transparent',
              })}
            >
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/panier"
            style={({ isActive }) => ({
              ...navLinkStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isActive ? 'var(--color-red)' : 'var(--color-text)',
            })}
          >
            <ShoppingCart size={18} />
            <span
              style={{
                backgroundColor: 'var(--color-red)',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0 5px',
                minWidth: '16px',
                textAlign: 'center',
              }}
            >
              0
            </span>
          </NavLink>

          <NavLink
            to="/espace-client"
            style={({ isActive }) => ({
              ...navLinkStyle,
              backgroundColor: isActive ? 'var(--color-red-hover)' : 'var(--color-red)',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '4px',
              borderBottom: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
            })}
          >
            Mon compte
          </NavLink>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text)',
            padding: '4px',
          }}
          className="header-hamburger"
        >
          <span style={{ fontSize: '1.5rem' }}>{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          style={{
            backgroundColor: 'rgba(10,10,10,0.98)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          aria-label="Menu mobile"
        >
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-red)' : 'var(--color-text)',
                textDecoration: 'none',
                fontWeight: 500,
              })}
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/espace-client"
            onClick={() => setMenuOpen(false)}
            style={{ color: 'var(--color-red)', textDecoration: 'none', fontWeight: 600 }}
          >
            Mon compte
          </NavLink>
        </nav>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-hamburger { display: block !important; }
          header nav:first-of-type { display: none !important; }
        }
      `}</style>
    </header>
  );
}
