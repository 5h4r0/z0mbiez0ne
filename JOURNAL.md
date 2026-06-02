# JOURNAL DE BORD — ZombieZone
> Projet CDA — Stéphane R. — O'clock 2025-2026
> Reconstitué à partir de l'historique Git (244 commits, 9 mois de développement)

---

## PHASE 1 — Conception et modélisation (septembre 2025)

### Semaine du 08/09/2025 au 14/09/2025
**Objectif : Initialisation du projet et conception des données**

**Réalisations :**
- Création du dépôt GitHub et initialisation du projet
- Rédaction du cahier des charges (specifications.md) — user stories, contraintes, cibles
- Modélisation du MCD avec draw.io — entités : roles, users, categories, activities, sessions, orders, orders_lines
- Rédaction du MLD et du dictionnaire de données
- Premiers wireframes/maquettes des interfaces utilisateur
- Définition de la structure de navigation (arborescence du site)
- Rédaction du schéma PostgreSQL initial (postgres_schema.psql)

**Difficultés :**
- Mauvaise gestion des fichiers dans les premiers commits (fichiers supprimés puis récupérés — 3 commits correctifs)
- Ajustements multiples du MCD pour modéliser la relation M-N activities ↔ categories (table de jonction activities_categories)
- Hésitation sur le stockage des images (chemin complet vs filename seul) → choix final : `image_filename` avec séparation physique banners/thumbs

**Décisions techniques :**
- Slug auto-généré sur activities et categories pour les URLs SEO-friendly
- Soft delete (`deleted_at`) uniquement sur les données sensibles : users, orders
- Hard delete intentionnel sur activities, categories, sessions (permet la suppression des fichiers images associés)

---

### Semaine du 15/09/2025 au 21/09/2025
**Objectif : Finalisation conception + installation stack backend**

**Réalisations :**
- Mise à jour du schéma PostgreSQL avec `image_filename`
- Rédaction du diagramme de cas d'utilisation administrateur
- Finalisation des wireframes et maquettes
- Définition des routes API (endpoints_api.md)
- Installation des dépendances : Express, Prisma, PostgreSQL, TypeScript
- Première route fonctionnelle : GET `/` et GET `/api`, serveur sur le port 3000
- Configuration initiale du projet (package.json, type:module)

**Difficultés :**
- Plusieurs réinstallations de dépendances dues à des conflits de configuration
- Gestion du `type: "module"` Node.js avec TypeScript — incompatibilités avec certains imports

**Décisions techniques :**
- Choix de `tsx` comme runner TypeScript en développement (hot-reload sans compilation intermédiaire)
- Architecture monorepo envisagée dès le départ pour unifier backend et frontend

---

### Semaine du 22/09/2025 au 28/09/2025
**Objectif : Développement des premiers controllers API**

**Réalisations :**
- Controllers activities et categories : CRUD complet (GET, POST, PUT, DELETE)
- Génération automatique des slugs
- Controllers sessions, orders, orders_lines : versions initiales
- Helpers pagination et sanitize user
- Configuration CORS

**Difficultés :**
- Cohérence des réponses API (format `{ success, data }` vs réponse directe) → standardisation progressive
- Gestion des types Zod complexes (dates, enums PostgreSQL)

---

### Semaine du 29/09/2025 au 05/10/2025
**Objectif : Controllers users + routes roles**

**Réalisations :**
- Controllers roles : routes et logique métier
- Controllers users : CRUD complet avec sanitize (exclusion password_hash des réponses)
- Merge de la PR #1 : feature/add-controllers

**Décisions techniques :**
- `async/await` + `try/catch` comme standard unique du projet — `.then/.catch` uniquement dans le middleware access-control comme référence pédagogique

---

### Semaine du 06/10/2025 au 12/10/2025
**Objectif : Validation Zod + controllers complets**

**Réalisations :**
- Ajout Zod sur les controllers sessions avec contrôle des types
- `date-fns` pour le formatage des dates
- Variables d'environnement correctement configurées

---

### Semaine du 13/10/2025 au 26/10/2025
**Objectif : Middleware auth + configuration Biome**

**Réalisations :**
- Middleware `requireAuth` : vérification JWT, distinction `TokenExpiredError` vs `JsonWebTokenError`
- Correction : suppression de l'enum Role du modèle Prisma (conflit avec les données en base)
- Configuration Biome 2.x (linter + formateur — remplace ESLint + Prettier)
- Corrections Biome : conventions, casse des rôles en minuscules

**Difficultés :**
- Conflit de configuration Biome en monorepo (biome.json racine vs workspace) → exécution depuis chaque workspace
- Gestion des rôles : enum Prisma vs string en base → choix final string avec validation Zod

---

### Semaine du 27/10/2025 au 02/11/2025
**Objectif : Initialisation frontend**

**Réalisations :**
- Initialisation Vite + React frontend
- Premières corrections Biome
- Configuration config production (suppression console.log en prod)

---

**Pause projet : novembre 2025 → mai 2026**
*Interruption de 7 mois due à une recherche d'emploi active. Reprise en mai 2026 avec une vision technique enrichie et une motivation renouvelée pour finaliser le projet.*

---

## PHASE 2 — Développement intensif (mai–juin 2026)

### Semaine du 11/05/2026 au 17/05/2026
**Objectif : Reprise du projet — refonte auth JWT + montage du monorepo**

**Réalisations :**
- Refactoring complet des controllers vers `async/await` + `try/catch` uniforme
- Finalisation controllers sessions, orders, orders_lines avec gestion complète des cas d'erreur
- **Implémentation auth JWT complète** : access token (15min) + refresh token (7j), exclusivement en cookies httpOnly
- Middleware `requireRole` pour la gestion des accès admin/member
- Correction : caractère spécial obligatoire dans la politique de mot de passe
- Mise en place du monorepo npm workspaces
- Mise à jour de la documentation (.md)
- Initialisation frontend React 19 + Vite + React Router 7

**Difficultés :**
- Rechargement du contexte après 7 mois d'interruption — relecture complète de la documentation
- Refonte du système d'authentification : abandon de l'approche token en mémoire au profit des cookies httpOnly

**Veille sécurité :**
- Recherche : "JWT httpOnly cookie XSS CSRF SPA best practices 2024"
- Sources : OWASP JWT Cheat Sheet, RFC 6265
- Décision : cookies `httpOnly; Secure; SameSite=Strict` — jamais localStorage ni sessionStorage

---

### Semaine du 18/05/2026 au 24/05/2026
**Objectif : Frontend complet — pages publiques, auth, espace client, panier**

**Réalisations :**
- Pages publiques : ActivitiesPage, SessionDetailPage, ActivityDetailPage, pages détail
- Hook `useFetch` générique (loading/error/data), composant `SkeletonGrid`, helper `parsePaginated`
- Cards cliquables avec navigation portée par l'`<article>` entier (accessibilité)
- Attributs `aria-label` explicites sur les liens (RGAA)
- **Store Zustand panier** : ajout/modification/suppression de lignes, calcul total HT + TTC
- **Store Zustand auth** : login, logout, `refreshToken()`, boot silencieux au démarrage
- **apiFetch intercepteur 401** : retry automatique après refresh — promise singleton pour dédupliquer
- **Espace client** : DashboardPage, OrderDetailPage, annulation de commande
- Affichage des places disponibles réelles par session
- Audit sécurité et corrections : 5 anomalies résolues (user_id JWT, soft delete, Zod updateUser, bfcache, localStorage)
- Merge master : branche customer-account-dev → master
- Scaffold backoffice /manage : layout, guard admin, routing

**Difficultés :**
- Mauvais revert Git → restauration manuelle du frontend
- Incompatibilités Tailwind/Vite (plusieurs configurations testées)
- **Race condition React StrictMode** : double-invoke des effets → deux appels simultanés au refresh token → second échouait (token déjà rotaté)
- Solution : `let refreshPromise: Promise<void> | null = null` (singleton) dans apiFetch et dans le store Zustand
- Bug register : `role_id 2` au lieu de `1` (membre créé en admin) — corrigé immédiatement
- Overflow numérique : `Decimal(5,2)` → `Decimal(10,2)` sur orders/orders_lines

**Veille sécurité :**
- Recherche : "refresh token rotation concurrent requests race condition"
- Sources : Auth0 documentation, hasura.io blog
- Recherche : "bfcache back-forward cache authentication SPA"
- Source : MDN Web Docs, web.dev — implémentation du guard réseau au montage des pages protégées

---

### Semaine du 25/05/2026 au 31/05/2026
**Objectif : Backoffice admin complet + Docker + VPS + tests d'intégration**

**Réalisations :**
- **Backoffice /manage complet** :
  - CRUD activités : liste paginée, filtres, tri, upload bannière + miniature WebP
  - CRUD sessions : tri serveur sur toutes les colonnes
  - CRUD catégories : blocage suppression si liée à une activité
  - Correction homepage : 4 prochaines sessions à venir, tri date ASC
- Variables CSS palette, couleurs d'état sessions/commandes
- **Docker multi-stage** : Dockerfile backend (Node 22 Alpine, builder → runner) + frontend (Nginx Alpine)
- docker-compose.prod.yaml : services db/backend/frontend
- nginx.conf : HTTPS, redirect HTTP→HTTPS, proxy /api/, SPA fallback
- **Déploiement VPS Ionos** : Ubuntu 24.04, SSL Let's Encrypt (Certbot), DNS sharo.fr → 82.165.180.54
- DEPLOY.md complet (procédure, pièges connus, checklist)
- **Tests d'intégration** (Vitest + Supertest) : auth, orders, activities, categories, sessions, users — 116 tests
- **GitHub Actions CI/CD** : pipeline lint → test → build → deploy SSH sur push master
- **PUT /api/users/:id/password** : vérification mot de passe courant, révocation refresh tokens, ownership check
- **AccountSettingsPage** frontend : modifier profil, changer mot de passe, supprimer compte

**Difficultés :**
- **Symlink Prisma migrations** : Prisma cherche `prisma/migrations` relatif au CWD → symlink dans le Dockerfile
- Dépendances prod manquantes (`lucide-react`, `zod`, `dotenv`) → déplacées de devDependencies vers dependencies
- `npm ci` dans Docker : lock file désynchronisé → passage à `npm install`
- Tests CI : isolation BDD insuffisante → suppression `ALTER SEQUENCE`, `deleteMany + createMany` directs
- `role_id` hardcodé en test → dynamique via lookup en base
- Création des sous-répertoires d'upload manquants au démarrage du container

**Veille déploiement :**
- Recherche : "Docker multi-stage build Node.js Prisma migrations symlink"
- Recherche : "Let's Encrypt Certbot Nginx HTTPS configuration"
- Recherche : "argon2 bcrypt password hashing OWASP 2023" → choix argon2id confirmé

---

### Semaine du 01/06/2026 au 07/06/2026
**Objectif : Tests unitaires + Swagger + nettoyage final**

**Réalisations :**
- **35 tests unitaires** : tokens.test.ts (12), auth.test.ts (8), slugify.test.ts (8), getPagination.test.ts (7) — branche unit-tests, mergée dans master
- **Swagger / OpenAPI 3.0** : openapi.yaml + swagger-ui-express sur GET /api/docs (sharo.fr/api/docs)
- Correction chemin openapi.yaml : `import.meta.url` + `fileURLToPath` pour compatibilité Docker
- Nginx : règle spécifique `/api/docs/` avant les autres locations
- Header contextuel frontend (connecté/déconnecté)
- Icône œil afficher/masquer mot de passe
- tsconfig.json : exclusion des tests de la compilation TypeScript (évite les erreurs de build)
- **Migration Prisma** : suppression des colonnes `deleted_at` inutilisées sur activities, categories, sessions (PR #22)
- **Harmonisation API** : GET /api/users/:id wrappé dans `{ success, data }` (PR #24)
- Mise à jour TESTS.md, TODO.md, DEPLOY.md

**Difficultés :**
- Swagger dans Docker : chemin relatif du YAML incompatible → `import.meta.url` + `fileURLToPath`
- Nginx : ordre des blocs `location` (plus spécifique avant le générique) — plusieurs itérations
- `globalSetup.ts` Vitest : plusieurs tentatives pour stabiliser le démarrage en CI sans Docker

**Veille :**
- Recherche : "OpenAPI 3.0 Swagger Express Node.js best practices"
- Recherche : "Prisma soft delete vs hard delete GDPR" — CNIL guide développeurs

---

## BILAN GLOBAL

| Période | Phase | Commits | Livrables clés |
|---------|-------|---------|----------------|
| 08/09 au 14/09/2025 | Conception | 17 | MCD, MLD, wireframes, specs, postgres schema |
| 15/09 au 28/09/2025 | Dev backend v1 | 40 | Premiers controllers CRUD, Prisma migrations, seeding |
| 29/09 au 02/11/2025 | Auth + Biome | 17 | requireAuth, Biome, init frontend |
| *Pause 7 mois* | Recherche d'emploi | — | — |
| 11/05 au 17/05/2026 | Reprise — Auth JWT | 19 | JWT httpOnly complet, monorepo, pages publiques |
| 18/05 au 24/05/2026 | Dev intensif | 46 | Frontend complet, espace client, panier, backoffice scaffold, audit sécu |
| 25/05 au 31/05/2026 | Infra + Tests | 58 | Docker, VPS, CI/CD, 116 tests intégration, PUT password |
| 01/06 au 07/06/2026 | Finalisation | 48 | 35 tests unitaires, Swagger, nettoyage, harmonisation API |

**Total : 244 commits — 24 Pull Requests — 151 tests automatisés**

---

## VEILLE TECHNOLOGIQUE ET SÉCURITÉ

| Date | Sujet | Source | Impact sur le projet |
|------|-------|--------|----------------------|
| Mai 2026 | JWT httpOnly vs localStorage | OWASP JWT Cheat Sheet, RFC 6265 | Adoption cookies httpOnly — abandon localStorage |
| Mai 2026 | Refresh token rotation + race condition | Auth0 docs, hasura.io | Promise singleton `refreshPromise` dans apiFetch |
| Mai 2026 | argon2id vs bcrypt | OWASP Password Storage Cheat Sheet 2023 | Choix argon2id confirmé |
| Mai 2026 | Soft delete et RGPD | CNIL guide développeurs | `deleted_at` sur users + orders |
| Mai 2026 | bfcache (back-forward cache) | MDN Web Docs, web.dev | Guard réseau au montage des pages protégées |
| Mai 2026 | SameSite=Strict et CSRF | OWASP CSRF Cheat Sheet | Configuration cookie renforcée |
| Mai 2026 | Prisma requêtes paramétrées | Documentation Prisma officielle | Confirmation : zéro injection SQL via ORM |
| Juin 2026 | Docker multi-stage + Prisma migrations | Documentation Docker + Prisma | Symlink `prisma/migrations` dans Dockerfile |
| Juin 2026 | OpenAPI 3.0 / Swagger | Documentation swagger-ui-express | API interactive sur /api/docs |
