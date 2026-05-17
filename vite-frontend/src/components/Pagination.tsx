interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button type="button" className="pagination__btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        ← Précédent
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="pagination__btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant →
      </button>
    </div>
  );
}
