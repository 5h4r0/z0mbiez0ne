import { Clock } from 'lucide-react';
import { Link } from 'react-router';
import type { Activity } from '../../types/api';

interface Props {
  activity: Activity;
  index: number;
}

export default function ActivityCard({ activity }: Props) {
  const imgSrc = `https://placehold.co/400x250/141414/888?text=${encodeURIComponent(activity.title)}`;

  return (
    <article
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)';
      }}
    >
      <img
        src={imgSrc}
        alt={activity.title}
        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
      />

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-text)',
            marginBottom: '8px',
          }}
        >
          {activity.title}
        </h3>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
            marginBottom: '12px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {activity.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <Clock size={14} />
            20 min.
          </span>
          <Link
            to={`/${activity.slug}`}
            style={{
              border: '1px solid var(--color-text)',
              color: 'var(--color-text)',
              padding: '6px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--color-red)';
              el.style.color = 'var(--color-red)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = 'var(--color-text)';
              el.style.color = 'var(--color-text)';
            }}
          >
            Découvrir
          </Link>
        </div>
      </div>
    </article>
  );
}
