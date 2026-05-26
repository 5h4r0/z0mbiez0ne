import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import ConfirmModal from '../../components/manage/ConfirmModal';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { apiFetch } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

interface Activity { id: number; title: string; }

const STATUS_LABELS: Record<string, string> = {
  Scheduled: 'Planifiée',
  Cancelled: 'Annulée',
  Completed: 'Terminée',
};

export default function ManageSessionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message: toastMsg, toast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState<string>(searchParams.get('activity_id') ?? '');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [status, setStatus] = useState<string>('Scheduled');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    apiFetch('/api/activities?limit=100')
      .then(r => r.json())
      .then(d => setActivities(Array.isArray(d) ? d : (d.data ?? [])));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then(d => {
        const s = d.data ?? d;
        setActivityId(String(s.activity_id ?? ''));
        // date_iso est l'ISO original, date est la string formatée
        const iso = s.date_iso ?? s.date ?? '';
        if (iso) {
          const dt = new Date(iso);
          const pad = (n: number) => String(n).padStart(2, '0');
          setDate(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
        }
        setCapacity(String(s.capacity ?? ''));
        setUnitPrice(String(s.unit_price ?? ''));
        setStatus(s.status ?? 'Scheduled');
      });
  }, [id, isEdit]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!activityId) errs.activityId = 'Activité requise';
    if (!date) errs.date = 'Date requise';
    const cap = Number(capacity);
    if (!capacity || isNaN(cap) || cap < 1) errs.capacity = 'Capacité min. 1';
    const price = Number(unitPrice);
    if (!unitPrice || isNaN(price) || price < 0) errs.unitPrice = 'Prix invalide';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setSaving(true);
    try {
      const payload = {
        activity_id: Number(activityId),
        date: new Date(date).toISOString(),
        capacity: Number(capacity),
        unit_price: Number(unitPrice),
        status,
      };
      const res = await apiFetch(
        isEdit ? `/api/sessions/${id}` : '/api/sessions',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Erreur serveur');
      }
      toast(isEdit ? 'Session mise à jour' : 'Session créée');
      setTimeout(() => navigate('/manage/sessions'), 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await apiFetch(`/api/sessions/${id}`, { method: 'DELETE' });
    navigate('/manage/sessions');
  }

  return (
    <div className="manage-form">
      <div className="manage-page__header">
        <h1 className="manage-page__title">{isEdit ? 'Modifier la session' : 'Nouvelle session'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="manage-form__field">
          <label className="manage-form__label">Activité</label>
          <select
            className={`manage-form__input${fieldErrors.activityId ? ' manage-form__input--error' : ''}`}
            value={activityId}
            onChange={e => setActivityId(e.target.value)}
          >
            <option value="">— choisir une activité —</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          {fieldErrors.activityId && <span className="manage-form__field-error">{fieldErrors.activityId}</span>}
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label">Date et heure</label>
          <input
            type="datetime-local"
            className={`manage-form__input${fieldErrors.date ? ' manage-form__input--error' : ''}`}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          {fieldErrors.date && <span className="manage-form__field-error">{fieldErrors.date}</span>}
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label">Capacité</label>
          <input
            type="number"
            min={1}
            className={`manage-form__input${fieldErrors.capacity ? ' manage-form__input--error' : ''}`}
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            placeholder="ex: 20"
          />
          {fieldErrors.capacity && <span className="manage-form__field-error">{fieldErrors.capacity}</span>}
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label">Prix unitaire (€)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={`manage-form__input${fieldErrors.unitPrice ? ' manage-form__input--error' : ''}`}
            value={unitPrice}
            onChange={e => setUnitPrice(e.target.value)}
            placeholder="ex: 29.90"
          />
          {fieldErrors.unitPrice && <span className="manage-form__field-error">{fieldErrors.unitPrice}</span>}
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label">Statut</label>
          <select
            className="manage-form__input"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 12 }}>{error}</p>}

        <div className="manage-form__actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/manage/sessions')}>Annuler</button>
          {isEdit && (
            <button type="button" className="btn-danger" onClick={() => setShowDelete(true)}>Supprimer</button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {toastMsg && <div className="manage-toast">{toastMsg}</div>}

      <ConfirmModal
        isOpen={showDelete}
        title="Supprimer la session"
        message="Supprimer cette session ? Cette action est irréversible."
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
