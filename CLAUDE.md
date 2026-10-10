# CLAUDE.md
> Contexte CC — sharo.fr

Branche active : `main` (`master` supprimée le 10/10/2026 ; sa protection GitHub
gênait plus qu'elle ne protégeait). Tout push sur `main` déploie en production.
Pour un gros chantier, créer une branche dédiée plutôt que travailler
directement sur `main`. Accès au VPS et renouvellement du certificat :
`DEPLOY.md`.

Les conventions communes à tous les projets Node/TypeScript — interdiction de
`any` et de `SELECT *`, Zod sur tous les entrants, guard clauses, suppression
douce, convention de commit avec emoji — sont dans le `CLAUDE.md` global et ne
sont pas répétées ici.

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

## Ports

| | Local | Conteneur de prod |
|---|---|---|
| Backend Express | **4000** (`PORT` dans `backend/.env`) | 3000, derrière nginx (`docker/nginx.conf`) |
| Front Vite | 5173, proxifie `/api` vers 4000 | servi par nginx sur le port 80 |

Le backend est passé de 3000 à 4000 en local le 09/10/2026 : `next dev` de
kadath.fr occupe le 3000. Le défaut `3000` de `src/config/config.ts` et le
`proxy_pass backend:3000` de nginx restent inchangés — c'est ce couple qui
fait tourner la prod.

`npm run dev:back` exige `backend/.env` (le script passe `--env-file=.env`) :
le copier depuis `backend/.env.example` avant le premier lancement.

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

## Règles propres à ce projet

- **Suppression douce** sur `users`, `categories`, `activities`, `sessions`, `orders` : `deleted_at` (NULL = actif).
- Prisma : `select` explicite, jamais de sélection globale.

---

## Zod — règle absolue : lire le controller, pas le schema Prisma

Quand on écrit un schéma Zod pour parser une réponse API :
- **Toujours lire le controller concerné** avant d'écrire le schéma
- **Jamais inférer depuis schema.prisma** — le controller transforme les données :
  - `Decimal` Prisma → `number` (ex: unit_price, total_amount)
  - `Date` Prisma → `string` formatée par date-fns (ex: session.date)
  - Relations → aplaties ou restructurées (ex: role object → role string)
  - Champs calculés absents du modèle (ex: available_capacity)
- Le contrat API = la sortie du controller, pas le modèle BDD

Violation détectée le 2026-05-24 :
- manageSessionSchema : unit_price z.string() au lieu de z.number()
- manageSessionSchema : date attendue ISO, reçue string formatée date-fns
- manageUserSchema : role z.object({id, name}) au lieu de z.string()

---

## Auth JWT — règles absolues

→ Détail complet : `.claude/skills/auth.md`
