import { useState } from 'react';
import '../styles/pages.scss';

interface FormData {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

const INITIAL: FormData = { nom: '', email: '', sujet: '', message: '' };

const inputCls =
  'bg-(--color-surface) border border-(--color-border) rounded px-3.5 py-2.5 text-(--color-text) text-sm w-full outline-none';

const labelCls = 'block text-[0.8rem] font-semibold text-(--color-text-muted) uppercase tracking-[0.06em] mb-1.5';

const sectionHeadCls =
  "font-montserrat font-bold text-sm text-(--color-text) tracking-widest mb-4";

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Formulaire */}
          <div>
            {sent ? (
              <div className="bg-(--color-surface) border border-[#2ecc71] rounded-lg p-8 text-center">
                <p className="text-[1.1rem] font-bold text-[#2ecc71] mb-3">Message envoyé dans le vide !</p>
                <p className="text-(--color-text-muted) text-sm">
                  Un membre de notre équipe (vivant) vous répondra dans les 48h. En cas de non-réponse, vérifiez que
                  votre interlocuteur n'a pas été converti.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-5 bg-transparent border border-(--color-border) text-(--color-text-muted) px-5 py-2 rounded cursor-pointer text-[0.85rem]"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="nom" className={labelCls}>
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
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelCls}>
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
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="sujet" className={labelCls}>
                    Sujet
                  </label>
                  <select
                    id="sujet"
                    name="sujet"
                    required
                    value={form.sujet}
                    onChange={handleChange}
                    className={`${inputCls} cursor-pointer`}
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
                  <label htmlFor="message" className={labelCls}>
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
                    className={`${inputCls} resize-y`}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-(--color-red) hover:bg-(--color-red-hover) text-white border-none px-6 py-3 rounded text-sm font-bold tracking-[0.06em] uppercase cursor-pointer transition-colors duration-200 self-start"
                >
                  Envoyer dans le vide
                </button>
              </form>
            )}
          </div>

          {/* Infos + carte */}
          <div>
            <div className="mb-9">
              <h2 className={sectionHeadCls}>COORDONNÉES</h2>
              <div className="flex flex-col gap-2.5 text-[0.88rem] text-(--color-text-muted)">
                <div>📍 Zone Industrielle de l'Apocalypse Sud, 30000 Nîmes, France</div>
                <div>
                  📧{' '}
                  <a href="mailto:contact@zombiezone.fr" className="text-(--color-red) no-underline">
                    contact@zombiezone.fr
                  </a>
                </div>
                <div>📞 +33 (0)4 66 00 00 00</div>
              </div>
            </div>

            <div className="mb-9">
              <h2 className={sectionHeadCls}>HORAIRES D'OUVERTURE</h2>
              <div className="flex flex-col gap-1.5 text-[0.88rem]">
                {[
                  { j: 'Lundi — Jeudi', h: '14h00 — 22h00' },
                  { j: 'Vendredi', h: '14h00 — 00h00' },
                  { j: 'Samedi', h: '10h00 — 00h00' },
                  { j: 'Dimanche', h: '10h00 — 21h00' },
                  { j: 'Jours fériés', h: 'Selon calendrier apocalyptique' },
                ].map(({ j, h }) => (
                  <div key={j} className="flex justify-between border-b border-(--color-border) pb-1.5">
                    <span className="text-(--color-text-muted)">{j}</span>
                    <span className="text-(--color-text) font-semibold">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className={sectionHeadCls}>COMMENT VENIR</h2>
              <svg
                viewBox="0 0 300 180"
                role="img"
                aria-labelledby="map-title"
                className="w-full rounded-md border border-(--color-border) block"
              >
                <title id="map-title">Carte de localisation — ZombieZone Nîmes</title>
                <rect width="300" height="180" fill="#0d0d0d" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="#2a2a2a" strokeWidth="8" />
                <line x1="150" y1="0" x2="150" y2="180" stroke="#2a2a2a" strokeWidth="5" />
                <line x1="0" y1="130" x2="200" y2="130" stroke="#1a1a1a" strokeWidth="3" />
                <text x="10" y="83" fill="#555" fontSize="8" fontFamily="Montserrat, sans-serif">
                  A9
                </text>
                <text x="155" y="15" fill="#555" fontSize="8" fontFamily="Montserrat, sans-serif">
                  N86
                </text>
                <rect x="110" y="60" width="70" height="40" fill="#1a0a0a" stroke="#c0392b" strokeWidth="1" rx="2" />
                <text
                  x="145"
                  y="84"
                  textAnchor="middle"
                  fill="#c0392b"
                  fontSize="7"
                  fontWeight="700"
                  fontFamily="Montserrat, sans-serif"
                >
                  zØmbie &nbsp;&nbsp;&nbsp; zØne
                </text>
                <circle cx="150" cy="80" r="5" fill="#c0392b" />
                <circle cx="150" cy="80" r="9" fill="none" stroke="#c0392b" strokeWidth="1" opacity="0.4" />
                <text x="30" y="110" fill="#444" fontSize="9" fontFamily="Montserrat, sans-serif">
                  NÎMES CENTRE
                </text>
                <circle cx="60" cy="95" r="3" fill="#333" />
              </svg>
              <p className="text-[0.78rem] text-(--color-text-muted) mt-2">
                Parking gratuit sur place. Accessible en transport en commun : ligne 7, arrêt "Zone Interdite".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
