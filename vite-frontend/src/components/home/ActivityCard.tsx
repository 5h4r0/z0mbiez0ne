import { Clock } from 'lucide-react';
import { Link } from 'react-router';
import type { Activity } from '../../types/api';

interface Props {
  activity: Activity;
  index: number;
}

export default function ActivityCard({ activity }: Props) {
  const imgSrc = activity.image_filename
    ? `/images/thumbs/${activity.image_filename}`
    : `https://placehold.co/400x250/141414/888?text=${encodeURIComponent(activity.title)}`;

  return (
    <Link to={`/${activity.slug}`} className="block no-underline" aria-label={`Découvrir l'activité ${activity.title}`}>
      <article className="bg-(--color-surface) border border-(--color-border) rounded-lg overflow-hidden flex flex-col transition-colors duration-200 hover:bg-(--color-surface-hover) cursor-pointer">
        <img src={imgSrc} alt={activity.title} className="w-full h-40 object-cover block" />

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-base text-(--color-text) mb-2">{activity.title}</h3>

          <p className="text-[0.82rem] text-(--color-text-muted) mb-3 flex-1 line-clamp-2">{activity.description.replace(/<[^>]*>/g, '')}</p>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-[0.8rem] text-(--color-text-muted)">
              <Clock size={14} />
              20 min.
            </span>
            <span className="border border-(--color-text) hover:border-(--color-red) text-(--color-text) hover:text-(--color-red) px-4 py-1.5 rounded text-[0.8rem] font-semibold tracking-wider uppercase transition-colors duration-200">
              Découvrir
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
