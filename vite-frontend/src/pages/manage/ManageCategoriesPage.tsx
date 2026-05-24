// vite-frontend/src/pages/manage/ManageCategoriesPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import ConfirmModal from '../../components/manage/ConfirmModal';
import ManagePagination from '../../components/manage/ManagePagination';
import ManageTable, { type Column } from '../../components/manage/ManageTable';
import '../../components/manage/manage.css';
import { apiFetch } from '../../store/authStore';
import { type ManageCategory, manageCategorySchema } from '../../types/manage';

const listSchema = z.object({
  data: z.array(manageCategorySchema),
  totalPages: z.number().optional(),
});

export default function ManageCategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [items, setItems] = useState<ManageCategory[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<ManageCategory | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch(`/api/categories?page=${page}&limit=20`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Erreur serveur');
        const raw = await r.json();
        const parsed = listSchema.safeParse(raw);
        if (!cancelled) {
          if (parsed.success) {
            setItems(parsed.data.data);
            setTotalPages(parsed.data.totalPages ?? 1);
          } else {
            setError('Réponse inattendue du serveur.');
          }
        }
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleteError('');
    const r = await apiFetch(`/api/categories/${toDelete.id}`, { method: 'DELETE' });
    if (!r.ok) {
      const data = await r.json() as { message?: string };
      setDeleteError(data.message ?? 'Erreur lors de la suppression.');
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== toDelete.id));
    setToDelete(null);
  }

  const columns: Column<ManageCategory>[] = [
    { header: 'Titre', accessor: 'title' },
    {
      header: 'Activités',
      render: (row) =>
        row.activities.length > 0
          ? [...row.activities].sort((a, b) => a.title.localeCompare(b.title, 'fr')).map((a) => a.title).join(' — ')
          : '—',
    },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Catégories</h1>
        <button type="button" className="manage-btn manage-btn--primary">+ Nouveau</button>
      </div>

      {loading && <div className="manage-empty">Chargement…</div>}
      {error && <div className="manage-error">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="manage-empty">Aucune catégorie.</div>}
      {!loading && !error && items.length > 0 && (
        <>
          <ManageTable
            columns={columns}
            data={items}
            onEdit={() => {}}
            onDelete={(row) => { setDeleteError(''); setToDelete(row); }}
          />
          <ManagePagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setSearchParams({ page: String(page - 1) })}
            onNext={() => setSearchParams({ page: String(page + 1) })}
          />
        </>
      )}

      <ConfirmModal
        isOpen={toDelete != null}
        title="Supprimer la catégorie"
        message={`Supprimer "${toDelete?.title}" ?`}
        danger
        error={deleteError}
        onCancel={() => { setToDelete(null); setDeleteError(''); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
