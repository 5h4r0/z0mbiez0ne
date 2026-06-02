const klaroConfig = {
  version: 1,
  elementID: 'klaro',
  lang: 'fr',
  acceptAll: true,
  hideDeclineAll: false,
  cookieName: 'zombiezone-consent',
  cookieExpiresAfterDays: 365,
  translations: {
    fr: {
      consentNotice: {
        description:
          'zØmbie zØne utilise des cookies fonctionnels pour votre session. Aucun cookie publicitaire ou de tracking.',
      },
      acceptAll: 'Accepter',
      declineAll: 'Refuser',
      close: 'Fermer',
    },
  },
  services: [
    {
      name: 'session',
      title: 'Cookies de session',
      description: "Nécessaires au fonctionnement de l'authentification (httpOnly, sécurisés).",
      required: true,
      purposes: ['security'],
    },
  ],
}

export default klaroConfig
