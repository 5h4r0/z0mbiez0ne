# 🧟 ZombieZone

Parc d'attractions fictif post-apocalyptique — projet pédagogique fullstack TypeScript.  
Monorepo `backend/` + `vite-frontend/`, déployé sur **sharo.fr**.

---

## 🗂️ Zones de l'application

| Zone             | URL                    | Description                               |
|------------------|------------------------|-------------------------------------------|
| Site vitrine     | `sharo.fr/`            | Activités, sessions, tarifs, contact      |
| Espace client    | `sharo.fr/dashboard`   | Compte, commandes, annulation             |
| Backoffice admin | `sharo.fr/manage`      | Gestion activités, sessions, utilisateurs |

---

## 📂 Structure monorepo

```
zombiezone/
├── backend/                  → API REST Express 5 + Prisma + PostgreSQL
├── vite-frontend/            → SPA React 19 + Vite + React Router 7 + Zustand
├── docker/                   → Dockerfiles + nginx.conf
├── conception/               → Docs de conception, ERD, mockups, specs
├── docker-compose.prod.yml   → Orchestration prod
├── CLAUDE.md                 → Référence Claude Code
├── CLAUDE_AI.md              → Référence claude.ai
└── DEPLOY.md                 → Procédure de déploiement VPS
```

### Backend `backend/src/`

```
app.ts                        # App Express (middlewares, routes)
index.ts                      # Point d'entrée serveur
config/                       # Variables centralisées
controllers/                  # Logique métier
routers/                      # Routes Express
middlewares/                  # requireAuth, requireRole
lib/                          # auth, tokens, errors, constants
helpers/                      # getPagination
utils/                        # slugify, getRandom, barrel
types/                        # Types TypeScript partagés
models/
├── schema.prisma             # Source de vérité BDD
├── migrations/               # Migrations Prisma versionnées
├── seeding.ts                # Seed données de test
└── postgres_schema.psql      # Script SQL optionnel
```

### Frontend `vite-frontend/src/`

```
main.tsx                      # Point d'entrée React
components/                   # Composants partagés (Header, Footer, Pagination…)
pages/
├── (vitrine)                 # HomePage, ActivitiesPage, SessionsPage…
├── dashboard/                # DashboardPage, OrderDetailPage
└── manage/                   # ManageHubPage, CRUD activités/sessions/catégories/users
store/
├── authStore.ts              # Auth (user, login, logout, refresh)
├── basketStore.ts            # Panier
└── store.ts                  # Thème (isDark)
hooks/                        # Hooks personnalisés
lib/                          # apiFetch (intercepteur 401 + refresh)
types/                        # Types partagés
utils/                        # Helpers frontend
styles/                       # CSS global
```

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 22+
- PostgreSQL (local ou via Docker)
- Fichier `backend/.env` (voir `backend/.env.example`)

### Installation

```bash
npm run install:all
```

### Développement

```bash
npm run dev          # backend + frontend en parallèle
npm run dev:back     # backend seul  (localhost:3000)
npm run dev:front    # frontend seul (localhost:5173)
```

### Build

```bash
npm run build        # backend (tsc → dist/) + frontend (vite build → dist/)
```

---

## 🗄️ Base de données

```bash
npm run db:dev              # Créer et appliquer une migration (dev)
npm run db:dev -- --name <nom>  # Avec nom explicite
npm run db:reset            # ⚠️ Reset complet (drop + migrate + seed)
npm run db:seed             # Insérer les données de test
npm run db:gen              # Régénérer le client Prisma après modif schema
npm run db:deploy           # Appliquer les migrations en prod (sans prompt)
npm run db:studio           # Ouvrir Prisma Studio
npm run db:pull             # DB-first : introspection → schema.prisma
npm run db:format           # Formater schema.prisma
npm run db:sql              # Appliquer postgres_schema.psql via psql
```

---

## 🐳 Docker

```bash
docker compose -f docker-compose.prod.yml up -d --build   # Build + démarrage
docker compose -f docker-compose.prod.yml down             # Arrêt
docker compose -f docker-compose.prod.yml logs -f          # Logs en temps réel
```

Services : `db` (PostgreSQL 16), `backend` (Node 22), `frontend` (Nginx + build Vite).

→ Voir `DEPLOY.md` pour la procédure complète de déploiement VPS.

---

## 🔐 Auth & sécurité

- **JWT** : access token 15 min + refresh token 7 j — **exclusivement en cookie `httpOnly`**
- Jamais `localStorage` / `sessionStorage`
- `credentials: 'include'` obligatoire sur tous les fetch auth
- `sameSite: 'strict'` + `Cache-Control: no-store` sur les routes protégées
- Guard réseau au montage des pages protégées (protection bfcache)

---

## 🧩 Conventions de code

- **Guard Clauses** — retour précoce plutôt qu'imbrication
- **Lookup Objects** — plutôt que `switch` / `else if` enchaînés
- **Ternaires** — 1 niveau max dans le JSX
- **`??`** — plutôt que `||` pour les valeurs par défaut
- **`async/await`** — pas de `.then/.catch` chaînés
- **Zod** — validation sur tous les inputs entrants (body, params, query)
- **Pas de `any`** TypeScript
- **Pas de `SELECT *`** — colonnes explicites via `select` Prisma
- **Soft delete** — `deleted_at` (NULL = actif) sur les entités sensibles

---

## 🗃️ Modèle de données

Entités : `roles`, `users`, `RefreshToken`, `categories`, `activities`, `activities_categories`, `sessions`, `orders`, `orders_lines`

Enums : `OrderStatus` (Pending / Confirmed / Cancelled / Refunded) · `SessionStatus` (Scheduled / Cancelled / Completed)

---

## 📜 Commits

| Type        | Emoji | Description                          |
|-------------|:-----:|--------------------------------------|
| `feat`      | ✨    | Nouvelle fonctionnalité              |
| `fix`       | 🐛    | Correction de bug                    |
| `wip`       | 🚧    | Work in progress                     |
| `docs`      | 📚    | Documentation                        |
| `style`     | 💎    | Formatage sans impact logique        |
| `refactor`  | 📦    | Refactoring                          |
| `perf`      | 🚀    | Performance                          |
| `test`      | 🚨    | Tests                                |
| `build`     | 🛠    | Build / dépendances                  |
| `ci`        | ⚙️    | CI/CD                                |
| `chore`     | ♻️    | Tâches diverses                      |
| `revert`    | 🗑    | Annulation commit                    |

---

## 🌿 Branches

```
main                   → production (sharo.fr)
admin-backoffice-dev   → branche de travail active
```

Jamais de commit direct sur `main`.

---

## 📚 Références

- [`DEPLOY.md`](./DEPLOY.md) — procédure déploiement VPS Ionos
- [`CLAUDE.md`](./CLAUDE.md) — référence Claude Code
- [`conception/`](./conception/) — ERD, mockups, specs
