# CLAUDE.md
> Contexte CC — zombiezone.kadath.fr

Branche active : `customer-account-dev` — jamais commiter sur `main`.

---

## Monorepo

```
backend/        → Express 5 + Prisma + PostgreSQL (port 3000)
vite-frontend/  → React 19 + Vite + React Router v7 + Zustand (port 5173)
docker/         → docker-compose
conception/     → ERD, mockups, specs
```

Entités : `users`, `roles`, `RefreshToken`, `categories`, `activities`, `sessions`, `orders`, `orders_lines`
Enums : `OrderStatus` (Pending/Confirmed/Cancelled/Refunded) · `SessionStatus` (Scheduled/Cancelled/Completed)

---

## Commandes essentielles

```bash
# Racine
npm run dev           # backend + frontend en parallèle
npm run build         # build complet

# Backend DB (Prisma)
npm run db:dev        # migrate dev
npm run db:reset      # ⚠️ drop + re-migrate (jamais en prod)
npm run db:deploy     # migrate prod (sans prompt)
npm run db:seed       # seed test
npm run db:gen        # régénère client Prisma après modif schema

# Lint
npm run lint          # Biome check
npm run fix           # Biome --write
```

---

## Stack (ne pas revisiter sans raison forte)

Express 5 · Prisma · PostgreSQL · argon2 · JWT · date-fns · Biome · NPM workspaces · Vite · Zustand · Docker · React Router v7 (pas `react-router-dom`) · TypeScript strict

---

## Règles de code

- Pas de `any` TypeScript
- Pas de `SELECT *` — Prisma : utiliser `select` explicite
- Soft delete : `deleted_at` (NULL = actif) sur `users`, `categories`, `activities`, `sessions`, `orders`
- Zod sur tous les inputs (body, params, query)
- Guard clauses plutôt qu'imbrication · Lookup objects plutôt que switch · `??` plutôt que `||`

---

## Auth JWT — règles absolues

→ Détail complet : `.claude/skills/auth.md`

---

## Convention commits

`feat`✨ `fix`🐛 `wip`🚧 `docs`📚 `style`💎 `refactor`📦 `perf`🚀 `test`🚨 `build`🛠 `ci`⚙️ `chore`♻️ `revert`🗑

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
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status|log|diff|add|commit|push|pull|branch|stash
```

### JS/TS Tooling
```bash
rtk npm run <script>    # Compact npm output
rtk prisma              # Prisma sans ASCII art (88%)
```

### Files & Search
```bash
rtk ls|read|grep|find   # Compact, groupé par fichier
```

### Debug
```bash
rtk err <cmd>           # Errors only
rtk docker ps|logs      # Compact
```

```bash
rtk gain                # Token savings stats
rtk discover            # Missed RTK usage
```
<!-- /rtk-instructions -->
