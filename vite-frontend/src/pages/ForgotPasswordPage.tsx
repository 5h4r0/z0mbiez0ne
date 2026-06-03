import { useState } from 'react';
import { Link } from 'react-router';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full bg-(--color-surface) border border-(--color-border) rounded px-3 py-2 text-(--color-text) text-sm placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-red)';
  const labelClass = 'block text-xs text-(--color-text-muted) uppercase tracking-widest mb-1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  return (
    <div className="static-page">
      <div className="static-page__inner max-w-120">
        <h1 className="static-page__title">MOT DE PASSE OUBLIÉ</h1>

        {submitted ? (
          <div className="rounded border border-green-700 bg-green-950/40 px-4 py-3 text-green-300 text-sm">
            <p>Si cet email correspond à un compte, un lien de réinitialisation a été envoyé.</p>
            <p className="mt-2">Vérifiez votre boîte mail (et vos spams).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>Adresse email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="vous@example.com"
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-(--color-red) hover:underline">← Retour à la connexion</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
