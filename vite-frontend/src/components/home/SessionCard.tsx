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
  const imgSrc = session.activity?.image_filename
    ? `/images/thumbs/${session.activity.image_filename}`
    : `https://placehold.co/400x250/141414/888?text=Session+${session.id}`;
  const title = session.activity?.title ?? 'Session';
  const href = `/sessions/${session.id}`;
  const price = Number.parseFloat(session.unit_price).toFixed(2);

  return (
    <Link to={href} className="block no-underline">
      <article className="bg-(--color-surface) border border-(--color-border) rounded-lg overflow-hidden transition-colors duration-200 hover:bg-(--color-surface-hover) cursor-pointer">
        <div className="relative">
          <img src={imgSrc} alt={title} className="w-full h-40 object-cover block" />
          <span className="absolute top-2 left-2 bg-black/80 text-(--color-text) px-2 py-0.5 rounded text-xs font-semibold capitalize">
            {formatDate(session.date)}
          </span>
          <span className="absolute top-2 right-2 bg-(--color-red) text-white px-2 py-0.5 rounded text-xs font-semibold">
            {formatTime(session.date)}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-base text-(--color-text) mb-2 truncate">{title}</h3>

          <p className="text-[0.8rem] text-(--color-text-muted) mb-3">{session.capacity} places disponibles</p>

          <div className="flex justify-between items-center">
            <span className="text-(--color-red) font-bold text-[1.1rem]">€{price}</span>
            <span className="bg-(--color-red) hover:bg-(--color-red-hover) text-white px-4 py-1.5 rounded text-[0.8rem] font-semibold tracking-wider uppercase transition-colors duration-200">
              Réserver
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
