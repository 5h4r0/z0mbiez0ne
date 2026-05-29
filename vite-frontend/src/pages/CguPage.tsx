import '../styles/pages.scss';

const ARTICLES = [
  {
    num: 1,
    title: 'OBJET',
    content:
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site sharo.fr ainsi que des services proposés par ZombieZone SAS. En accédant au site ou en achetant une prestation, l'utilisateur accepte sans réserve les présentes conditions, y compris la clause relative aux morsures de zombies.",
  },
  {
    num: 2,
    title: "ACCÈS AU PARC ET CONDITIONS D'ENTRÉE",
    content:
      "L'accès au parc ZombieZone est soumis à la présentation d'un billet valide. Toute tentative d'infiltration non autorisée sera traitée conformément aux protocoles de sécurité en vigueur, pouvant inclure une évacuation forcée ou une confrontation avec le service d'ordre zombie. L'utilisateur certifie être en bonne santé physique et mentale au moment de sa visite. ZombieZone se réserve le droit de refuser l'accès à toute personne présentant des signes de contamination zombie avérés.",
  },
  {
    num: 3,
    title: 'RESPONSABILITÉ ET CLAUSE ZOMBIE',
    content:
      "En entrant dans le parc, vous acceptez que ZombieZone décline toute responsabilité en cas de morsure de zombie, de syncope ou de perte totale de la raison. Les expériences proposées par ZombieZone sont conçues pour provoquer une montée d'adrénaline. ZombieZone ne saurait être tenue responsable des conséquences psychologiques à long terme d'une rencontre avec nos comédiens-zombies professionnels. Tout incident doit être signalé immédiatement au personnel, en prononçant le mot de sécurité ou en arborant le drapeau blanc prévu à cet effet.",
  },
  {
    num: 4,
    title: 'RÉSERVATION ET PAIEMENT',
    content:
      "Les réservations sont effectuées en ligne via le site sharo.fr. Le paiement est dû intégralement au moment de la réservation. ZombieZone accepte les cartes bancaires, les virements SEPA et les paiements en or post-apocalyptique (sous réserve d'évaluation). Aucun paiement en cerveaux ne sera accepté.",
  },
  {
    num: 5,
    title: 'ANNULATIONS ET REMBOURSEMENTS',
    content:
      "Les annulations effectuées plus de 48h avant la session donnent droit à un remboursement intégral. Entre 24h et 48h : avoir de 100% valable 6 mois. Moins de 24h : aucun remboursement, sauf force majeure dûment justifiée (invasion zombie certifiée, décret préfectoral d'état d'urgence apocalyptique, décès du titulaire du billet sur présentation d'un acte de décès non zombifié).",
  },
  {
    num: 6,
    title: 'PROPRIÉTÉ INTELLECTUELLE ET DONNÉES',
    content:
      "Toute reproduction du contenu du site est soumise à l'accord préalable de ZombieZone SAS. Les données personnelles collectées sont traitées conformément à notre Politique de Confidentialité. ZombieZone s'engage à ne jamais vendre vos données à des corporations pharmaceutiques cherchant à développer un antidote ou, au contraire, à accélérer la propagation du virus Z.",
  },
];

export default function CguPage() {
  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">CONDITIONS GÉNÉRALES D'UTILISATION</h1>

        <div className="static-page__body mb-10">
          <p>En vigueur depuis l'ouverture du parc. Applicables jusqu'à l'apocalypse finale.</p>
        </div>

        {ARTICLES.map((article) => (
          <div key={article.num}>
            <h2 className="static-page__section-title">
              ARTICLE {article.num} — {article.title}
            </h2>
            <div className="static-page__body">
              <p>{article.content}</p>
            </div>
          </div>
        ))}

        <div className="static-page__body mt-12 p-5 bg-(--color-surface) rounded-md border border-(--color-border)">
          <p className="italic text-(--color-text)">
            "En entrant dans le parc, vous acceptez que ZombieZone décline toute responsabilité en cas de morsure de
            zombie, de syncope ou de perte totale de la raison."
          </p>
          <p className="text-[0.8rem] mt-2">
            — Article 3 des CGU ZombieZone, dûment accepté lors de l'achat de votre billet
          </p>
        </div>

        <div className="static-page__body mt-8">
          <p className="text-[0.8rem]">Dernière mise à jour : avant la première morsure officiellement enregistrée.</p>
          <p className="text-[0.8rem]">
            Pour toute question :{' '}
            <a href="mailto:cgu@zombiezone.fr" className="text-(--color-red) no-underline">
              cgu@zombiezone.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
