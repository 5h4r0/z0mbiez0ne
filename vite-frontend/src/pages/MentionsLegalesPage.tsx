import '../styles/pages.scss';

export default function MentionsLegalesPage() {
  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">MENTIONS LÉGALES</h1>

        <h2 className="static-page__section-title">ÉDITEUR DU SITE</h2>
        <div className="static-page__body">
          <p>
            <strong className="text-(--color-text)">ZombieZone SAS</strong>
          </p>
          <p>Capital social : 66 666 €</p>
          <p>Siège social : Zone Industrielle de l'Apocalypse Sud, 30000 Nîmes, France</p>
          <p>RCS Nîmes : 666 666 666</p>
          <p>TVA intracommunautaire : FR66 666666666</p>
          <p>Directeur de la publication : Dr. Viktor Morbide, PDG</p>
          <p>
            Contact :{' '}
            <a href="mailto:legal@zombiezone.fr" className="text-(--color-red) no-underline">
              legal@zombiezone.fr
            </a>
          </p>
        </div>

        <h2 className="static-page__section-title">HÉBERGEUR</h2>
        <div className="static-page__body">
          <p>
            <strong className="text-(--color-text)">Kadath Hosting</strong>
          </p>
          <p>Zone Interdite 51, Bunker B-12</p>
          <p>Coordonnées GPS : classifiées</p>
          <p>Tel : +33 (0) 6 66 66 66 66 (disponible uniquement entre 00h00 et 03h00)</p>
        </div>

        <h2 className="static-page__section-title">PROPRIÉTÉ INTELLECTUELLE</h2>
        <div className="static-page__body">
          <p>
            L'ensemble du contenu de ce site (textes, images, logos, sons, vidéos, animations) est la propriété
            exclusive de ZombieZone SAS et est protégé par les lois françaises et internationales relatives à la
            propriété intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation de
            tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf
            autorisation écrite préalable de ZombieZone SAS.
          </p>
          <p>
            Les zombies figurant sur ce site sont des personnages fictifs. Toute ressemblance avec des morts-vivants
            existants ou ayant existé serait purement fortuite.
          </p>
        </div>

        <h2 className="static-page__section-title">DONNÉES PERSONNELLES</h2>
        <div className="static-page__body">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
            vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
          </p>
          <p>
            Pour exercer ces droits, contactez notre Délégué à la Protection des Données (DPO) :{' '}
            <a href="mailto:dpo@zombiezone.fr" className="text-(--color-red) no-underline">
              dpo@zombiezone.fr
            </a>
            .
          </p>
          <p>
            Avertissement : ZombieZone ne collecte pas de données relatives à votre état de décès ou de transformation
            en zombie. Ces informations restent votre propriété.
          </p>
        </div>

        <h2 className="static-page__section-title">COOKIES</h2>
        <div className="static-page__body">
          <p>
            Ce site utilise des cookies nécessaires à son bon fonctionnement. Aucun cookie de traçage ou de ciblage
            publicitaire n'est utilisé. Nous respectons votre vie privée, même après l'apocalypse.
          </p>
        </div>

        <div className="static-page__body mt-10 border-t border-(--color-border) pt-5">
          <p className="text-[0.8rem]">
            Dernière mise à jour : avant le premier cas de morsure recensé officiellement.
          </p>
        </div>
      </div>
    </div>
  );
}
