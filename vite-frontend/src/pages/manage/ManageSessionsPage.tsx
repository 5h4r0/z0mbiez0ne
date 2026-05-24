// vite-frontend/src/pages/manage/ManageSessionsPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import ConfirmModal from '../../components/manage/ConfirmModal';
import ManagePagination from '../../components/manage/ManagePagination';
import ManageTable, { type Column } from '../../components/manage/ManageTable';
import '../../components/manage/manage.css';
import { apiFetch } from '../../store/authStore';
import { type ManageSession, manageSessionSchema } from '../../types/manage';

const listSchema = z.object({
  data: z.array(manageSessionSchema),
  totalPages: z.number().optional(),
});

// Shape minimale de GET /api/sessions/:id pour la vérification des réservations actives
const sessionDetailSchema = z.object({
  data: z.object({
    capacity: z.number(),
    available_capacity: z.number(),
  }),
});

const STATUS_LABEL: Record<string, string> = {
  Scheduled: 'Planifiée',
  Cancelled: 'Annulée',
  Completed: 'Terminée',
};

export default function ManageSessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [items, setItems] = useState<ManageSession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<ManageSession | null>(null);
  const [blockError, setBlockError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch(`/api/sessions?page=${page}&limit=20`)
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

  async function handleDeleteClick(session: ManageSession) {
    setBlockError('');
    const r = await apiFetch(`/api/sessions/${session.id}`);
    if (r.ok) {
      const raw = await r.json();
      const parsed = sessionDetailSchema.safeParse(raw);
      if (parsed.success && parsed.data.data.available_capacity < parsed.data.data.capacity) {
        setBlockError('Impossible de supprimer — des réservations actives sont liées à cette session.');
        return;
      }
    }
    setToDelete(session);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await apiFetch(`/api/sessions/${toDelete.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((s) => s.id !== toDelete.id));
    setToDelete(null);
  }

  const columns: Column<ManageSession>[] = [
    {
      header: 'Date',
      render: (row) => new Date(row.date_iso).toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    },
    { header: 'Activité', render: (row) => row.activity?.title ?? `#${row.activity_id}` },
    { header: 'Capacité', accessor: 'capacity' },
    { header: 'Dispo', accessor: 'available_capacity' },
    { header: 'Prix', render: (row) => `${row.unit_price} €` },
    { header: 'Statut', render: (row) => STATUS_LABEL[row.status] ?? row.status },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Sessions</h1>
        <button type="button" className="manage-btn manage-btn--primary">+ Nouveau</button>
      </div>

      {blockError && <div className="manage-error" style={{ marginBottom: '1rem' }}>{blockError}</div>}
      {loading && <div className="manage-empty">Chargement…</div>}
      {error && <div className="manage-error">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="manage-empty">Aucune session.</div>}
      {!loading && !error && items.length > 0 && (
        <>
          <ManageTable
            columns={columns}
            data={items}
            onEdit={() => {}}
            onDelete={handleDeleteClick}
            rowClassName={(row) => row.status === 'Scheduled' ? 'manage-text-success' : ''}
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
        title="Supprimer la session"
        message={`Supprimer la session du ${toDelete ? new Date(toDelete.date_iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} ?`}
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
