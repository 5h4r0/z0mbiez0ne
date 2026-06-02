# DOSSIER PROFESSIONNEL
## Titre Professionnel — Concepteur Développeur d'Applications
### Niveau 6 — Ministère chargé de l'Emploi

---

## Candidat

| | |
|---|---|
| **Nom de naissance** | ROCHARD |
| **Prénom** | Stéphane |
| **Adresse** | 6 rue Massillon, 30000 Nîmes |

---

## Titre professionnel visé

**Concepteur Développeur d'Applications**

- Modalité d'accès : ☑ Parcours de formation
- Organisme de formation : O'Clock
- Période de formation : Septembre 2025 – Juin 2026

---

## Projet support

**zØmbie zØne**

Site de réservation d'activités pour un parc à thème post-apocalyptique fictif. L'application permet la consultation des activités, la réservation de sessions, la gestion d'un panier, le suivi des commandes (espace client) et l'administration complète du contenu (back-office).

- Déployé sur : https://sharo.fr
- Code source : https://github.com/5h4r0/z0mbiez0ne

---

# EXEMPLES DE PRATIQUE PROFESSIONNELLE

---

## AT1 — Développer une application sécurisée

### Exemple 1 — Développement des interfaces utilisateur et des composants métier
> *CP2 — Interfaces utilisateur | CP3 — Composants métier*

**1. Tâches effectuées, dans quelles conditions**

Développement des interfaces utilisateur en React 19 (TypeScript, Vite) : pages publiques (catalogue d'activités, sessions disponibles, fiche détail), espace client (tableau de bord, historique des commandes, modification de profil) et back-office `/manage` (CRUD activités, sessions, catégories, upload d'images WebP).

Développement des composants métier côté backend (Express 5) : controllers structurés en couches, middlewares de validation Zod, gestion du panier (BasketStore Zustand), création et suivi des commandes (transitions d'état Pending → Confirmed → Cancelled).

**2. Moyens utilisés**

React 19, React Router 7, Zustand, TypeScript strict, Vite, CSS variables, Express 5, Zod, Prisma ORM, PostgreSQL.

**3. Avec qui**

Projet individuel dans le cadre de la formation O'Clock, avec suivi formateur.

**4. Contexte**

| | |
|---|---|
| **Organisme** | O'Clock — Formation CDA |
| **Projet** | zØmbie zØne (site de réservation de parc à thème) |
| **Période** | Septembre 2025 – Juin 2026 |

---

### Exemple 2 — Authentification sécurisée et gestion de projet
> *CP1 — Environnement de travail | CP4 — Gestion de projet*

**1. Tâches effectuées, dans quelles conditions**

Configuration de l'environnement de développement en monorepo npm workspaces (backend / vite-frontend). Mise en place de l'authentification JWT : access token et refresh token stockés exclusivement en cookies `httpOnly` (jamais en `localStorage`), rotation des tokens à chaque renouvellement, invalidation en base de données (table `RefreshToken`).

Résolution d'une race condition liée au double-invoke de React StrictMode via un singleton de promesse (`let refreshPromise: Promise<void> | null = null`) — déduplique les appels concurrents au point de terminaison `/api/auth/refresh`.

Gestion du projet : 24 Pull Requests, 244 commits, commits conventionnels (feat/fix/chore + emoji), sprints planifiés, linter Biome 2.x à zéro warning toléré en CI.

**2. Moyens utilisés**

npm workspaces, TypeScript strict, jsonwebtoken, argon2id, cookies `httpOnly`/`secure`/`sameSite=Strict`, GitHub (issues, PRs, milestones), Biome 2.x.

**3. Avec qui**

Projet individuel.

**4. Contexte**

| | |
|---|---|
| **Organisme** | O'Clock — Formation CDA |
| **Projet** | zØmbie zØne |
| **Période** | Septembre 2025 – Juin 2026 |

---

## AT2 — Concevoir et développer une application sécurisée organisée en couches

### Exemple 1 — Analyse des besoins, maquettage et architecture logicielle
> *CP5 — Analyser les besoins et maquetter | CP6 — Architecture logicielle*

**1. Tâches effectuées, dans quelles conditions**

Analyse des besoins d'un parc à thème fictif : ticketing, réservation de sessions, dashboard client, espace d'administration. Rédaction des spécifications fonctionnelles et techniques. Conception des wireframes des principales interfaces.

Définition d'une architecture multicouche répartie sécurisée : API REST (Express 5) + SPA React, séparation stricte routing → middlewares → controllers → ORM → BDD. Documentation de l'API avec Swagger/OpenAPI 3.0, accessible en production sur https://sharo.fr/api/docs.

**2. Moyens utilisés**

Draw.io (wireframes et diagrammes), Markdown (spécifications), Express 5, React 19, swagger-ui-express, OpenAPI 3.0.

**3. Avec qui**

Projet individuel.

**4. Contexte**

| | |
|---|---|
| **Organisme** | O'Clock — Formation CDA |
| **Projet** | zØmbie zØne |
| **Période** | Septembre 2025 – Juin 2026 |

---

### Exemple 2 — Conception BDD, accès aux données et tests
> *CP7 — BDD relationnelle | CP8 — Accès aux données | CP9 — Plans de tests*

**1. Tâches effectuées, dans quelles conditions**

Conception du schéma relationnel PostgreSQL via Prisma Schema : entités `User`, `Activity`, `Category`, `Session`, `Order`, `OrderItem`, `Basket`, `BasketItem`, `RefreshToken`. Gestion des migrations évolutives (soft delete sur `User` et `Order`, suppression de colonnes obsolètes, contraintes d'intégrité référentielle). Développement des composants d'accès aux données avec Prisma (requêtes paramétrées — zéro risque d'injection SQL via l'ORM, transactions `$transaction` pour les opérations critiques).

Stratégie de tests en pyramide : 116 tests d'intégration (Vitest + Supertest, route HTTP → controller → BDD réelle) et 35 tests unitaires (helpers tokens, auth, slugify, pagination). Base de données de test isolée, reset entre chaque suite de tests.

**2. Moyens utilisés**

Prisma ORM, PostgreSQL 16, scripts npm dédiés (`db:dev`, `db:reset`, `db:gen`), Vitest, Supertest, base de test isolée (`TEST_DATABASE_URL`).

**3. Avec qui**

Projet individuel.

**4. Contexte**

| | |
|---|---|
| **Organisme** | O'Clock — Formation CDA |
| **Projet** | zØmbie zØne |
| **Période** | Septembre 2025 – Juin 2026 |

---

## AT3 — Préparer le déploiement d'une application sécurisée

### Exemple 1 — Déploiement documenté et pipeline CI/CD GitHub Actions
> *CP10 — Préparer et documenter le déploiement | CP11 — Démarche DevOps*

**1. Tâches effectuées, dans quelles conditions**

Containerisation de l'application avec Docker multi-stage : Dockerfile backend (Node 22 Alpine, phase builder tsc → phase runner), Dockerfile frontend (Nginx Alpine, build Vite statique), `docker-compose.prod.yml` orchestrant trois services (PostgreSQL 16, backend, frontend).

Déploiement sur VPS Ionos (Ubuntu 24.04 LTS, 2 vCPU / 2 GB RAM). Configuration Nginx (reverse proxy, redirect HTTP→HTTPS, proxy `/api/` → backend:3000, SPA fallback). SSL Let's Encrypt via Certbot (renouvellement automatique). PostgreSQL exposé uniquement en réseau Docker interne.

Pipeline CI/CD GitHub Actions (`.github/workflows/ci.yml`), déclenché sur chaque push et pull request : lint Biome (back + front) → 151 tests Vitest (avec service PostgreSQL éphémère) → build TypeScript/Vite → déploiement SSH automatique sur push `master` uniquement. Toute mise en production est ainsi conditionnée au passage de l'intégralité des vérifications.

Documentation complète dans `DEPLOY.md` : procédure de mise à jour, pièges connus (symlink `prisma/migrations` dans le Dockerfile, configuration Biome en monorepo), checklist de vérification post-déploiement.

**2. Moyens utilisés**

Docker, Docker Compose, GitHub Actions, Nginx, Certbot/Let's Encrypt, VPS Ionos, SSH, `DEPLOY.md`.

**3. Avec qui**

Projet individuel.

**4. Contexte**

| | |
|---|---|
| **Organisme** | O'Clock — Formation CDA |
| **Projet** | zØmbie zØne — https://sharo.fr |
| **Période** | Septembre 2025 – Juin 2026 |

---

# SYNTHÈSE DES COMPÉTENCES COUVERTES

| CP | Intitulé | Exemple |
|---|---|---|
| CP1 | Installer et configurer son environnement de travail | AT1 — Ex. 2 |
| CP2 | Développer des interfaces utilisateur | AT1 — Ex. 1 |
| CP3 | Développer des composants métier | AT1 — Ex. 1 |
| CP4 | Contribuer à la gestion d'un projet informatique | AT1 — Ex. 2 |
| CP5 | Analyser les besoins et maquetter une application | AT2 — Ex. 1 |
| CP6 | Définir l'architecture logicielle d'une application | AT2 — Ex. 1 |
| CP7 | Concevoir et mettre en place une BDD relationnelle | AT2 — Ex. 2 |
| CP8 | Développer des composants d'accès aux données SQL | AT2 — Ex. 2 |
| CP9 | Préparer et exécuter les plans de tests | AT2 — Ex. 2 |
| CP10 | Préparer et documenter le déploiement | AT3 — Ex. 1 |
| CP11 | Contribuer à la mise en production (DevOps) | AT3 — Ex. 1 |

---

# DÉCLARATION SUR L'HONNEUR

Je soussigné(e) **Stéphane ROCHARD**, déclare sur l'honneur que les renseignements fournis dans ce dossier sont exacts et que je suis l'auteur des réalisations jointes.

Fait à Nîmes, le ____________________

Signature :
