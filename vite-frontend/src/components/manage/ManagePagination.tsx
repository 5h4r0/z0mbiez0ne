// vite-frontend/src/components/manage/ManagePagination.tsx
import './manage.css';

interface Props {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function ManagePagination({ page, totalPages, onPrev, onNext }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="manage-pagination">
      <button type="button" className="manage-btn manage-btn--ghost" disabled={page <= 1} onClick={onPrev}>
        Précédent
      </button>
      <span className="manage-pagination__info">Page {page} / {totalPages}</span>
      <button type="button" className="manage-btn manage-btn--ghost" disabled={page >= totalPages} onClick={onNext}>
        Suivant
      </button>
    </div>
  );
}
