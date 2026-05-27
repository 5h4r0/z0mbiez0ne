# TESTS.md — zombiezone
> Plan de tests, stack, structure et concepts. Référence projet.

---

## Concepts clés

### Les 3 types de tests

| Type | Ce qu'on teste | Vitesse | Priorité |
|------|---------------|---------|----------|
| **Intégration** | Route HTTP → controller → BDD (plusieurs couches ensemble) | Moyen | ⭐ 1 |
| **Unitaire** | Fonction isolée (helper, validator, util) | Rapide | ⭐ 2 |
| **E2E** | Flow complet navigateur (login → commande → annulation) | Lent | ⭐ 3 |

**Pourquoi l'intégration en premier ?**
Un test d'intégration couvre router + controller + BDD en une seule passe — meilleur ROI pour un backend Express.

---

### Vocabulaire

**Assert** — vérifier qu'un résultat correspond à ce qu'on attend :
```ts
expect(res.status).toBe(200)       // si faux → test échoue
expect(res.body.email).toBeDefined()
```

**Coverage** (couverture de code) — mesure quel pourcentage du code source est exécuté pendant les tests :
```
auth.controller.ts   87% | lignes non testées : 42, 67
tokens.ts           100% | tout couvert
```
Objectif zombiezone : **≥ 80%** sur le backend.
⚠️ Un bon coverage ne garantit pas des tests pertinents — il garantit que le code est traversé.

---

### Stack retenue

| Outil | Rôle |
|-------|------|
| **Vitest** | Runner — exécute les tests, fournit `describe` / `it` / `expect`, génère le coverage |
| **Supertest** | Simule des requêtes HTTP sur l'app Express **sans démarrer de serveur** (pas de port ouvert) |

Ce sont des outils **complémentaires**, pas concurrents :
- Supertest fait `request(app).post('/api/auth/login').send({...})`
- Vitest fournit le cadre autour (`beforeEach`, `expect`, rapport d'erreurs)

Supertest n'est pas un client HTTP classique comme axios — il monte l'app Express directement
en mémoire via `http.createServer(app)`, bind sur un port aléatoire éphémère, envoie la requête,
puis ferme. Pas de serveur à démarrer, pas de conflit de port.

---

## Structure des fichiers

Approche **hybride** — intégration centralisée, unitaires colocalisés :

```
backend/
├── vitest.config.ts              ← config runner (pool, timeout, setupFiles)
└── src/
    ├── __tests__/                ← intégration uniquement (multi-couches)
    │   ├── setup.ts              ← BDD test, resetDatabase(), helpers
    │   ├── auth.test.ts          ✅ fait
    │   ├── orders.test.ts        ✅ fait
    │   ├── activities.test.ts    ⬜ à faire
    │   ├── sessions.test.ts      ⬜ à faire
    │   ├── categories.test.ts    ⬜ à faire
    │   └── users.test.ts         ⬜ à faire
    ├── utils/
    │   ├── slugify.ts
    │   └── slugify.test.ts       ← unitaire colocalisé
    ├── helpers/
    │   ├── pagination.ts
    │   └── pagination.test.ts    ← unitaire colocalisé
    └── lib/
        ├── tokens.ts
        └── tokens.test.ts        ← unitaire colocalisé
```

**Règle simple :**
- Test d'**intégration** → `__tests__/` (couvre router + controller + BDD)
- Test **unitaire** → colocalisé avec le fichier testé (supprime le module → le test part avec)

---

## Dépendances

Installer **en local** (jamais sur le VPS) :

```bash
cd backend
npm install --save-dev vitest supertest @types/supertest
git add package.json package-lock.json
git commit -m "build: 🛠 add vitest + supertest"
```

`--save-dev` → ajoute dans `devDependencies` — installé en dev et CI, ignoré en prod.

### `npm install` vs `npm ci`

| | `npm install` | `npm ci` |
|---|---|---|
| Usage | Dev local | CI / Docker prod |
| Lock file | Met à jour si besoin | Échoue si désynchronisé |
| `node_modules` | Incrémental | Supprime et recrée |
| Garantie | Non | Reproductible exact |

Dans `Dockerfile.backend` prod : `npm ci --omit=dev` — installe uniquement les `dependencies`, pas les `devDependencies`.

### `@types/supertest` — pourquoi ?

Supertest est une lib JavaScript — `@types/supertest` fournit les types TypeScript pour l'autocomplétion et la vérification statique.

### `vitest/globals` — pas de `@types/vitest`

Vitest expose ses types nativement — `@types/vitest` est déprécié depuis la v1.0. Les types sont disponibles via `"types": ["node", "vitest/globals"]` dans `tsconfig.json`, après installation de `vitest`.

---

## Scripts

À ajouter dans `backend/package.json` :

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## Variable d'environnement

À ajouter dans `backend/.env` :

```dotenv
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/zombiezone_test"
```

La BDD de test est **séparée** de la BDD de dev — elle est réinitialisée entre chaque suite de tests.
Jamais sur la BDD de prod.

---

## Où tournent les tests ?

| Contexte | Quand | BDD |
|----------|-------|-----|
| Local | `npm run test` manuel | `zombiezone_test` locale |
| CI GitHub Actions | push sur `master` / PR | `zombiezone_test` éphémère dans le runner |
| Prod (VPS) | jamais | — |

---

## Corrections à appliquer

### `setup.ts` — `exactOptionalPropertyTypes`

```ts
// url peut être undefined → cast explicite requis
url: (process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL) as string,
```

### `setup.ts` — noms des modèles Prisma

Les noms dépendent du schéma — vérifier l'autocomplétion :
```ts
prismaTest.ordersLines.deleteMany(),       // ou orders_lines selon le schema
prismaTest.activitiesCategories.deleteMany(), // ou activities_categories
```

### `auth.test.ts` / `orders.test.ts` — import `afterEach`

`afterEach` non utilisé — supprimer de l'import :
```ts
import { beforeEach, describe, expect, it } from 'vitest';
```

---

## Plan d'implémentation

### Priorité 1 — Intégration backend

| Suite | Routes | Cas couverts |
|-------|--------|-------------|
| `auth.test.ts` ✅ | register, login, logout, refresh, profile | cookies httpOnly, rotation refreshToken, révocation BDD, 401/400/409 |
| `orders.test.ts` ✅ | POST/GET/PUT/DELETE /orders | user_id = req.user.id, taxes, soft delete, transitions statut, 401/403/404 |
| `activities.test.ts` ⬜ | CRUD complet | slug auto, soft delete, catégories |
| `sessions.test.ts` ⬜ | CRUD complet | capacité, statut, date |
| `categories.test.ts` ⬜ | CRUD complet | slug, soft delete |
| `users.test.ts` ⬜ | GET/PATCH/DELETE | soft delete, requireRole admin |

### Priorité 2 — Unitaires

- `slugify()`, `getRandom()`, helpers pagination
- Validators Zod (inputs malformés, champs manquants)
- `generateAccessToken` / `generateRefreshToken`

### Priorité 3 — E2E Playwright

- Flow login → commande → annulation
- Flow admin → CRUD activité

---

## setup.ts — fonctionnement

- **`prismaTest`** : client Prisma connecté à `TEST_DATABASE_URL`
- **`resetDatabase()`** : vide toutes les tables dans l'ordre FK (appelé dans `beforeEach` de chaque suite)
- **`createTestUser()`** : crée un user member en BDD avec mot de passe hashé
- **`createTestAdmin()`** : idem avec `role_id: 1`

---

## Conventions

- `beforeEach` → `resetDatabase()` — chaque test part d'une BDD propre
- `afterEach` non nécessaire — le reset avant suffit
- Jamais de dépendance entre tests (ordre d'exécution non garanti)
- `request.agent(app)` pour les tests nécessitant des cookies persistants entre requêtes
- Ne jamais tester l'implémentation interne — tester le **comportement observable** (status HTTP, body, cookies)

---

## CI/CD (à venir)

Les tests s'intégreront dans GitHub Actions :

```
lint → test → build → deploy
```

Voir `TODO global` : item 9 — CI/CD GitHub Actions.
