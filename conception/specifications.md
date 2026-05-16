# Cahier des Charges - Projet ZombieLand

---

## 🧟 Présentation du Projet

**Nom du projet :** ZombieLand  
**Type :** Application web fullstack — SPA + API REST  
**Client :** ZombieLand, parc d'attractions à thème post-apocalyptique  
**Objectif :** Offrir une vitrine immersive et interactive du parc ZombieLand tout en intégrant un système de **commande** de billets basé sur des **sessions d'activités** et une interface de gestion autonome pour l'administrateur.

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
- Besoin d'un système en ligne simple et fiable pour **commander des billets par session d'activité**.
- Nécessité pour le gérant de gérer le site de manière autonome.

### Objectifs du MVP (solutions de base apportées)
- Création d'un site web immersif avec un design adapté au thème horrifique.
- Affichage détaillé des catégories, activités, sessions (date/heure, capacité, statut, places disponibles).
- Système de commande de sessions d'activité.
- Espace client : affichage détaillé des commandes (historique avec dates des sessions, annulation de commande).
- Espace administration : back-office sécurisé pour gestion du site (CRUD des **catégories**, **activités** et leurs **sessions**, **comptes utilisateur**, **commandes**).
- Site mobile et responsive.
- Accessibilité handicap.
- Respect des bonnes pratiques SEO.
- Compatibilité navigateur évidente, mobile/desktop.

---

## 📜 User Stories du MVP

### Utilisateur
| En tant qu'   | je dois pouvoir                                                            | afin de                                                          |
|---------------|----------------------------------------------------------------------------|------------------------------------------------------------------|
| utilisateur   | lister toutes les catégories **Categories** d'activités                    | consulter des activités par catégorie                            |
| utilisateur   | lister toutes les activités **Activities**                                 | choisir une activité et consulter les sessions disponibles       |
| utilisateur   | consulter le détail d'une activité **Activities**                          | voir description, prix et sessions associées                     |
| utilisateur   | consulter la liste des sessions **Sessions** d'une activité **Activities** | choisir une date/heure précise                                   |
| *utilisateur* | *requêter avec un formulaire de recherche (si temps suffisant)*            | *trouver des activités par mots-clés*                            |
| utilisateur   | créer un compte **Users** avec un rôle **Roles** "member"                  | créer l'espace membre pour commander                             |
| utilisateur   | me connecter                                                               | accéder à mon espace membre                                      |
| utilisateur   | me déconnecter                                                             | sécuriser ma session                                             |
| utilisateur   | réinitialiser mon mot de passe                                             | sécurisation ou oubli du mdp                                     |
| utilisateur   | supprimer mon compte **Users**                                             | effacer mes données personnelles                                 |
| utilisateur   | créer une commande **Orders**                                              | préparer ma commande                                             |
| utilisateur   | ajouter/modifier/supprimer une ligne **OrdersLines**                       | réserver ou supprimer des réservations de places sur une session |
| utilisateur   | confirmer ou annuler ma commande **Orders**                                | finaliser ou abandonner ma commande                              |
| utilisateur   | consulter mes commandes **Orders** passés et en cours                      | voir l'historique et le détail de mes commandes                  |

### Administrateur
| En tant qu'    | je dois pouvoir                    | afin de                                                         |
|----------------|------------------------------------|-----------------------------------------------------------------|
| administrateur | me connecter / me déconnecter      | sécuriser l'accès au backoffice                                 |
| administrateur | CRUD des catégories **Categories** | accéder au détail, créer, modifier ou supprimer une catégorie   |
| administrateur | CRUD des activités **Activities**  | accéder au détail, créer, modifier ou supprimer une activité    |
| administrateur | CRUD des sessions **Sessions**     | accéder au détail, créer, modifier ou supprimer une session     |
| administrateur | RUD des utilisateurs **Users**     | accéder au détail, modifier ou supprimer un compte              |
| administrateur | RUD des commandes **Orders**       | accéder au détail, modifier le statut ou supprimer une commande |

---

## 🛠️ Fonctionnalités du projet (Spécifications Fonctionnelles)

### 🚀 Fonctionnalités principales (incluses dans le MVP - "Minimum Viable Product")
*L'objectif du MVP est de livrer une **première version fonctionnelle et testable** du projet. Toutes les fonctionnalités secondaires non essentielles seront reportées.*

- Affichage des catégories **Categories**, activités **Activities**, Sessions **Sessions** (détails, filtres par catégorie, *formulaire de recherche en option*).
- Commande de billets via **Orders** et des sessions **OrdersLines** (date, nombre de places, prix unitaire).
- Cycle de vie d'une commande **Orders** : Pending/Confirmed → Cancelled/Refunded.
- Système d'authentification (inscription, connexion, gestion profil **Users** — 2 rôles **Roles** : Member, Admin).
- Visualisation et gestion des commandes **Orders** (historique, annulation).
- Espace d'administration : gestion des commandes **Orders**, utilisateurs **Users**, activités **Activities**, catégories **Categories**, Sessions **Sessions**.

### Fonctionnalités secondaires (hors MVP - évolutions potentielles)
- Système de messagerie interne.
- Notation des activités + affichage moyenne des notes.
- Commentaires sur les activités (avec modération admin).
- Réservation de packs séjours (hôtel, options).
- Carte interactive du parc (points d'intérêt et disponibilité en temps réel).
- Gestion d'évènements spéciaux et animations (Halloween, etc.).
- Notifications push/email (événements, promotions, nouveautés).
- Réservations des repas aux restaurants.
- Boutique e-commerce de produits dérivés.
- Mémorial des visiteurs (souvenirs, photos, commentaires, évaluations).
- Support multilingue (FR/EN).
- Paiement sécurisé CB via API Stripe.

---

## 🚧 Contraintes à respecter - MVP

* Authentification sécurisée (JWT access + refresh token)
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

### Architecture retenue

- **Back-End** : **API REST** — Node.js + **Express 5** + **TypeScript**, stateless.
- **Front-End** : **SPA React** — rendu côté client, fetches vers l'API backend.
- **Base de données** : **PostgreSQL**, schéma géré via **Prisma**.
- **Authentification** : **JWT** — access token (15 min) + refresh token (7 j, httpOnly cookie).
- **Conteneurisation** : **Docker** (dev + prod).
- **Versioning** : **GitHub**.
- **Hébergement** : VPS (Ionos ou équivalent).

### Zones de l'application

| Zone             | URL                                        | Description                               |
|------------------|--------------------------------------------|-------------------------------------------|
| Site vitrine     | `zombiezone.kadath.fr/fr` · `/en`          | Activités, réservation, contact           |
| Espace client    | `zombiezone.kadath.fr/espace-client`       | Compte, commandes, annulation             |
| Backoffice admin | `zombiezone.kadath.fr/manage`              | Gestion activités, sessions, utilisateurs |

---

## 🤖 Technologies utilisées

### Back-end

| Technologie            | Rôle                         | Justification                                          |
|------------------------|------------------------------|--------------------------------------------------------|
| **Node.js + Express 5**| API REST                     | Léger, rapide, bien intégré au stack JS/TS             |
| **TypeScript**         | Typage statique              | Sécurité, maintenabilité                               |
| **Prisma**             | ORM + migrations             | Schéma déclaratif, client typé, migrations versionnées |
| **PostgreSQL**         | BDD relationnelle            | Robuste, idéale pour activités/sessions/orders         |
| **Zod**                | Validation des inputs        | Validation runtime + inférence de types TS             |
| **argon2**             | Hachage mots de passe        | Plus sécurisé que bcrypt (résistant aux GPU attacks)   |
| **jsonwebtoken**       | Génération/vérification JWT  | Auth stateless access + refresh token                  |
| **date-fns**           | Manipulation de dates        | Légère, tree-shakeable                                 |
| **Biome**              | Linter + formateur           | Remplace ESLint + Prettier, plus rapide                |
| **tsx**                | Exécuteur TS (dev)           | Hot reload sans compilation intermédiaire              |

### Front-end

| Technologie          | Rôle                   | Justification                                     |
|----------------------|------------------------|---------------------------------------------------|
| **React 19**         | UI SPA                 | Composants, hooks, concurrent features            |
| **Vite**             | Bundler / dev server   | Build ultra-rapide, HMR natif                     |
| **React Router 7**   | Routing côté client    | Navigation SPA sans rechargement                  |
| **Zustand**          | State global           | Simple, sans boilerplate (vs Redux)               |
| **TypeScript**       | Typage statique        | Cohérence avec le back, meilleure DX              |
| **Biome**            | Linter + formateur     | Uniformité avec le back                           |

### Infrastructure

| Technologie             | Rôle                     |
|-------------------------|--------------------------|
| **Docker + Compose**    | Conteneurisation dev/prod|
| **Nginx**               | Reverse proxy + SSL      |
| **Let's Encrypt**       | Certificats SSL           |
| *Stripe API*            | *Paiement (hors MVP)*    |

---

## 🗄️ Modèle de données

### Entités principales

| Entité             | Description                                          |
|--------------------|------------------------------------------------------|
| `roles`            | Rôles utilisateur (Member, Admin)                    |
| `users`            | Comptes utilisateurs, soft delete (`deleted_at`)     |
| `RefreshToken`     | Tokens de rafraîchissement JWT                       |
| `categories`       | Catégories d'activités, soft delete                  |
| `activities`       | Activités du parc, soft delete                       |
| `activities_categories` | Table de jonction activité ↔ catégorie          |
| `sessions`         | Sessions planifiées d'une activité, soft delete      |
| `orders`           | Commandes utilisateur, soft delete                   |
| `orders_lines`     | Lignes de commande (session × quantité × montant)    |

### Enums

| Enum            | Valeurs                                         |
|-----------------|-------------------------------------------------|
| `OrderStatus`   | `Pending`, `Confirmed`, `Cancelled`, `Refunded` |
| `SessionStatus` | `Scheduled`, `Cancelled`, `Completed`           |

### Conventions
- **Soft delete** : `deleted_at` (NULL = actif) sur les entités sensibles
- **Slugs** : `slug` sur `categories` et `activities` pour les URLs SEO-friendly

---

## 🚨 Analyse des risques

| Risque                        | Impact | Mesure préventive                                      |
|-------------------------------|--------|--------------------------------------------------------|
| Délais de développement       | Élevé  | Planification agile avec sprints courts                |
| Bugs critiques sur commande   | Élevé  | Recette + tests unitaires/fonctionnels                 |
| Faille de sécurité (XSS, SQL) | Élevé  | Validation Zod + middlewares + argon2 + JWT httpOnly   |
| Problème de déploiement       | Moyen  | Documentation (DEPLOY.md) + tests env. locaux/Docker  |

---

## 🎭 Répartition des rôles

| Nom         | Rôle               | Responsabilités                           |
|-------------|--------------------|-------------------------------------------|
| Stéphane R. | PO (Product Owner) | Vision produit, priorisation backlog      |
| Stéphane R. | Scrum Master       | Facilitation, organisation des sprints    |
| Stéphane R. | Lead Dev           | Architecture, choix techniques            |
| Stéphane R. | Dev Back-End       | API REST, sécurité, base de données       |
| Stéphane R. | Dev Front-End      | SPA React, routing, state management      |
| Stéphane R. | UI/UX Designer     | Maquettes, expérience utilisateur         |
| Stéphane R. | Testeur / QA       | Plan de tests, vérification qualité       |

---

## 📦 Versionning et bonnes pratiques

* Git : branches `main` (prod) et `dev` (développement)
* Commits conventionnels : `feat`, `fix`, `refactor`, `docs`, `chore`, etc.
* Jamais de commit direct sur `main`

---

## 📅 Planning prévisionnel (sprints)

* **Sprint 1** : Setup monorepo, schéma Prisma, API de base (categories, activities, sessions)
* **Sprint 2** : Auth JWT (register/login/refresh/logout), middleware requireAuth/requireRole
* **Sprint 3** : Orders / OrdersLines, espace client frontend (React Router, Zustand)
* **Sprint 4** : Backoffice admin, tests, hardening sécurité, SEO/Accessibilité, déploiement VPS
