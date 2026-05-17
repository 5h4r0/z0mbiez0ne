import '../styles/pages.scss';

const PLANS = [
  {
    id: 'solo',
    name: 'Survivant Solo',
    price: '25',
    subtitle: 'à partir de',
    desc: '1 activité au choix dans le parc',
    popular: false,
    features: ['1 activité', 'Accès zones standard', 'Billet électronique', null, null],
  },
  {
    id: 'horde',
    name: 'Pack Horde',
    price: '59',
    subtitle: '',
    desc: '3 activités + accès zones VIP',
    popular: true,
    features: ['3 activités', 'Accès zones standard', 'Billet électronique', 'Accès zones VIP', null],
  },
  {
    id: 'apocalypse',
    name: 'Forfait Apocalypse',
    price: '99',
    subtitle: '',
    desc: 'Accès illimité journée + 1 goodies',
    popular: false,
    features: [
      'Activités illimitées',
      'Accès zones standard',
      'Billet électronique',
      'Accès zones VIP',
      '1 goodies exclusif',
    ],
  },
];

const FEATURES = ['Activités incluses', 'Zones standard', 'Billet électronique', 'Zones VIP', 'Goodies'];

export default function TarifsPage() {
  return (
    <div className="static-page">
      <div className="static-page__inner" style={{ maxWidth: '1100px' }}>
        <h1 className="static-page__title">TARIFS & FORMULES</h1>

        {/* Cards tarifs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${plan.popular ? 'var(--color-red)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                padding: '32px 24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.popular && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--color-red)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Le plus populaire
                </span>
              )}

              <h2
                style={{
                  fontFamily: "'bebas-neue-regular', serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--color-text)',
                  letterSpacing: '0.06em',
                  marginBottom: '16px',
                }}
              >
                {plan.name}
              </h2>

              <div style={{ marginBottom: '8px' }}>
                {plan.subtitle && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{plan.subtitle} </span>
                )}
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: plan.popular ? 'var(--color-red)' : 'var(--color-text)',
                  }}
                >
                  €{plan.price}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '24px', flex: 1 }}>
                {plan.desc}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map((f, i) => (
                  <li
                    key={FEATURES[i]}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      color: f ? 'var(--color-text)' : 'var(--color-text-muted)',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: f ? '#2ecc71' : 'var(--color-border)', fontSize: '0.8rem' }}>
                      {f ? '✓' : '—'}
                    </span>
                    {FEATURES[i]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tableau comparatif */}
        <h2 className="static-page__section-title">TABLEAU COMPARATIF</h2>
        <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    color: 'var(--color-text-muted)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  Fonctionnalité
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      textAlign: 'center',
                      padding: '12px 16px',
                      color: p.popular ? 'var(--color-red)' : 'var(--color-text)',
                      fontWeight: 700,
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, fi) => (
                <tr key={feat} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{feat}</td>
                  {PLANS.map((p) => (
                    <td
                      key={p.id}
                      style={{ textAlign: 'center', padding: '12px 16px', color: p.features[fi] ? '#2ecc71' : '#444' }}
                    >
                      {p.features[fi] ? '✓' : '✗'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="static-page__body">
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
            * Les tarifs sont exprimés en euros TTC. ZombieZone se réserve le droit de modifier ses tarifs à tout
            moment, en particulier en cas d'invasion zombie imminente. Les billets achetés ne sont ni remboursables ni
            échangeables, sauf en cas d'apocalypse dûment certifiée par les autorités compétentes.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .tarifs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
