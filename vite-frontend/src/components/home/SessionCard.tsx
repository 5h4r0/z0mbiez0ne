import { Link } from 'react-router';
import type { Session } from '../../types/api';

interface Props {
  session: Session;
  index: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
}

export default function SessionCard({ session }: Props) {
  const imgSrc = `https://placehold.co/400x250/141414/888?text=Session+${session.id}`;
  const title = session.activity?.title ?? 'Session';
  const slug = session.activity?.slug;
  const href = slug ? `/${slug}-${session.id}` : `/sessions/${session.id}`;
  const price = Number.parseFloat(session.unit_price).toFixed(2);

  return (
    <article
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)';
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={imgSrc}
          alt={title}
          style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
        />
        <span
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'var(--color-text)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {formatDate(session.date)}
        </span>
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'var(--color-red)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {formatTime(session.date)}
        </span>
      </div>

      <div style={{ padding: '16px' }}>
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-text)',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </h3>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          {session.capacity} places disponibles
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-red)', fontWeight: 700, fontSize: '1.1rem' }}>€{price}</span>
          <Link
            to={href}
            style={{
              backgroundColor: 'var(--color-red)',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
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
            Réserver
          </Link>
        </div>
      </div>
    </article>
  );
}
