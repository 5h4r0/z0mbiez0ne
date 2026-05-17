import type { LucideIcon } from 'lucide-react';
import { Biohazard, Brain, Drama, Flame, Ghost, Lock, Shield, Skull, Swords, Theater, Zap } from 'lucide-react';
import { Link } from 'react-router';
import type { Category } from '../../types/api';

interface Props {
  category: Category;
}

const ICON_MAP: Record<string, LucideIcon> = {
  survival: Shield,
  spectacle: Theater,
  horreur: Skull,
  escape: Lock,
  zombies: Brain,
  combat: Swords,
  feu: Flame,
  électrique: Zap,
  fantôme: Ghost,
  bio: Biohazard,
  drama: Drama,
};

function resolveIcon(title: string): LucideIcon {
  const key = title.toLowerCase();
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return Icon;
  }
  return Skull;
}

export default function CategoryCard({ category }: Props) {
  const imgSrc = `https://placehold.co/400x250/141414/888?text=${encodeURIComponent(category.title)}`;
  const Icon = resolveIcon(category.title);

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
      <div style={{ position: 'relative' }}>
        <img
          src={imgSrc}
          alt={category.title}
          style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Icon size={36} color="#fff" />
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#fff',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {category.title}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          {category.description}
        </p>

        <Link
          to={`/${category.slug}`}
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
            textAlign: 'center',
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
          Voir la catégorie
        </Link>
      </div>
    </article>
  );
}
