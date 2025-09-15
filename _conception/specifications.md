# Cahier des Charges - Projet ZombieLand

---

## 🧟 Présentation du Projet

**Nom du projet :** ZombieLand  
**Type :** Site web dynamique  
**Client :** ZombieLand, parc d’attractions à thème post-apocalyptique  
**Objectif :** Offrir une vitrine immersive et interactive du parc ZombieLand tout en intégrant un système de **commande** de billets basé sur des **sessions d’activités** et une interface de gestion autonome pour l'administrateur.

---

## 🎯 Cibles du projet

- **Public principal** : Adolescents et jeunes adultes (16-30 ans)
- **Contraintes ergonomiques** :
  - Design immersif et moderne
  - Utilisation mobile importante
  - Navigation rapide et intuitive
  - Accessibilité **RGAA 2.1 à 60% minimum**

---

## 📋 Définition des besoins et objectifs

### Besoins (problèmes à résoudre)
- Manque de visibilité du parc auprès du public ciblé.
- Besoin d’un système en ligne simple et fiable pour **commander des billets par session d’activité**.
- Nécessité pour le gérant de gérer le site de manière autonome.

### Objectifs du MVP (solutions de base apportées)
- Création d’un site web immersif avec un design adapté au thème horrifique.
- Affichage détaillé des catégories, activités, sessions (date/heure, capacité, statut, places disponibles).
- Système de commande de sessions d'activité.
- Espace client : affichage détaillé des commandes (historique avec dates des sessions, annulation de commande).
- Espace administration : back-office sécurisé pour gestion du site (CRUD des **catégories**, **activités** et leurs **sessions**, **comptes utilisateur**, **commandes** - *et **pages** si temps suffisant*).
- Site mobile et responsive.
- Accessibilité handicap.
- Respect des bonnes pratiques SEO.
- Compatibilité navigateur évidente, mobile/desktop.

---

## 📜 User Stories du MVP

### Utilisateur
| En tant qu'   | je dois pouvoir                                                                    | afin de                                                          |
|---------------|------------------------------------------------------------------------------------|------------------------------------------------------------------|
| utilisateur   | lister toutes les catégories **Categories** d'activités                            | consulter des activités par catégorie                            |
| utilisateur   | lister toutes les activités **Activities**                                         | choisir une activité et consulter les sessions disponibles       |
| utilisateur   | consulter le détail d’une activité **Activities**                                  | voir description, prix et sessions associées                     |
| utilisateur   | consulter la liste des sessions **ActivitySessions** d’une activité **Activities** | choisir une date/heure précise                                   |
| *utilisateur* | *requêter avec un formulaire de recherche (si temps suffisant)*                    | *trouver des activités par mots-clés*                            |
| utilisateur   | créer un compte **Users** avec un rôle **Roles** "member"                          | créer l’espace membre pour commander                             |
| utilisateur   | me connecter                                                                       | accéder à mon espace membre                                      |
| utilisateur   | me déconnecter                                                                     | sécuriser ma session                                             |
| utilisateur   | réinitialiser mon mot de passe                                                     | sécurisation ou oubli du mdp                                     |
| utilisateur   | supprimer mon compte **Users**                                                     | effacer mes données personnelles                                 |
| utilisateur   | créer une commande **Carts**                                                       | préparer ma commande                                             |
| utilisateur   | ajouter/modifier/supprimer une ligne **Orders**                                    | réserver ou supprimer des réservations de places sur une session |
| utilisateur   | confirmer ou annuler ma commande **Carts**                                         | finaliser ou abandonner ma commande                              |
| utilisateur   | consulter mes commandes **Carts** passés et en cours                               | voir l’historique et le détail de mes commandes                  |

### Administrateur
| En tant qu'    | je dois pouvoir                        | afin de                                                         |
|----------------|----------------------------------------|-----------------------------------------------------------------|
| administrateur | me connecter / me déconnecter          | sécuriser l’accès au backoffice                                 |
| administrateur | CRUD des catégories **Categories**     | accéder au détail, créer, modifier ou supprimer une catégorie   |
| administrateur | CRUD des activités **Activities**      | accéder au détail, créer, modifier ou supprimer une activité    |
| administrateur | CRUD des sessions **ActivitySessions** | accéder au détail, créer, modifier ou supprimer une session     |
| administrateur | RUD des utilisateurs **Users**         | accéder au détail, modifier ou supprimer un compte              |
| administrateur | RUD des commandes **Carts**            | accéder au détail, modifier le statut ou supprimer une commande |

---

## 🛠️ Fonctionnalités du projet (Spécifications Fonctionnelles)

### 🚀 Fonctionnalités principales (incluses dans le MVP - "Minimum Viable Product")
*L’objectif du MVP est de livrer une **première version fonctionnelle et testable** du projet. Toutes les fonctionnalités secondaires non essentielles seront reportées.*

- Affichage des catégories **Categories**, activités **Activities**, Sessions **ActivitySessions** (détails, filtres par catégorie, *formulaire de recherche en option*).
- Commande de billets via **Cart** et des sessions **Orders** (date, nombre de places, prix unitaire).
- Cycle de vie d’une commande **Carts** : Pending/Confirmed → Cancelled/Refunded.
- Système d’authentification (inscription, connexion, gestion profil **Users** (2 rôles **Roles** : member, admin).
- Visualisation et gestion des commandes **Carts** (historique, annulation).
- Espace d’administration : gestion des commande **Carts**, utilisateurs **Users**, activités **Activities**, catégories **Categories**, Sessions **ActivitySessions**.

### Fonctionnalités secondaires (hors MVP - évolutions potentielles)
- Système de messagerie interne.
- Notation des activités + affichage moyenne des notes.
- Commentaires sur les activités (avec modération admin).
- Réservation de packs séjours (hôtel, options).
- Carte interactive du parc (points d’intérêt et disponibilité en temps réel).
- Gestion d'évènements spéciaux et animations (Halloween, etc.).
- Notifications push/email (événements, promotions, nouveautés).
- Réservations des repas aux restaurants.
- Boutique e-commerce de produits dérivés.
- Mémorial des visiteurs (souvenirs, photos, commentaires, évaluations).
- Support multilingue (FR/EN).
- Paiement sécurisé CB via API Stripe.

---

## 🚧 Contraintes à respecter - MVP

* Authentification sécurisée  
* Tests d'intégration, fonctionnels, unitaires, de charge  
* Développement **mobile first** responsive  
* Accessibilité **RGAA 2.1, 60% minimum**  
* RGPD (mentions légales, consentement cookies)  
* Éco-conception (optimisation des images, minification, lazy loading, etc.)  
* SEO  
* Rapidité d'affichage  
* Déploiement documenté (CI/CD si possible)

---

## 📐 Architecture du projet

### Architecture envisagée :
- **Back-End** : **Server Side Rendering** — moteur de template **EJS** + types pour **TypeScript**, **SCSS**.  
- **Front-End** : Généré en Back-End avec EJS.
<!-- - **Front-End** : **API REST** avec **Node.js** et **Express**.   -->
- **Base de Données** : **PostgreSQL**.  
- **Authentification** : **JWT** (hash mots de passe via bcrypt/argon2).  
- **Tests fonctionnels** : **Jest**.  
- **Conteneurisation** : **Docker**.  
- **Versioning** : **GitHub**.

---

## 🤖 Technologies utilisées (et justification)

| Technologie                 | Rôle                             | Justification                                   |
|-----------------------------|----------------------------------|-------------------------------------------------|
| **Node.js + Express**       | Serveur Side <!--Back-end API--> | Léger, rapide, bien intégré au stack JS.        |
| **PostgreSQL**              | BDD relationnelle                | Robuste, idéale pour activités/sessions/orders. |
| **EJS + TypeScript + SCSS** | Front SSR                        | Simplicité MVC, typage TS, styles modulaires.   |
| **Docker**                  | Conteneurisation                 | Environnements reproductibles, portabilité.     |
| **Git + GitHub**            | Versionning                      | Suivi du projet et collaboration.               |
| **CI/CD (GitHub Actions)**  | Déploiement                      | Automatisation des builds/tests (bonus).        |
| **Jest**                    | Tests                            | Couverture unitaire/fonctionnelle.              |
| *Stripe API*                | *Paiement*                       | *Intégration ultérieure (hors MVP).*            |
| *Autres outils si besoin*   |                                  |                                                 |

---

## 🚨 Analyse des risques

| Risque                        | Impact | Mesure préventive                                |
|-------------------------------|--------|--------------------------------------------------|
| Délais de développement       | Élevé  | Planification agile avec sprints courts          |
| Bugs critiques sur commande   | Élevé  | Recette + tests unitaires/fonctionnels           |
| Faille de sécurité (XSS, SQL) | Élevé  | Validation des données + middlewares de sécurité |
| Manque de coordination équipe | Moyen  | Réunions régulières + outils de suivi            |
| Problème de déploiement       | Moyen  | Documentation + tests env. locaux/Docker         |

---

## 🎭 Répartition des rôles

| Nom         | Rôle               | Responsabilités                          |
| ----------- | ------------------ | ---------------------------------------- |
| Guillaume   | PO (Product Owner) | Vision produit, priorisation backlog     |
| Guillaume   | Scrum Master       | Facilitation, organisation des sprints   |
| Guillaume   | Lead Dev           | Développement de l’interface utilisateur |
| Jean-Kevin  | Dev Back-End       | Développement API, sécurité              |
| Jean-Kevin  | Dev Front-End      | Développement de l’interface utilisateur |
| Jean-Kevin  | UI/UX Designer     | Maquettes, expérience utilisateur        |
| xxxx        | Graphiste          | Création design visuel éventuel          |
| Jean-Kevin  | Testeur / QA       | Plan de tests, vérification qualité      |

---

## 📦 Versionning et bonnes pratiques

* Git : branches `main`, `dev`, `feature/*`, `bugfix/*`  
* Pull requests obligatoires  
* Commit messages clairs (conventionnel : `feat`, `fix`, `chore`, etc.)  
* Code relu avant merge

---

## 📅 Planning prévisionnel (sprints)

* **Sprint 1** : Arborescence, routes principales, maquettes, base SCSS  
* **Sprint 2** : Modèles + contrôleurs **Categories/Activities/Sessions**, listes/détails côté front  
* **Sprint 3** : Auth (register/login), **Carts/Orders** (commandes), pages utilisateur  
* **Sprint 4** : Admin CRUD (categories/activities/sessions/users/orders), tests & hardening, SEO/Accessibilité
