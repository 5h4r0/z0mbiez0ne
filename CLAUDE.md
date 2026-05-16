# CLAUDE.md
> Contexte rapide pour Claude Code — référence de session

---

## Project Overview

**zombiezone.kadath.fr** — parc d'attractions fictif post-apocalyptique. Projet pédagogique fullstack TypeScript, monorepo `backend/` + `vite-frontend/`.

### Zones

| Zone             | URL                                        | Description                              |
|------------------|--------------------------------------------|------------------------------------------|
| Site vitrine     | `zombiezone.kadath.fr/fr` · `/en`          | Activités, réservation, contact          |
| Espace client    | `zombiezone.kadath.fr/espace-client`       | Compte, commandes, annulation            |
| Backoffice admin | `zombiezone.kadath.fr/manage`              | Gestion activités, sessions, utilisateurs|

---

## Structure monorepo

```
backend/          → API REST Express 5 + Prisma + PostgreSQL
vite-frontend/    → React 19 + Vite + React Router 7 + Zustand
docker/           → docker-compose, Dockerfiles
```

---

## Commands

### Backend
```bash
npm run dev           # dev server avec hot-reload (tsx --watch)
npm run build         # compile TypeScript → dist/
npm run start         # prod (dist/, .env)
npm run start:prod    # prod (.env.production)
npm run lint          # Biome check
npm run fix           # Biome check --write

# Base de données (Prisma)
npm run db:dev        # migrate dev (crée migration + applique)
npm run db:reset      # reset complet (⚠️ drop + re-migrate)
npm run db:deploy     # migrate deploy (CI/prod — pas de prompt)
npm run db:seed       # seed données de test
npm run db:studio     # Prisma Studio (UI BDD)
npm run db:gen        # régénère le client Prisma après modif schema
```

### Frontend
```bash
npm run dev           # Vite dev server (localhost:5173)
npm run build         # tsc + vite build → dist/
npm run preview       # prévisualiser le build
npm run lint          # Biome check
npm run fix           # Biome check --write
```

### Docker
```bash
docker compose up -d          # démarre tous les services
docker compose down           # arrête et supprime les conteneurs
docker compose logs -f        # logs en temps réel
docker compose up --build     # rebuild les images avant démarrage
```

---

## Conventions de code

- **Guard Clauses** plutôt qu'imbrication
- **Lookup Objects** plutôt que `switch` / `else if`
- **Ternaires** : 1 niveau max dans le JSX
- **`??`** plutôt que `||` pour les valeurs par défaut

---

## Architecture

### Backend — Express 5 + Prisma

- **Auth** : JWT access token (15min) + refresh token (7j, httpOnly cookie)
- **Rôles** : `admin`, `user` — middleware `requireRole`
- **Validation** : Zod sur tous les inputs entrants
- **Erreurs** : classes custom dans `src/lib/errors.ts`
- **Pagination** : helper `getPagination` dans `src/helpers/`
- **Schéma** : `backend/src/models/schema.prisma` — source de vérité
- **Migrations** : `backend/src/models/migrations/`

### Modèle de données (Prisma)

Entités principales : `roles`, `users`, `RefreshToken`, `categories`, `activities`, `sessions`, `orders`, `order_lines`

Enums : `OrderStatus` (Pending / Confirmed / Cancelled / Refunded), `SessionStatus` (Scheduled / Cancelled / Completed)

Soft delete : `deleted_at` sur `users` (et à appliquer sur les autres entités sensibles).

### Frontend — React 19 + Vite

- **Routing** : React Router 7
- **State global** : Zustand
- **Pas de SSR** — SPA pure, fetches vers l'API backend
- **Auth** : token JWT stocké côté client, refresh via cookie httpOnly

### I18n

- Support `/fr` et `/en` prévu — à implémenter (pas encore en place)

---

## Stack Decisions (ne pas revisiter sans raison forte)

- **Express 5** — pas Fastify / Hono
- **Prisma** — pas Drizzle / Kysely
- **PostgreSQL** — pas MySQL
- **argon2** — hachage mots de passe (pas bcrypt)
- **JWT** — pas de session serveur (stateless)
- **Biome** — pas ESLint + Prettier
- **NPM** — pas pnpm/yarn (monorepo workspaces)
- **Vite** — pas CRA / Next.js
- **Zustand** — pas Redux / Context seul
- **Docker** — conteneurisation dev + prod (VPS)

---

## Règles de développement

- **Pas de `any`** en TypeScript
- **Colonnes explicites** — pas de `SELECT *` (Prisma : utiliser `select`)
- **Soft delete** sur les données sensibles — `deleted_at` (NULL = actif)
- **Zod** sur tous les inputs entrants (body, params, query)
- Toujours travailler sur la branche `dev`
- Jamais commiter sur `main` directement

---

## Convention commits

| Type       | Emoji | Description                   |
|------------|-------|-------------------------------|
| `feat`     | ✨     | Nouvelle fonctionnalité       |
| `fix`      | 🐛    | Correction de bug             |
| `wip`      | 🚧    | Work in progress              |
| `docs`     | 📚    | Documentation                 |
| `style`    | 💎    | Formatage sans impact logique |
| `refactor` | 📦    | Refactoring                   |
| `perf`     | 🚀    | Performance                   |
| `test`     | 🚨    | Tests                         |
| `build`    | 🛠    | Build / dépendances           |
| `ci`       | ⚙️    | CI/CD                         |
| `chore`    | ♻️    | Tâches diverses               |
| `revert`   | 🗑    | Annulation commit             |

---

## Branches Git

```
main   → production
dev    → développement (branche de travail)
```

---

## Environment

### Backend — `.env` (dev local, gitignored)

```dotenv
DATABASE_URL="postgresql://username:password@localhost:5432/zombiezone"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=info
ADMIN_EMAIL=admin@zombiezone.fr
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=ZombieZone
ADMIN_PASSWORD=<mot-de-passe-fort>
JWT_ACCESS_SECRET=<secret-fort>
JWT_REFRESH_SECRET=<secret-fort>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Template versionné : `backend/.env.example`

### Production — `.env.production`

Même variables, avec :
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://zombiezone.kadath.fr`
- Secrets JWT forts obligatoires (le serveur throw au démarrage sinon)

→ Voir `DEPLOY.md` pour la gestion des secrets sur VPS.

---

## État du projet (2026-05-16)

**Livré :**
- Backend API REST complet : auth JWT, activities, categories, sessions, orders, order_lines, users, roles ✅
- Prisma schema + migrations (3 migrations) ✅
- Seeding données de test ✅
- Frontend scaffold : React Router, Zustand store, composants de base ✅

**En cours / pending :**
- Frontend pages : BasketPage, ContactPage, NotFoundPage vides
- I18n `/fr` / `/en` non implémenté
- Déploiement VPS — à définir (Ionos ou autre) → voir `DEPLOY.md`
- Docker prod — Dockerfiles à rédiger
- Tests — plan défini, implémentation pending


---

## gstack

Use `/browse` from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/review`, `/ship`, `/browse`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git stash           # Compact stash
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk docker ps           # Compact container list
rtk docker logs <c>     # Deduplicated logs
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk init                # Add RTK instructions to CLAUDE.md
```

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
