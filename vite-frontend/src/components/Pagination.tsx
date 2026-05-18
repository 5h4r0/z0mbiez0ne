import { Link } from 'react-router';

interface Props {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      {page === 1 ? (
        <span className="pagination__btn pagination__btn--disabled">← Précédent</span>
      ) : (
        <Link className="pagination__btn" to={buildHref(page - 1)}>← Précédent</Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
          to={buildHref(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Link>
      ))}

      {page === totalPages ? (
        <span className="pagination__btn pagination__btn--disabled">Suivant →</span>
      ) : (
        <Link className="pagination__btn" to={buildHref(page + 1)}>Suivant →</Link>
      )}
    </nav>
  );
}
