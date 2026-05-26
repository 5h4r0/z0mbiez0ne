import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import CategoryTagPicker from '../../components/manage/CategoryTagPicker';
import ConfirmModal from '../../components/manage/ConfirmModal';
import ImageUploadHero from '../../components/manage/ImageUploadHero';
import ImageUploadThumb from '../../components/manage/ImageUploadThumb';
import TipTapEditor from '../../components/manage/TipTapEditor';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../store/authStore';
import { slugify } from '../../utils/slugify';

export default function ManageActivityFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { message: toastMsg, toast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [bannerFilename, setBannerFilename] = useState<string | null>(null);
  const [thumbFilename, setThumbFilename] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/activities/${id}`)
      .then(r => r.json())
      .then(d => {
        const a = d.data ?? d;
        setTitle(a.title ?? '');
        setSlug(a.slug ?? '');
        setSlugLocked(true);
        setDescription(a.description ?? '');
        setCategoryIds((a.categories ?? a.activities_categories ?? []).map((c: { id: number }) => c.id));
        setBannerFilename(a.image_filename ?? null);
        setThumbFilename(a.image_filename ?? null);
      });
  }, [id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Titre requis'); return; }
    if (categoryIds.length === 0) { setError('Au moins une catégorie requise'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        description,
        activities_categories: categoryIds,
        ...(bannerFilename ? { image_filename: bannerFilename } : {}),
      };
      const res = await apiFetch(
        isEdit ? `/api/activities/${id}` : '/api/activities',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Erreur serveur');
      }
      toast(isEdit ? 'Activité mise à jour' : 'Activité créée');
      setTimeout(() => navigate('/manage/activites'), 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await apiFetch(`/api/activities/${id}`, { method: 'DELETE' });
    navigate('/manage/activites');
  }

  return (
    <div className="manage-form">
      <div className="manage-page__header">
        <h1 className="manage-page__title">{isEdit ? 'Modifier l\'activité' : 'Nouvelle activité'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <ImageUploadHero
          currentFilename={bannerFilename}
          slug={slug || slugify(title)}
          onUploaded={f => { setBannerFilename(f); if (!thumbFilename) setThumbFilename(f); }}
        />

        <div className="manage-form__field">
          <label className="manage-form__label" htmlFor="act-title">Titre</label>
          <input
            id="act-title"
            className="manage-form__input"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (!slugLocked) setSlug(slugify(e.target.value));
            }}
            placeholder="Titre de l'activité"
          />
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label" htmlFor="act-slug">Slug</label>
          <input
            id="act-slug"
            className="manage-form__input"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugLocked(true); }}
            placeholder="slug-de-l-activite"
          />
          <span className="manage-form__hint">
            {slugLocked ? '✏️ personnalisé' : '🔗 synchronisé avec le titre'}
          </span>
        </div>

        <div className="manage-form__field">
          <span className="manage-form__label">Description</span>
          <TipTapEditor value={description} onChange={setDescription} maxLength={2000} />
        </div>

        <div className="manage-form__field">
          <span className="manage-form__label">Catégories</span>
          <CategoryTagPicker selected={categoryIds} onChange={setCategoryIds} />
        </div>

        <div className="manage-form__field" style={{ marginTop: 24 }}>
          <span className="manage-form__label">Miniature</span>
          <ImageUploadThumb
            currentFilename={thumbFilename}
            slug={slug || slugify(title)}
            onUploaded={setThumbFilename}
          />
        </div>

        {error && <p style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 12 }}>{error}</p>}

        <div className="manage-form__actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/manage/activites')}>Annuler</button>
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
        title="Supprimer l'activité"
        message={`Supprimer "${title}" ? Cette action est irréversible.`}
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
