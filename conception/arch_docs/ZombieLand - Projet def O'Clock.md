# ZombieLand

## Présentation Générale

- **Quoi ?** Un site internet dynamique et engageant qui mettra en avant les attractions et l'expérience unique proposées par ZombieLand afin de se faire connaître.
  L'objectif principal est de fournir aux visiteurs un aperçu captivant du parc, tout en leur offrant la possibilité de réserver leurs billets en ligne de manière pratique et sécurisée.  
  Le gérant doit pouvoir être autonome, il y a aura donc une partie back-office pour lui laisser la main sur le site.
- **Qui ?** ZombieLand, un parc d'attractions fictif immersif post-apocalyptique
- **Pour qui ?** Les adolescents et jeunes adultes (16-30 ans), plus enclins à apprécier les attractions effrayantes, les spectacles horrifiques et les interactions avec des acteurs zombies.
- **Comment ?** En équipe à définir (positionnement via un formulaire de voeux) par l'équipe pédagogique. Organisation en méthode agile pour la gestion de projet.
- **Quand ?** En plusieurs sprints qui inclueront des tâches de : conception, code, déploiement, recettage, etc.
- **Pourquoi ?** Pour la réalisation d'un projet fictif à but pédagogique visant l'obtention du Titre Professionnel.

## Présentation du Projet de Développement

### Besoins Fonctionnels (Minimum Viable Product - MVP)

- **Liste des activités :** affichage détaillé, filtre (par catégorie), recherche si possible.
- **Système de réservation :** réservation en ligne du nombre de billets d’entrée souhaités pour le parc à une date donnée.
- **Système d’authentification** : connexion, inscription, gestion du profil utilisateur.
- **Liste des réservations** : (espace client) affichage détaillé des réservations effectuées par l’utilisateur, panier en cours. Annulation d’une réservation jusqu’à 10 jours avant la date du début.
- **Back-office (administration)** : gestion des réservations, des membres, des activités, des catégories, des prix.

### Propositions d’évolutions possibles

- **Messagerie** : système de messagerie asynchrone entre les utilisateurs et les administrateurs.
- **Notation :** possibilité de noter une activité, affichage pour chaque activité de la notation moyenne et du nombre de notes.
- **Commentaires** : possibilité de commenter une activité (avec modération en back-office).
- **Réservation avancée :** réservation en ligne de packs de séjours en indiquant la durée du séjour (4j. max), nombre de billets souhaités, avec ou sans hôtel.
- **Carte interactive du parc** : affichage dynamique des différentes attractions, points d’intérêt et disponibilité en temps réel.
- **Gestion des évènements spéciaux** : Halloween par exemple, avec des animations spécifiques.
- **Système de notifications** : pour informer les utilisateurs des événements spéciaux, des promotions, des nouveautés, etc.
- **Réservations pour les repas** : possibilité de réserver un repas dans un restaurant du parc.
- **Boutique en ligne** : vente de produits dérivés du parc (t-shirts, goodies, etc.).
- **Mémorial des visiteurs** : un espace dédié permettant aux visiteurs de partager leurs souvenirs, photos, commentaires et évaluations après leur visite du parc.
- **Support multilingue** : au moins anglais et français pour nos chers touristes.
- **Paiement** Intégration d'une API pour le paiement sécurisé, comme [Stripe](https://stripe.com/fr).

### Contraintes Techniques (notamment liées au TP)

- **Technologies** : choix libres mais justifiés.
- **Sécurité :** authentification sécurisée, protection contre les failles courantes (XSS, injections SQL, etc.).
- **Déploiement :** rédaction a minima d'une procédure de déploiement (CI/CD en bonus).
- **Responsive :** application développée en mobile first et responsive.
- **Accessibilité :** respect des normes d'accessibilité web [WCAG](https://www.w3.org/Translations/WCAG20-fr/).
- **RGPD et mentions légales :** mettre en place les mentions légales liées au règlement général sur la protection des données (RGPD).
- **Versionning :** utilisation de Git et GitHub.
- **API** : en consommer au moins une (qu’elle soit interne ou externe). Un seul appel peut être suffisant, l’API ne doit pas forcément être utilisée pour tout le projet.
- **SEO** : appliquer les bonnes pratiques visant à maximiser le référencement du projet.
- **Tests** : plan de tests couvrant les fonctionnalités principales du projet.
- **Conteneurisation (Docker)** : pour l'environnement de développement voire pour le déploiement
- **Démarche d'éco-conception** (optimisation des images, minification des fichiers, etc.).

### Informations & Ressources complémentaires

- Ne pas hésiter à utiliser des contenus “lorem ipsum” au moins le temps d'avoir un MVP fonctionnel.
- Inspiration graphique sur des sites comme [Zombinthedark](https://zombinthedark.fr/)

## Pour terminer

- Le projet est libre d'interprétation, l'équipe peut proposer ses propres choix techniques et fonctionnels. Il est donc évolutif et il ne faut pas hésiter à se l'approprier.
- L'accent doit être mis sur l'apprentissage et la mise en pratique des compétences acquises pendant la formation (objectif TP).
- L'équipe pédagogique assure l'accompagnement et conseille tout au long du projet. Elle interviendra aussi lors de la validation des choix techniques et fonctionnels. Elle sera garante de l'évaluation de la progression en vue de se préparer au mieux pour le TP.
- L'équipe pédagogique n'est en aucun cas positionnée en tant que représentante du client fictif du projet proposé.

:arrow_right: [Attendus sur le sprint 0](../.github/ISSUE_TEMPLATE/sp0-suivi-conception.md), dédié à la conception.
