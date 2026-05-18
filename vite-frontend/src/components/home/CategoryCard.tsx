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
  const imgSrc = category.image_filename
    ? `/images/thumbs/${category.image_filename}`
    : `https://placehold.co/400x250/141414/888?text=${encodeURIComponent(category.title)}`;
  const Icon = resolveIcon(category.title);

  return (
    <Link to={`/${category.slug}`} className="block no-underline" aria-label={`Voir la catégorie ${category.title}`}>
      <article className="bg-(--color-surface) border border-(--color-border) rounded-lg overflow-hidden flex flex-col transition-colors duration-200 hover:bg-(--color-surface-hover) cursor-pointer">
        <div className="relative">
          <img src={imgSrc} alt={category.title} className="w-full h-40 object-cover block" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
            <Icon size={36} color="#fff" />
            <span className="font-bold text-white text-base uppercase tracking-wider">{category.title}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-[0.82rem] text-(--color-text-muted) mb-3 flex-1 line-clamp-2">{category.description}</p>

          <span className="border border-(--color-text) hover:border-(--color-red) text-(--color-text) hover:text-(--color-red) px-4 py-1.5 rounded text-[0.8rem] font-semibold tracking-wider uppercase text-center transition-colors duration-200">
            Voir la catégorie
          </span>
        </div>
      </article>
    </Link>
  );
}
