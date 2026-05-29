// vite-frontend/src/pages/manage/ManageUsersPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import ManagePagination from '../../components/manage/ManagePagination';
import ManageTable, { type Column } from '../../components/manage/ManageTable';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { apiFetch } from '../../store/authStore';
import { type ManageUser, manageUserSchema } from '../../types/manage';

const listSchema = z.object({
  data: z.array(manageUserSchema),
  totalPages: z.number().optional(),
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ManageUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const search = searchParams.get('search') ?? '';

  const [items, setItems] = useState<ManageUser[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next: Record<string, string> = { page: '1' };
      if (value.trim()) next.search = value.trim();
      setSearchParams(next);
    }, 300);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) qs.set('search', search);
    apiFetch(`/api/users?${qs}`)
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
  }, [page, search]);

  const columns: Column<ManageUser>[] = [
    { header: 'Prénom', accessor: 'firstname' },
    { header: 'Nom', accessor: 'lastname' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rôle', render: (row) => row.role ?? '—' },
    { header: 'Créé le', render: (row) => formatDate(row.created_at) },
    { header: 'Supprimé le', render: (row) => row.deleted_at ? formatDate(row.deleted_at) : '—' },
  ];

  return (
    <div>
      <div className="manage-page__header">
        <h1 className="manage-page__title">Utilisateurs</h1>
        <input
          className="manage-form__input"
          style={{ maxWidth: 320 }}
          type="search"
          placeholder="Rechercher nom, prénom, email…"
          value={inputValue}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {loading && <div className="manage-empty">Chargement…</div>}
      {error && <div className="manage-error">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="manage-empty">Aucun utilisateur.</div>}
      {!loading && !error && items.length > 0 && (
        <>
          <ManageTable columns={columns} data={items} />
          <ManagePagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setSearchParams(search ? { page: String(page - 1), search } : { page: String(page - 1) })}
            onNext={() => setSearchParams(search ? { page: String(page + 1), search } : { page: String(page + 1) })}
          />
        </>
      )}
    </div>
  );
}
