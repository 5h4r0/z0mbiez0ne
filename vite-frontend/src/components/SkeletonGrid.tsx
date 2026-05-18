interface Props {
  count?: number;
  gridClass?: string;
}

export default function SkeletonGrid({ count = 8, gridClass = 'list-page__grid' }: Props) {
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
        <div key={i} className="skeleton-card">
          <div className="skeleton-card__img" />
          <div className="skeleton-card__body">
            <div className="skeleton-card__line skeleton-card__line--medium" />
            <div className="skeleton-card__line skeleton-card__line--full" />
            <div className="skeleton-card__line skeleton-card__line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}
