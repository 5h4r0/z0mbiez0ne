# TESTS.md — zombiezone
> Plan de tests, stack, structure et concepts. Référence projet.

---

## Concepts clés

### Les 3 types de tests

| Type            | Ce qu'on teste                                             | Vitesse | Priorité |
|-----------------|------------------------------------------------------------|---------|----------|
| **Intégration** | Route HTTP → controller → BDD (plusieurs couches ensemble) | Moyen   | ⭐ 1      |
| **Unitaire**    | Fonction isolée (helper, validator, util)                  | Rapide  | ⭐ 2      |
| **E2E**         | Flow complet navigateur (login → commande → annulation)    | Lent    | ⭐ 3      |

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

| Outil         | Rôle                                                                                         |
|---------------|----------------------------------------------------------------------------------------------|
| **Vitest**    | Runner — exécute les tests, fournit `describe` / `it` / `expect`, génère le coverage         |
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
    │   ├── globalSetup.ts        ← démarrage Docker + db push + seed roles
    │   ├── tsconfig.json         ← types Node + vitest/globals pour VSCode
    │   ├── auth.test.ts          ✅ 18 tests
    │   ├── orders.test.ts        ✅ 21 tests
    │   ├── activities.test.ts    ✅ 19 tests
    │   ├── categories.test.ts    ✅ 22 tests
    │   ├── sessions.test.ts      ✅ 24 tests
    │   └── users.test.ts         ✅ 25 tests
    ├── utils/
    │   ├── slugify.ts
    │   └── slugify.test.ts       ✅
    ├── helpers/
    │   ├── pagination.ts
    │   └── pagination.test.ts    ✅
    └── lib/
        ├── tokens.ts
        └── tokens.test.ts        ✅
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

|                | `npm install`        | `npm ci`                |
|----------------|----------------------|-------------------------|
| Usage          | Dev local            | CI / Docker prod        |
| Lock file      | Met à jour si besoin | Échoue si désynchronisé |
| `node_modules` | Incrémental          | Supprime et recrée      |
| Garantie       | Non                  | Reproductible exact     |

Dans `Dockerfile.backend` prod : `npm ci --omit=dev` — installe uniquement les `dependencies`, pas les `devDependencies`.

### `@types/supertest` — pourquoi ?

Supertest est une lib JavaScript — `@types/supertest` fournit les types TypeScript pour l'autocomplétion et la vérification statique.

### `vitest/globals` — pas de `@types/vitest`

Vitest expose ses types nativement — `@types/vitest` est déprécié depuis la v1.0. Les types sont disponibles via `"types": ["node", "vitest/globals"]` dans `tsconfig.json`, après installation de `vitest`.

---

## Scripts

Dans `backend/package.json` :

```json
"test": "dotenv -e .env.test -- vitest run",
"test:watch": "dotenv -e .env.test -- vitest",
"test:coverage": "dotenv -e .env.test -- vitest run --coverage",
"test:integration": "vitest run src/__tests__",
"test:unit": "dotenv -e .env.test -- vitest run src/lib src/utils src/helpers"
```

---

## Variable d'environnement

Dans `backend/.env` :

```dotenv
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/zombiezone_test"
```

La BDD de test est **séparée** de la BDD de dev — elle est réinitialisée entre chaque suite de tests.
Jamais sur la BDD de prod.

---

## Où tournent les tests ?

| Contexte          | Quand                  | BDD                                       |
|-------------------|------------------------|-------------------------------------------|
| Local             | `npm run test` manuel  | `zombiezone_test` locale                  |
| CI GitHub Actions | push sur `master` / PR | `zombiezone_test` éphémère dans le runner |
| Prod (VPS)        | jamais                 | —                                         |

---

## Points d'architecture découverts via les tests

### Hard delete vs Soft delete

| Entité       | Stratégie                  | Note                                            |
|--------------|----------------------------|-------------------------------------------------|
| `users`      | Soft delete (`deleted_at`) | ✅ cohérent                                      |
| `orders`     | Soft delete (`deleted_at`) | ✅ cohérent                                      |
| `activities` | Hard delete                | intentionnel — permet suppression fichier image |
| `categories` | Hard delete                | intentionnel — permet suppression fichier image |
| `sessions`   | Hard delete                | intentionnel                                    |

⚠️ `deleted_at` présent dans le schéma sur `activities`, `categories`, `sessions` mais inutilisé — migration à prévoir pour nettoyer.

### Incohérence API — wrapper `{ success, data }`

`GET /api/users/:id` retourne la réponse directement sans wrapper `{ success, data }`, contrairement aux autres endpoints. À harmoniser lors d'un refactor ou documenter dans Swagger.

---

## Plan d'implémentation

### Priorité 1 — Intégration backend ✅ 129/129

| Suite                  | Tests | Couverture                                                                              |
|------------------------|-------|-----------------------------------------------------------------------------------------|
| `auth.test.ts` ✅       | 18    | register, login, logout, refresh (rotation), profile, cookies httpOnly                  |
| `orders.test.ts` ✅     | 21    | POST/GET/PUT/DELETE, taxes, user_id sécurisé, transitions statut, soft delete           |
| `activities.test.ts` ✅ | 19    | CRUD, slug auto, hard delete, 401/403/404                                               |
| `categories.test.ts` ✅ | 22    | CRUD, slug auto, hard delete, 409 si liée à activity                                   |
| `sessions.test.ts` ✅   | 24    | CRUD, filtre statut, hard delete, 400 si order_lines                                   |
| `users.test.ts` ✅      | 25    | GET list admin, GET/:id, PUT, PUT password, révocation refresh tokens, soft delete, 401/403 |

### Priorité 2 — Unitaires ✅ 35 tests

- `lib/tokens.test.ts` — `generateAccessToken` / `generateRefreshToken`
- `lib/auth.test.ts` — helpers auth
- `utils/slugify.test.ts` — `slugify()`
- `helpers/getPagination.test.ts` — `getPagination()`

### Priorité 3 — E2E Playwright ⬜

- Flow login → commande → annulation
- Flow admin → CRUD activité

---

## setup.ts — fonctionnement

- **`prismaTest`** : client Prisma connecté à `TEST_DATABASE_URL`
- **`resetDatabase()`** : vide les tables dans l'ordre FK sans toucher aux rôles. Les rôles sont seedés une seule fois dans `globalSetup.ts` via `roles.createMany({ skipDuplicates: true })`.
- **`createTestUser()`** : crée un user member en BDD avec mot de passe hashé
- **`createTestAdmin()`** : idem avec `role_id: 1`

### Ordre FK dans resetDatabase()

```
orders_lines → orders → RefreshToken → activities_categories
→ sessions → activities → categories → users
```

---

## Conventions

- `beforeEach` → `resetDatabase()` — chaque test part d'une BDD propre
- `afterEach` non nécessaire — le reset avant suffit
- Jamais de dépendance entre tests (ordre d'exécution non garanti)
- `request.agent(app)` pour les tests nécessitant des cookies persistants entre requêtes
- Ne jamais tester l'implémentation interne — tester le **comportement observable** (status HTTP, body, cookies)
- Pas de `!` non-null assertion — guard clauses explicites

---

## Architecture tests — point clé

Le contrôleur Express utilise `prisma` (connexion principale). Pour que les tests tapent la bonne BDD :
- `vitest.config.ts` : `env: { NODE_ENV: 'test' }`
- `models/index.ts` : si `NODE_ENV === 'test'`, utiliser `TEST_DATABASE_URL`

Sans ça, `resetDatabase()` vide la BDD de test mais Express continue de lire la BDD de dev.

---

## CI/CD ✅

Pipeline actif sur GitHub Actions :

```
lint → test → build → deploy
```
