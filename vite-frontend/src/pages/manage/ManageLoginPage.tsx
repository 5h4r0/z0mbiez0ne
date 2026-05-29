// vite-frontend/src/pages/manage/ManageLoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { ROLE_IDS } from '../../lib/roles';
import { useAuthStore } from '../../store/authStore';
import '../../components/manage/manage.css';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export default function ManageLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const raw = { email: fd.get('email') as string, password: fd.get('password') as string };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      const user = useAuthStore.getState().user;
      if (!user || user.role_id !== ROLE_IDS.admin) {
        await useAuthStore.getState().logout();
        setError('Accès refusé — compte administrateur requis.');
        return;
      }
      navigate('/manage', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="manage-login">
      <div className="manage-login__box">
        <div className="manage-login__title">Backoffice</div>
        <div className="manage-login__subtitle">Connexion administrateur</div>

        {error && (
          <div className="manage-error" style={{ marginBottom: '1rem' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="manage-form__group">
            <label htmlFor="admin-email" className="manage-form__label">Email</label>
            <input id="admin-email" name="email" type="email" required autoComplete="email" className="manage-form__input" />
          </div>
          <div className="manage-form__group">
            <label htmlFor="admin-password" className="manage-form__label">Mot de passe</label>
            <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="manage-form__input" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="manage-btn manage-btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
