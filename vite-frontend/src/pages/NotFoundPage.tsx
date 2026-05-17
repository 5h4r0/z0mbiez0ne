import { Link } from 'react-router';
import '../styles/pages.scss';

export default function NotFoundPage() {
  return (
    <div
      style={{
        paddingTop: '64px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 24px',
      }}
    >
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          8%        { opacity: 0.85; }
          9%        { opacity: 1; }
          42%       { opacity: 1; }
          43%       { opacity: 0.7; }
          44%       { opacity: 1; }
          70%       { opacity: 1; }
          71%       { opacity: 0.8; }
          72%       { opacity: 1; }
        }
        .notfound-404 { animation: flicker 4s infinite; }
      `}</style>

      <p
        className="notfound-404"
        style={{
          fontFamily: "'bebas-neue-regular', serif",
          fontWeight: 900,
          fontSize: 'clamp(6rem, 20vw, 14rem)',
          color: 'var(--color-red)',
          lineHeight: 1,
          marginBottom: '16px',
          userSelect: 'none',
        }}
      >
        404
      </p>

      <p
        style={{
          fontFamily: "'bebas-neue-regular', serif",
          fontWeight: 700,
          fontSize: 'clamp(1rem, 3vw, 1.4rem)',
          color: 'var(--color-text)',
          marginBottom: '12px',
          letterSpacing: '0.05em',
        }}
      >
        Zone introuvable
      </p>

      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '1rem',
          fontStyle: 'italic',
          marginBottom: '40px',
          maxWidth: '400px',
        }}
      >
        Cette page a été dévorée par les zombies.
      </p>

      <Link
        to="/"
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
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-red-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-red)';
        }}
      >
        Retourner à l'accueil
      </Link>
    </div>
  );
}
