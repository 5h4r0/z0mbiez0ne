// vite-frontend/src/pages/manage/ManageActivitiesPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';
import ConfirmModal from '../../components/manage/ConfirmModal';
import ManagePagination from '../../components/manage/ManagePagination';
import ManageTable, { type Column } from '../../components/manage/ManageTable';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { apiFetch } from '../../store/authStore';
import { type ManageActivity, manageActivitySchema } from '../../types/manage';

const listSchema = z.object({
  data: z.array(manageActivitySchema),
  totalPages: z.number().optional(),
});

export default function ManageActivitiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [items, setItems] = useState<ManageActivity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<ManageActivity | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch(`/api/activities?page=${page}&limit=20`)
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
    await apiFetch(`/api/activities/${toDelete.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((a) => a.id !== toDelete.id));
    setToDelete(null);
  }

  const columns: Column<ManageActivity>[] = [
    { header: 'Titre', accessor: 'title' },
    {
      header: 'Catégories',
      render: (row) =>
        row.categories && row.categories.length > 0
          ? [...row.categories].sort((a, b) => a.title.localeCompare(b.title, 'fr')).map((c) => c.title).join(' — ')
          : '—',
    },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Activités</h1>
        <button type="button" className="btn-primary" onClick={() => navigate('/manage/activites/nouvelle')}>+ Nouvelle activité</button>
      </div>

      {loading && <div className="manage-empty">Chargement…</div>}
      {error && <div className="manage-error">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="manage-empty">Aucune activité.</div>}
      {!loading && !error && items.length > 0 && (
        <>
          <ManageTable columns={columns} data={items} onEdit={(row) => navigate(`/manage/activites/${row.id}`)} onDelete={setToDelete} />
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
        title="Supprimer l'activité"
        message={`Supprimer "${toDelete?.title}" ?`}
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
