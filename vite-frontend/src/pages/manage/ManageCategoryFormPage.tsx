import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ActivityTagPicker from '../../components/manage/ActivityTagPicker';
import ConfirmModal from '../../components/manage/ConfirmModal';
import ImageUploadHero from '../../components/manage/ImageUploadHero';
import ImageUploadThumb from '../../components/manage/ImageUploadThumb';
import TipTapEditor from '../../components/manage/TipTapEditor';
import '../../components/manage/manage.css';
import '../../styles/manage.scss';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../store/authStore';
import { slugify } from '../../utils/slugify';

export default function ManageCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { message: toastMsg, toast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(false);
  const [description, setDescription] = useState('');
  const [activityIds, setActivityIds] = useState<number[]>([]);
  const [bannerFilename, setBannerFilename] = useState<string | null>(null);
  const [thumbFilename, setThumbFilename] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/categories/${id}`)
      .then(r => r.json())
      .then(d => {
        const c = d.data ?? d;
        setTitle(c.title ?? '');
        setSlug(c.slug ?? '');
        setSlugLocked(true);
        setDescription(c.description ?? '');
        setActivityIds((c.activities ?? []).map((a: { id: number }) => a.id));
        setBannerFilename(c.image_filename ?? null);
        setThumbFilename(c.image_filename ?? null);
      });
  }, [id, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Titre requis'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        activities_ids: activityIds,
        ...(bannerFilename ? { image_filename: bannerFilename } : {}),
      };
      const res = await apiFetch(
        isEdit ? `/api/categories/${id}` : '/api/categories',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Erreur serveur');
      }
      toast(isEdit ? 'Catégorie mise à jour' : 'Catégorie créée');
      setTimeout(() => navigate('/manage/categories'), 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
    navigate('/manage/categories');
  }

  const slugForUpload = slug || slugify(title);

  return (
    <div className="manage-form">
      <div className="manage-page__header">
        <h1 className="manage-page__title">{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <ImageUploadHero
          currentFilename={bannerFilename}
          slug={`category-${slugForUpload}`}
          onUploaded={f => { setBannerFilename(f); if (!thumbFilename) setThumbFilename(f); }}
        />

        <div className="manage-form__field">
          <label className="manage-form__label" htmlFor="cat-title">Titre</label>
          <input
            id="cat-title"
            className="manage-form__input"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (!slugLocked) setSlug(slugify(e.target.value));
            }}
            placeholder="Titre de la catégorie"
          />
        </div>

        <div className="manage-form__field">
          <label className="manage-form__label" htmlFor="cat-slug">Slug</label>
          <input
            id="cat-slug"
            className="manage-form__input"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugLocked(true); }}
            placeholder="slug-de-la-categorie"
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
          <span className="manage-form__label">Activités associées</span>
          <ActivityTagPicker selected={activityIds} onChange={setActivityIds} multi />
        </div>

        <div className="manage-form__field" style={{ marginTop: 24 }}>
          <span className="manage-form__label">Miniature</span>
          <ImageUploadThumb
            currentFilename={thumbFilename}
            slug={`category-${slugForUpload}`}
            onUploaded={setThumbFilename}
          />
        </div>

        {error && <p style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 12 }}>{error}</p>}

        <div className="manage-form__actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/manage/categories')}>Annuler</button>
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
        title="Supprimer la catégorie"
        message={`Supprimer "${title}" ? Cette action est irréversible.`}
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
