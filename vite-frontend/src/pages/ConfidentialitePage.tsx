import '../styles/pages.scss';

export default function ConfidentialitePage() {
  return (
    <div className="static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">POLITIQUE DE CONFIDENTIALITÉ</h1>

        <div className="static-page__body">
          <p>
            ZombieZone SAS accorde une importance capitale à la protection de vos données personnelles. Cette politique
            décrit nos pratiques en matière de collecte, d'utilisation et de protection de vos données.
          </p>
        </div>

        <h2 className="static-page__section-title">DONNÉES COLLECTÉES</h2>
        <div className="static-page__body">
          <ul>
            <li>Données d'identification : nom, prénom, adresse e-mail</li>
            <li>Données de facturation : adresse postale, informations de paiement (non stockées en clair)</li>
            <li>Données de réservation : activités réservées, dates et horaires de sessions</li>
            <li>Données de navigation : adresse IP, type de navigateur, pages visitées (via cookies techniques)</li>
          </ul>
          <p>
            Nous ne collectons pas : votre groupe sanguin, votre résistance aux morsures, ni vos aptitudes à la survie
            en milieu post-apocalyptique.
          </p>
        </div>

        <h2 className="static-page__section-title">FINALITÉS DU TRAITEMENT</h2>
        <div className="static-page__body">
          <ul>
            <li>Gestion de votre compte et de vos réservations</li>
            <li>Traitement des paiements</li>
            <li>Envoi de confirmations et rappels de session</li>
            <li>Amélioration de nos services et de l'expérience utilisateur</li>
            <li>Respect de nos obligations légales et comptables</li>
            <li>Envoi de communications marketing (uniquement avec votre consentement)</li>
          </ul>
        </div>

        <h2 className="static-page__section-title">DURÉE DE CONSERVATION</h2>
        <div className="static-page__body">
          <ul>
            <li>Données de compte : pendant la durée de votre compte + 3 ans après suppression</li>
            <li>Données de transaction : 10 ans (obligation comptable)</li>
            <li>Données de navigation : 13 mois maximum</li>
            <li>Données marketing : jusqu'au retrait de votre consentement ou 3 ans sans activité</li>
          </ul>
          <p>
            En cas d'apocalypse zombie déclarée, vos données seront supprimées dans les 72 heures suivant l'état
            d'urgence national.
          </p>
        </div>

        <h2 className="static-page__section-title">VOS DROITS</h2>
        <div className="static-page__body">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit d'accès</strong> : obtenir une copie de vos données
            </li>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit de rectification</strong> : corriger des données
              inexactes
            </li>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit à l'effacement</strong> : demander la suppression de
              vos données
            </li>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit à la portabilité</strong> : recevoir vos données dans
              un format structuré
            </li>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit d'opposition</strong> : vous opposer au traitement
              pour raisons légitimes
            </li>
            <li>
              <strong style={{ color: 'var(--color-text)' }}>Droit de limitation</strong> : limiter le traitement dans
              certains cas
            </li>
          </ul>
        </div>

        <h2 className="static-page__section-title">CONTACT DPO</h2>
        <div className="static-page__body">
          <p>
            <strong style={{ color: 'var(--color-text)' }}>Délégué à la Protection des Données :</strong> Igor Necromov
          </p>
          <p>
            E-mail :{' '}
            <a href="mailto:dpo@zombiezone.fr" style={{ color: 'var(--color-red)', textDecoration: 'none' }}>
              dpo@zombiezone.fr
            </a>
          </p>
          <p>Adresse : ZombieZone SAS — DPO, Zone Industrielle de l'Apocalypse Sud, 30000 Nîmes</p>
          <p>
            Vous pouvez également adresser une réclamation à la CNIL :{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-red)', textDecoration: 'none' }}
            >
              www.cnil.fr
            </a>
          </p>
        </div>

        <div
          className="static-page__body"
          style={{ marginTop: '40px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}
        >
          <p style={{ fontSize: '0.8rem' }}>Dernière mise à jour : cycle lunaire précédant l'ouverture du parc.</p>
        </div>
      </div>
    </div>
  );
}
