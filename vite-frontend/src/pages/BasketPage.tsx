import { Link } from 'react-router';
import '../styles/pages.scss';

export default function BasketPage() {
  const items: never[] = [];

  return (
    <div className="static-page">
      <div className="static-page__inner" style={{ maxWidth: '900px' }}>
        <h1 className="static-page__title">VOTRE PANIER</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            {/* Illustration SVG panier vide post-apo */}
            <svg
              viewBox="0 0 200 160"
              style={{ width: '180px', marginBottom: '32px', opacity: 0.6 }}
              aria-hidden="true"
            >
              <rect width="200" height="160" fill="none" />
              {/* Panier */}
              <path d="M60 70 L55 110 L145 110 L140 70 Z" fill="none" stroke="#444" strokeWidth="2" />
              <line x1="55" y1="70" x2="145" y2="70" stroke="#444" strokeWidth="2" />
              {/* Anse */}
              <path d="M80 70 Q100 45 120 70" fill="none" stroke="#444" strokeWidth="2" />
              {/* Croix vide */}
              <line x1="90" y1="82" x2="110" y2="102" stroke="#555" strokeWidth="1.5" />
              <line x1="110" y1="82" x2="90" y2="102" stroke="#555" strokeWidth="1.5" />
              {/* Déco post-apo */}
              <circle cx="40" cy="40" r="6" fill="none" stroke="#333" strokeWidth="1.5" />
              <line x1="25" y1="40" x2="55" y2="40" stroke="#333" strokeWidth="1.5" />
              <line x1="40" y1="25" x2="40" y2="55" stroke="#333" strokeWidth="1.5" />
              <circle cx="165" cy="130" r="5" fill="none" stroke="#333" strokeWidth="1.5" />
              <line x1="152" y1="130" x2="178" y2="130" stroke="#333" strokeWidth="1.5" />
              <line x1="165" y1="117" x2="165" y2="143" stroke="#333" strokeWidth="1.5" />
              <circle cx="170" cy="50" r="3" fill="#2a0a0a" />
              <circle cx="30" cy="120" r="2" fill="#2a0a0a" />
            </svg>

            <p
              style={{
                fontFamily: "'bebas-neue-regular', serif",
                fontSize: '1rem',
                color: 'var(--color-text)',
                marginBottom: '12px',
              }}
            >
              Votre panier est vide.
            </p>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                marginBottom: '32px',
              }}
            >
              Les zombies, eux, n'attendent pas.
            </p>
            <Link
              to="/sessions"
              style={{
                backgroundColor: 'var(--color-red)',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Voir les sessions
            </Link>
          </div>
        ) : (
          /* Layout prévu pour items — non affiché (panier toujours vide pour l'instant) */
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {items.map((_item, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  Item placeholder
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total : </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-red)' }}>€0.00</span>
              </div>
              <button
                type="button"
                style={{
                  backgroundColor: 'var(--color-red)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Commander
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
