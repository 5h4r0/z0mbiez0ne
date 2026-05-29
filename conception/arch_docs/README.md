# 🧟 zombiezone

Parc d'attractions fictif post-apocalyptique — projet fullstack TypeScript.

**Stack** : Express 5 + Prisma + PostgreSQL · React 19 + Vite · Docker · JWT httpOnly

**Prod** : [sharo.fr](https://sharo.fr)

---

## Structure
backend/        → API REST Express 5 + Prisma + PostgreSQL
vite-frontend/  → SPA React 19 + Vite + React Router 7 + Zustand
docker/         → Dockerfiles + nginx.conf
conception/     → docs, ERD, specs

---

## Démarrage rapide (dev)

```bash
npm run install:all
npm run dev
```

Frontend : http://localhost:5173  
Backend : http://localhost:3000

---

## Base de données

```bash
npm run db:dev        # migrate dev
npm run db:seed       # seed données de test
npm run db:reset      # ⚠️ reset complet
npm run db:studio     # Prisma Studio UI
```

---

## Déploiement

Voir [DEPLOY.md](./DEPLOY.md).

---

## Conventions

- Guard clauses, lookup objects, ternaires 1 niveau max
- Pas de `any` TypeScript
- Soft delete (`deleted_at`) sur les entités sensibles
- JWT exclusivement en cookie `httpOnly` — jamais localStorage
