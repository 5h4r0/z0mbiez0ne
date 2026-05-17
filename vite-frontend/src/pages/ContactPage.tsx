import { useState } from 'react';
import '../styles/pages.scss';

interface FormData {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

const INITIAL: FormData = { nom: '', email: '', sujet: '', message: '' };

const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  padding: '10px 14px',
  color: 'var(--color-text)',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
};

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('Contact form submitted:', form);
    setSent(true);
    setForm(INITIAL);
  }

  return (
    <div className="static-page">
      <div className="static-page__inner" style={{ maxWidth: '1100px' }}>
        <h1 className="static-page__title">CONTACTEZ LA ZONE</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px' }}>
          {/* Formulaire */}
          <div>
            {sent ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid #2ecc71',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2ecc71', marginBottom: '12px' }}>
                  Message envoyé dans le vide !
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Un membre de notre équipe (vivant) vous répondra dans les 48h. En cas de non-réponse, vérifiez que
                  votre interlocuteur n'a pas été converti.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  style={{
                    marginTop: '20px',
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    padding: '8px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.85rem',
                  }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="nom" style={LABEL_STYLE}>
                    Nom complet
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Jean-Pierre Survivant"
                    style={INPUT_STYLE}
                  />
                </div>

                <div>
                  <label htmlFor="email" style={LABEL_STYLE}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="vivant@email.fr"
                    style={INPUT_STYLE}
                  />
                </div>

                <div>
                  <label htmlFor="sujet" style={LABEL_STYLE}>
                    Sujet
                  </label>
                  <select
                    id="sujet"
                    name="sujet"
                    required
                    value={form.sujet}
                    onChange={handleChange}
                    style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  >
                    <option value="">Choisir un sujet…</option>
                    <option value="reservation">Réservation de groupe</option>
                    <option value="annulation">Annulation / Remboursement</option>
                    <option value="info">Informations générales</option>
                    <option value="presse">Presse & Partenariats</option>
                    <option value="zombie">Signalement zombie (urgent)</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" style={LABEL_STYLE}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre demande en détail. En cas de morsure, précisez la nature, l'heure et l'acteur impliqué."
                    style={{ ...INPUT_STYLE, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--color-red)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    transition: 'background-color 0.2s',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-red-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-red)';
                  }}
                >
                  Envoyer dans le vide
                </button>
              </form>
            )}
          </div>

          {/* Infos + carte */}
          <div>
            <div style={{ marginBottom: '36px' }}>
              <h2
                style={{
                  fontFamily: "'bebas-neue-regular', serif",
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--color-text)',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                COORDONNÉES
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.88rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div>📍 Zone Industrielle de l'Apocalypse Sud, 30000 Nîmes, France</div>
                <div>
                  📧{' '}
                  <a href="mailto:contact@zombiezone.fr" style={{ color: 'var(--color-red)', textDecoration: 'none' }}>
                    contact@zombiezone.fr
                  </a>
                </div>
                <div>📞 +33 (0)4 66 00 00 00</div>
              </div>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <h2
                style={{
                  fontFamily: "'bebas-neue-regular', serif",
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--color-text)',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                HORAIRES D'OUVERTURE
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                {[
                  { j: 'Lundi — Jeudi', h: '14h00 — 22h00' },
                  { j: 'Vendredi', h: '14h00 — 00h00' },
                  { j: 'Samedi', h: '10h00 — 00h00' },
                  { j: 'Dimanche', h: '10h00 — 21h00' },
                  { j: 'Jours fériés', h: 'Selon calendrier apocalyptique' },
                ].map(({ j, h }) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: '6px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>{j}</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte SVG minimaliste */}
            <div>
              <h2
                style={{
                  fontFamily: "'bebas-neue-regular', serif",
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--color-text)',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                COMMENT VENIR
              </h2>
              <svg
                viewBox="0 0 300 180"
                role="img"
                aria-labelledby="map-title"
                style={{
                  width: '100%',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  display: 'block',
                }}
              >
                <title id="map-title">Carte de localisation — ZombieZone Nîmes</title>
                <rect width="300" height="180" fill="#0d0d0d" />
                {/* Routes */}
                <line x1="0" y1="90" x2="300" y2="90" stroke="#2a2a2a" strokeWidth="8" />
                <line x1="150" y1="0" x2="150" y2="180" stroke="#2a2a2a" strokeWidth="5" />
                <line x1="0" y1="130" x2="200" y2="130" stroke="#1a1a1a" strokeWidth="3" />
                {/* Labels routes */}
                <text x="10" y="83" fill="#555" fontSize="8" fontFamily="Montserrat, sans-serif">
                  A9
                </text>
                <text x="155" y="15" fill="#555" fontSize="8" fontFamily="Montserrat, sans-serif">
                  N86
                </text>
                {/* Zone */}
                <rect x="120" y="60" width="60" height="40" fill="#1a0a0a" stroke="#c0392b" strokeWidth="1" rx="2" />
                <text
                  x="150"
                  y="84"
                  textAnchor="middle"
                  fill="#c0392b"
                  fontSize="7"
                  fontWeight="700"
                  fontFamily="Montserrat, sans-serif"
                >
                  ZOMBIE ZONE
                </text>
                {/* Marqueur */}
                <circle cx="150" cy="80" r="5" fill="#c0392b" />
                <circle cx="150" cy="80" r="9" fill="none" stroke="#c0392b" strokeWidth="1" opacity="0.4" />
                {/* Ville */}
                <text x="30" y="110" fill="#444" fontSize="9" fontFamily="Montserrat, sans-serif">
                  NÎMES CENTRE
                </text>
                <circle cx="60" cy="95" r="3" fill="#333" />
              </svg>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Parking gratuit sur place. Accessible en transport en commun : ligne 7, arrêt "Zone Interdite".
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .static-page__inner > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
