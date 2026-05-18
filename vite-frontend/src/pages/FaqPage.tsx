import { useState } from 'react';
import '../styles/pages.scss';

const FAQ_ITEMS = [
  {
    q: 'Peut-on venir en groupe ?',
    a: 'Absolument. Les hordes sont les bienvenues. Nous proposons même des tarifs dégressifs pour les groupes de plus de 10 survivants. Contactez-nous pour un devis personnalisé. Attention : la cohésion du groupe sera mise à rude épreuve.',
  },
  {
    q: 'Y a-t-il un âge minimum pour accéder au parc ?',
    a: "L'accès est recommandé à partir de 12 ans. Les enfants de moins de 16 ans doivent être accompagnés d'un adulte responsable — et par responsable, nous entendons quelqu'un qui n'abandonnera pas ses proches au premier zombie venu.",
  },
  {
    q: 'Les zombies mordent-ils vraiment ?',
    a: 'Nos zombies sont des acteurs professionnels soumis à un strict code de conduite. Ils ne mordent pas, ne griffent pas, et ne se transforment pas réellement. En revanche, ils sont formés pour être perturbants à un niveau psychologique avancé. Vous avez été prévenus.',
  },
  {
    q: 'Que faire si je meurs de peur ?',
    a: "Une équipe médicale qualifiée est présente sur le site. En cas de malaise, des mots de sécurité sont attribués à chaque visiteur en début de visite. Prononcer le mot de sécurité met immédiatement fin à l'expérience dans la zone concernée. Le mot de sécurité de cette année est : 'ANANAS'.",
  },
  {
    q: 'Puis-je annuler ma réservation ?',
    a: "Les annulations sont acceptées jusqu'à 48h avant la date de session, avec remboursement intégral. En deçà de ce délai, un avoir est émis pour une prochaine visite. En cas de mort effective avant la visite, des justificatifs seront demandés.",
  },
  {
    q: 'Y a-t-il des consignes pour les effets personnels ?',
    a: "Des casiers sécurisés sont disponibles à l'accueil. Nous recommandons de ne pas apporter d'objets de valeur. ZombieZone décline toute responsabilité pour les objets perdus ou confisqués par les zombies. Oui, cela arrive.",
  },
  {
    q: 'Les personnes à mobilité réduite sont-elles accueillies ?',
    a: "Le parc est partiellement accessible aux personnes à mobilité réduite. Certaines zones comportent des obstacles scénographiques (gravats, brouillard dense, sol irrégulier) qui peuvent limiter l'accès. Contactez-nous avant votre visite pour planifier votre parcours.",
  },
  {
    q: "Peut-on photographier ou filmer à l'intérieur ?",
    a: 'La photographie est autorisée dans les zones désignées. La captation vidéo est interdite dans les zones de performance pour des raisons contractuelles avec nos acteurs-zombies. Toute tentative de selfie avec un zombie en pleine attaque sera jugée à votre risque et péril.',
  },
  {
    q: 'Y a-t-il une restauration sur place ?',
    a: "Le 'Cantine des Survivants' propose une sélection de plats thématiques : burger 'Cerveau grillé', soupe 'Tripes de l'Apocalypse', et boissons énergisantes 'Sérum Z'. Ouvert de 11h à 22h. Menu enfant disponible (moins d'hémoglobine).",
  },
  {
    q: 'Comment accéder au parc ?',
    a: "Le parc est situé à Nîmes, zone industrielle de l'Apocalypse Sud. Parking gratuit pour 500 véhicules. Transport en commun : ligne 7 arrêt 'Zone Interdite'. En cas d'invasion zombie active, consultez les alertes préfectorales avant de vous déplacer.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">FOIRE AUX QUESTIONS</h1>

        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.q}
              className="bg-(--color-surface) border border-(--color-border) rounded-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full bg-transparent border-none px-5 py-[18px] flex justify-between items-center cursor-pointer text-left text-(--color-text) font-semibold text-sm gap-4"
              >
                <span>{item.q}</span>
                <span
                  className={`text-(--color-red) text-[1.2rem] shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>

              {open === i && (
                <div className="px-5 pb-5 text-[0.88rem] leading-7 text-(--color-text-muted) border-t border-(--color-border)">
                  <p className="mt-4">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="static-page__body mt-12">
          <p>
            Une question non listée ?{' '}
            <a href="/contact" className="text-(--color-red) no-underline">
              Contactez notre équipe
            </a>
            . Nous répondons sous 48h, délai de survie zombie exclu.
          </p>
        </div>
      </div>
    </div>
  );
}
