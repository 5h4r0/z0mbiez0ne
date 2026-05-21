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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-(--color-surface) border rounded-lg p-8 px-6 relative flex flex-col ${plan.popular ? 'border-(--color-red)' : 'border-(--color-border)'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-(--color-red) text-white text-[0.7rem] font-bold tracking-widest uppercase px-3 py-0.75 rounded-full">
                  Le plus populaire
                </span>
              )}

              <h2 className="font-montserrat font-bold text-[0.95rem] text-(--color-text) tracking-[0.06em] mb-4">
                {plan.name}
              </h2>

              <div className="mb-2">
                {plan.subtitle && <span className="text-[0.8rem] text-(--color-text-muted)">{plan.subtitle} </span>}
                <span
                  className={`text-[2.5rem] font-black ${plan.popular ? 'text-(--color-red)' : 'text-(--color-text)'}`}
                >
                  €{plan.price}
                </span>
              </div>

              <p className="text-[0.85rem] text-(--color-text-muted) mb-6 flex-1">{plan.desc}</p>

              <ul className="list-none p-0 m-0">
                {plan.features.map((f, i) => (
                  <li
                    key={FEATURES[i]}
                    className={`flex items-center gap-2 text-[0.85rem] mb-2 ${f ? 'text-(--color-text)' : 'text-(--color-text-muted)'}`}
                  >
                    <span className={`text-[0.8rem] ${f ? 'text-[#2ecc71]' : 'text-(--color-border)'}`}>
                      {f ? '✓' : '—'}
                    </span>
                    {FEATURES[i]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="static-page__section-title">TABLEAU COMPARATIF</h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-(--color-text-muted) font-semibold border-b border-(--color-border)">
                  Fonctionnalité
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={`text-center px-4 py-3 font-bold border-b border-(--color-border) ${p.popular ? 'text-(--color-red)' : 'text-(--color-text)'}`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, fi) => (
                <tr key={feat} className="border-b border-(--color-border)">
                  <td className="px-4 py-3 text-(--color-text-muted)">{feat}</td>
                  {PLANS.map((p) => (
                    <td
                      key={p.id}
                      className={`text-center px-4 py-3 ${p.features[fi] ? 'text-[#2ecc71]' : 'text-[#444]'}`}
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
          <p className="text-[0.8rem] italic">
            * Les tarifs sont exprimés en euros TTC. ZombieZone se réserve le droit de modifier ses tarifs à tout
            moment, en particulier en cas d'invasion zombie imminente. Les billets achetés ne sont ni remboursables ni
            échangeables, sauf en cas d'apocalypse dûment certifiée par les autorités compétentes.
          </p>
        </div>
      </div>
    </div>
  );
}
