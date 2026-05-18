import '../styles/pages.scss';

const ZONES = [
  { id: 'entree', label: 'ENTRÉE', x: 180, y: 460, w: 120, h: 60, color: '#2a2a2a' },
  { id: 'survival', label: 'ZONE SURVIVAL', x: 60, y: 300, w: 180, h: 120, color: '#1a2a1a' },
  { id: 'spectacle', label: 'ZONE SPECTACLE', x: 280, y: 280, w: 180, h: 120, color: '#1a1a2a' },
  { id: 'escape', label: 'ZONE ESCAPE', x: 500, y: 300, w: 160, h: 120, color: '#2a1a2a' },
  { id: 'horreur', label: 'ZONE HORREUR', x: 180, y: 120, w: 200, h: 130, color: '#2a1a1a' },
  { id: 'sortie', label: 'SORTIE DE SECOURS', x: 520, y: 460, w: 140, h: 60, color: '#1c1c0a' },
];

export default function PlanPage() {
  return (
    <div className="static-page">
      <div className="static-page__inner" style={{ maxWidth: '1000px' }}>
        <h1 className="static-page__title">PLAN DU PARC</h1>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-lg p-6 mb-10 overflow-x-auto">
          <svg
            viewBox="0 0 720 540"
            className="w-full max-w-180 block mx-auto font-['Montserrat',sans-serif]"
            role="img"
            aria-labelledby="plan-title"
          >
            <title id="plan-title">Plan du parc ZombieZone</title>
            <rect width="720" height="540" fill="#0d0d0d" rx="4" />

            {Array.from({ length: 15 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid line position is the key
              <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={540} stroke="#1a1a1a" strokeWidth="1" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid line position is the key
              <line key={`h${i}`} x1={0} y1={i * 45} x2={720} y2={i * 45} stroke="#1a1a1a" strokeWidth="1" />
            ))}

            <path
              d="M240 520 L240 420 L240 360 L360 360 L360 300 L460 300 L460 240 L280 240 L280 180"
              stroke="#3a3a3a"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M240 420 L100 420 L100 300" stroke="#3a3a3a" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path
              d="M460 300 L580 300 L580 420 L590 420"
              stroke="#3a3a3a"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />

            {ZONES.map((z) => (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color} stroke="#444" strokeWidth="1.5" rx="3" />
                <text
                  x={z.x + z.w / 2}
                  y={z.y + z.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#aaa"
                  fontSize="9"
                  fontWeight="600"
                  letterSpacing="0.06em"
                >
                  {z.label}
                </text>
              </g>
            ))}

            <text x="240" y="510" textAnchor="middle" fill="#c0392b" fontSize="10" fontWeight="700">
              ▼ ENTRÉE PRINCIPALE
            </text>

            <g transform="translate(680, 30)">
              <circle r="18" fill="#141414" stroke="#333" strokeWidth="1" />
              <text textAnchor="middle" y="-6" fill="#888" fontSize="9" fontWeight="700">
                N
              </text>
              <text textAnchor="middle" y="12" fill="#555" fontSize="7">
                S
              </text>
              <text x="-12" textAnchor="middle" y="3" fill="#555" fontSize="7">
                O
              </text>
              <text x="12" textAnchor="middle" y="3" fill="#555" fontSize="7">
                E
              </text>
              <line x1="0" y1="-14" x2="0" y2="14" stroke="#666" strokeWidth="1" />
              <line x1="-14" y1="0" x2="14" y2="0" stroke="#666" strokeWidth="1" />
            </g>
          </svg>
        </div>

        <h2 className="static-page__section-title">LÉGENDE</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {ZONES.map((z) => (
            <div key={z.id} className="flex items-center gap-2.5 text-[0.85rem] text-(--color-text-muted)">
              <div className="w-4 h-4 border border-[#444] rounded-xs shrink-0" style={{ backgroundColor: z.color }} />
              {z.label}
            </div>
          ))}
          <div className="flex items-center gap-2.5 text-[0.85rem] text-(--color-text-muted)">
            <div className="w-4 h-1 bg-[#3a3a3a] rounded-xs shrink-0" />
            Chemins de circulation
          </div>
        </div>

        <div className="static-page__body mt-9">
          <p>
            ⚠️ Le plan est fourni à titre indicatif. ZombieZone se réserve le droit de modifier l'emplacement des zones
            en cas d'incident apocalyptique majeur.
          </p>
          <p>En cas d'évacuation d'urgence, suivre les flèches rouges et ne jamais courir vers les zombies.</p>
        </div>
      </div>
    </div>
  );
}
