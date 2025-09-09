# Cahier des Charges - Projet ZombieLand

---

## 🧟 Présentation du Projet

**Nom du projet :** ZombieLand  
**Type :** Site web dynamique  
**Client :** ZombieLand, parc d’attractions à thème post-apocalyptique  
**Objectif :** Offrir une vitrine immersive et interactive du parc ZombieLand tout en intégrant un système de réservation de billets en ligne sécurisé et une interface de gestion autonome pour l'administrateur.  

---

## 🎯 Cibles du projet

- **Public principal** : Adolescents et jeunes adultes (16-30 ans)
- **Contraintes ergonomiques** :
  - Design immersif et moderne
  - Utilisation mobile importante
  - Navigation rapide et intuitive
  - Accessibilité RGAA 2.1 à 60% minimum

---

## 🎯 Définition des besoins et objectifs

### Besoins (problèmes à résoudre)
- Manque de visibilité du parc auprès du public ciblé.
- Besoin d’un système de réservation en ligne simple et sécurisé.
- Nécessité pour le gérant de gérer le site de manière autonome.

### Objectifs du MVP (solutions de base apportées)
- Création d’un site web immersif avec un design adapté au thème horrifique.
- Affichage détaillé des activités du parc, recherche, filtre par catégorie.
- Système complet de réservation et de gestion des billets.
- Espace client : affichage détaillé des réservations, annulation d’une réservation.
- Espace administration : back-office sécurisé pour gestion du site (activités, catégories, réservations, utilisateurs, prix).
- Site mobile et responsive.
- Accessibilité handicap
- Respect des bonnes pratique du SEO.
- Compatibilité navigateur évidente, mobile/desktop.

---

## 👥 User Stories du MVP

| En tant qu' | je dois pouvoir                               | afin de                                                       |
|-------------|-----------------------------------------------|---------------------------------------------------------------|
| utilisateur | lister toutes les catégories d'activités      | consulter des activités par catégorie                         |
| utilisateur | lister toutes les activités                   | choisir des activités aux dates voulues si places disponibles |
| utilisateur | accéder à un formulaire de recherche          | trouver des activités par mots-clés                           |
| utilisateur | lister les résultats du formulaire search     | cliquer sur une activité et accéder au détail                 |
| utilisateur | accéder à un formulaire de connexion          | me connecter et réserver des activités                        |
| utilisateur | accéder à un formulaire de création de compte | créer un compte pour me connecter                             |
| utilisateur | réinitialiser mon mot de passe                | palier à un éventuel oubli                                    |
| utilisateur | supprimer mon compte                          | supprimer mes données personnelles                            |
| utilisateur | accéder à un formulaire de réservation        | réserver des billets pour une ou plusieurs personnes          |
| utilisateur | consulter la liste des mes réservations       | accéder au détail de la réservation                           |
| utilisateur | accéder à la page réservation                 | l'annuler                                                     |
| utilisateur | cliquer sur un bouton logout                  | me déconnecter                                                |

| En tant qu'    | je dois pouvoir                      | afin de                                                                                       |
|----------------|--------------------------------------|-----------------------------------------------------------------------------------------------|
| administrateur | accéder à un formulaire de connexion | me connecter sur le backoffice                                                                |
| administrateur | cliquer sur un bouton logout         | me déconnecter                                                                                |
| administrateur | lister les catégories                | accéder au détail de la catégorie                                                             |
| administrateur | accéder à la page catégorie          | modifier ou supprimer la catégorie                                                            |
| administrateur | lister les activités                 | accéder au détail de l'activité                                                               |
| administrateur | accéder à la page activité           | supprimer l'activité                                                                          |
| administrateur | éditer la page activité              | modifier les champs de l'activité : titre, description, prix, date/heure, tickets disponibles |
| administrateur | lister les réservations              | accéder au détail d'une réservation et la supprimer                                           |
| administrateur | lister les utilisateur               | accéder au détail d'un utilisateur                                                            |
| administrateur | accéder à la page utilisateur        | modifier les données ou supprimer le compte                                                   |

---

## 🛠️ Fonctionnalités du projet (Spécifications Fonctionnelles)

### 🚀 Fonctionnalités principales (incluses dans le MVP - "Minimum Viable Product")
*L’objectif du MVP est de livrer une **première version fonctionnelle et testable** du projet. Toutes les fonctionnalités secondaires qui ne sont pas essentielles au fonctionnement de base du site seront reportées.*

- Affichage des activités avec détails, filtres par catégorie, recherche.
- Affichage des catégories d'activités.
- Affichage des activités par catégories.
- Réservation de billets (date + nombre de personnes, prix).
- Système d’authentification (inscription, connexion, gestion profil - 2 rôles : user, admin).
- Visualisation et gestion des réservations (historique, annulation).
- Espace d’administration : gestion des réservations, membres, activités, catégories, prix.

### Fonctionnalités secondaires (hors MVP - évolutions potentielles)
- Système de messagerie interne.
- Notation des activités + affichage moyenne des notes.
- Commentaires sur les activités (avec modération admin).
- Réservation de packs séjours avec nombre de billets et option.s ou non (hôtel).
- Carte interactive du parc (points d’intérêt et disponibilité en temps réel).
- Gestion d'évènements spéciaux et animations (Halloween, etc.).
- Notifications push/email (événements, promotions, nouveautés).
- Réservations des repas aux restaurants.
- Boutique e-commerce de produits dérivés.
- Mémorial des visiteurs (souvenirs, photos, commentaires, évaluations).
- Support multilingue (FR/EN).
- Paiement sécurisé CB via API Stripe.

---

## ✅ Contraintes à respecter - MVP

* Authentification sécurisée
* Tests d'intégration, fonctionnels, unitaires, de charge
* Développement mobile first responsive
* Accessibilité RGAA 2.1, 50% minimum
* RGPD (mentions légales, consentement cookies)
* Éco-conception (optimisation des images, minification, éventuellement lazy loading, etc.)
* SEO
* Rapidité d'affichage
* Déploiement documenté (CI/CD si possible)

---

## 🏗️ Architecture du projet

### Architecture envisagée :

- **Front-End** : Server Side Rendering - Moteur de template EJS + types pour Typescript, SCSS.
- **Back-End** : API REST avec Node.js et Express.
- **Base de Données** : PostgreSQL.
- **Authentification** : JWT.
- **Tests fonctionnels** : Jest.
- **Conteneurisation** : Docker.
- **Versioning** : Github.

---

## 🔧 Technologies utilisées (et justification)

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **Node.js + Express** | Back-end API | Léger, rapide et très bien intégré à un stack JS. |
| **PostgreSQL** | BDD relationnelle | Robuste, idéale pour la gestion de réservations et utilisateurs. |
| **SCSS** | Style | Rapidité de prototypage et personnalisation responsive. |
| **Docker** | Conteneurisation | Environnement reproductible et portabilité. |
| **Git + GitHub** | Versionning | Suivi du projet et collaboration en équipe. |
| **CI/CD (GitHub Actions)** | Déploiement | Automatisation des déploiements (bonus). |
| **Jest** | Tests et debug | Tester et debugger plus facilement les fonctionnalités. |
| *Stripe API* | *Paiement* | *Solution sécurisée et simple à intégrer si fonctionnalité secondaire de paiement en ligne.* |

---

## ⚠️ Analyse des risques

| Risque                         | Impact | Mesure préventive                                |
| ------------------------------ | ------ | ------------------------------------------------ |
| Délais de développement        | Élevé  | Planification agile avec sprints courts          |
| Bugs critiques sur réservation | Élevé  | Recette et tests unitaires/fonctionnels         |
| Faille de sécurité (XSS, SQLi) | Élevé  | Validation des données + middleware de sécurité  |
| Manque de coordination équipe  | Moyen  | Réunions journalières et outils de suivi         |
| Problème de déploiement        | Moyen  | Documentation et tests sur environnements locaux |

---

## 👨‍💼 Répartition des rôles (à définir)

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
* Code revu avant merge

---

## 📅 Planning prévisionnel (sprints)

* Sprint 1 : Arborescence, routes, maquettes
* Sprint
