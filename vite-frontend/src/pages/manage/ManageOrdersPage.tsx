// vite-frontend/src/pages/manage/ManageOrdersPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import ManagePagination from '../../components/manage/ManagePagination';
import ManageTable, { type Column } from '../../components/manage/ManageTable';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { apiFetch } from '../../store/authStore';
import { type ManageOrder, manageOrderSchema, type OrderStatus } from '../../types/manage';

const listSchema = z.object({
  data: z.array(manageOrderSchema),
  totalPages: z.number().optional(),
});

const STATUS_LABEL: Record<string, string> = {
  Pending: 'En attente',
  Confirmed: 'Confirmée',
  Cancelled: 'Annulée',
  Refunded: 'Remboursée',
};

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  Pending:   ['Confirmed', 'Cancelled'],
  Confirmed: ['Refunded'],
  Cancelled: [],
  Refunded:  [],
};

const STATUS_CLASS: Record<string, string> = {
  Confirmed: 'manage-text-success',
  Pending: 'manage-text-warning',
  Refunded: 'manage-text-danger',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [items, setItems] = useState<ManageOrder[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleStatusChange(orderId: number, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    const res = await apiFetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setItems(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      setError('Erreur lors de la mise à jour du statut.');
    }
    setUpdatingId(null);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiFetch(`/api/orders?page=${page}&limit=20`)
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

  const columns: Column<ManageOrder>[] = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Statut',
      render: (row) => {
        const transitions = VALID_TRANSITIONS[row.status] ?? [];
        if (transitions.length === 0) {
          return <span className={STATUS_CLASS[row.status] ?? ''}>{STATUS_LABEL[row.status] ?? row.status}</span>;
        }
        return (
          <select
            disabled={updatingId === row.id}
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value as OrderStatus)}
            className={STATUS_CLASS[row.status] ?? ''}
            style={{ width: 'fit-content', fontSize: 'inherit' }}
          >
            <option value={row.status} disabled>{STATUS_LABEL[row.status] ?? row.status}</option>
            {transitions.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        );
      },
      cellClassName: (row) => STATUS_CLASS[row.status] ?? '',
    },
    { header: 'Total', render: (row) => `€${Number(row.total_amount).toFixed(2)}` },
    { header: 'Client', render: (row) => `${row.lastname ?? ''} ${row.firstname ?? ''}`.trim() || '—' },
    { header: 'Paiement', render: (row) => row.payment_method ?? '—' },
    { header: 'Créée le', render: (row) => formatDate(row.created_at) },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Commandes</h1>
      </div>

      {loading && <div className="manage-empty">Chargement…</div>}
      {error && <div className="manage-error">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="manage-empty">Aucune commande.</div>}
      {!loading && !error && items.length > 0 && (
        <>
          <ManageTable columns={columns} data={items} />
          <ManagePagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setSearchParams({ page: String(page - 1) })}
            onNext={() => setSearchParams({ page: String(page + 1) })}
          />
        </>
      )}
    </div>
  );
}
