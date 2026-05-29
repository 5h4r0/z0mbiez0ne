import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import type { AuthUser } from '../../store/authStore';
import { apiFetch, useAuthStore } from '../../store/authStore';
import '../../styles/pages.scss';

export default function AccountSettingsPage() {
  const { user, isHydrating } = useAuthStore();
  const navigate = useNavigate();

  // Guard bfcache — redirige si session expirée au retour navigateur
  useEffect(() => {
    if (isHydrating) return;
    if (!user) navigate('/login', { replace: true });
  }, [isHydrating, user, navigate]);

  // Guard réseau — protection bfcache
  useEffect(() => {
    if (isHydrating || !user) return;
    apiFetch('/api/auth/profile')
      .then((r) => {
        if (!r.ok) useAuthStore.getState().logout();
      })
      .catch(() => {});
  }, [isHydrating, user]);

  if (isHydrating) {
    return (
      <div className="static-page">
        <div className="static-page__inner">
          <div className="skeleton-card__body flex flex-col gap-3">
            <div className="skeleton-card__line skeleton-card__line--medium h-6" />
            <div className="skeleton-card__line skeleton-card__line--full h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-2xl">
        <h1 className="static-page__title">PARAMÈTRES DU COMPTE</h1>
        <ProfileSection user={user} />
        <PasswordSection userId={user.id} />
        <DeleteSection userId={user.id} />
      </div>
    </div>
  );
}

// ─── Section 1 : profil ──────────────────────────────────────────────────────

function ProfileSection({ user }: { user: AuthUser }) {
  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname, setLastname] = useState(user.lastname);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, email }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? 'Erreur lors de la mise à jour.');
        return;
      }
      const profileRes = await apiFetch('/api/auth/profile');
      if (profileRes.ok) {
        const updated = (await profileRes.json()) as AuthUser;
        useAuthStore.setState({ user: updated });
      }
      setSuccess('Profil mis à jour.');
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-montserrat text-[1.1rem] tracking-widest text-(--color-text) mb-5">
        MODIFIER LE PROFIL
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Prénom"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
            className="flex-1 bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
          />
          <input
            type="text"
            placeholder="Nom"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
            className="flex-1 bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
        <button
          type="submit"
          disabled={saving}
          className="self-start border border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200 disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </section>
  );
}

// ─── Section 2 : mot de passe ─────────────────────────────────────────────────

function PasswordSection({ userId }: { userId: number }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? 'Erreur lors du changement de mot de passe.');
        return;
      }
      await useAuthStore.getState().logout();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-montserrat text-[1.1rem] tracking-widest text-(--color-text) mb-5">
        MODIFIER LE MOT DE PASSE
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="password"
          placeholder="Mot de passe actuel"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
        />
        <input
          type="password"
          placeholder="Confirmer le nouveau mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:border-(--color-red)"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="self-start border border-(--color-border) text-(--color-text-muted) hover:text-(--color-red) hover:border-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200 disabled:opacity-50"
        >
          {saving ? 'Modification…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </section>
  );
}

// ─── Section 3 : suppression ──────────────────────────────────────────────────

function DeleteSection({ userId }: { userId: number }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? 'Impossible de supprimer le compte.');
        setDeleting(false);
        return;
      }
      await useAuthStore.getState().logout();
      navigate('/', { replace: true });
    } catch {
      setError('Erreur réseau.');
      setDeleting(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="font-montserrat text-[1.1rem] tracking-widest text-(--color-text) mb-5">
        SUPPRIMER LE COMPTE
      </h2>
      <p className="text-(--color-text-muted) text-sm mb-4">
        Cette action est irréversible. Votre compte sera désactivé définitivement.
      </p>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="flex flex-col gap-3 max-w-md">
          <p className="text-(--color-text) text-sm font-semibold">
            Confirmer la suppression définitive du compte ?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="border border-red-500 text-red-400 hover:bg-red-500/10 px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200 disabled:opacity-50"
            >
              {deleting ? 'Suppression…' : 'Oui, supprimer'}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="border border-(--color-border) text-(--color-text-muted) hover:border-(--color-red) hover:text-(--color-red) px-5 py-2 rounded text-sm cursor-pointer bg-transparent transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
