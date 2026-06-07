# Tests — Infrastructure Vitest + Auth
> zombiezone — branche `master` — état au 2026-06-08
> Stratégie : tests d'intégration (route HTTP → controller → PostgreSQL réelle), pyramide priorisée par ROI

---

## 1. Dépendances installées

```bash
# dans backend/
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
```

- **vitest** — runner natif ESM + TypeScript, globals activés, syntaxe Jest-compatible
- **@vitest/coverage-v8** — coverage via V8
- **supertest** — requêtes HTTP sur l'app Express sans démarrer un vrai serveur réseau

Pas de `ts-node`, pas de Babel. Vitest gère tout.

---

## 2. Structure réelle des fichiers

```
backend/
├── vitest.config.ts
├── docker-compose.test.yaml
├── .env.test                              ← gitignored
├── src/
│   ├── __tests__/
│   │   ├── globalSetup.ts                 ← démarre Docker PG, applique schema, seed roles
│   │   ├── setup.ts                       ← resetDatabase, createTestUser, createTestAdmin
│   │   ├── auth.test.ts
│   │   ├── activities.test.ts
│   │   ├── categories.test.ts
│   │   ├── sessions.test.ts
│   │   ├── orders.test.ts
│   │   └── users.test.ts
│   ├── helpers/
│   │   └── getPagination.test.ts          ← test unitaire
│   ├── lib/
│   │   ├── token.test.ts                  ← test unitaire
│   │   └── auth.test.ts                   ← test unitaire
│   └── utils/
│       └── slugify.test.ts                ← test unitaire
```

---

## 3. `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './src/__tests__/globalSetup.ts',
    environment: 'node',
    globals: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL
        ?? 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test',
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL
        ?? 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test',
    },
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
    reporters: ['verbose'],
    fileParallelism: false,   // un seul worker — évite les conflits BDD entre fichiers parallèles
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: {
    conditions: ['node'],
  },
});
```

**`fileParallelism: false`** — tous les fichiers de test s'exécutent séquentiellement. Nécessaire car ils partagent la même BDD de test.

---

## 4. `docker-compose.test.yaml`

```yaml
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zz_test
      POSTGRES_PASSWORD: zz_test_pass
      POSTGRES_DB: zombiezone_test
    ports:
      - "54320:5432"          # port différent du dev (5432)
    tmpfs:
      - /var/lib/postgresql/data   # en RAM — pas de persistence, plus rapide
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zz_test -d zombiezone_test"]
      interval: 2s
      timeout: 5s
      retries: 10
```

**`tmpfs`** — les données vivent en RAM. Aucune écriture disque, reset instantané.
**Port `54320`** — ne conflicte pas avec la DB de dev sur `5432`.

---

## 5. `.env.test`

```dotenv
DATABASE_URL="postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test"
TEST_DATABASE_URL="postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test"
NODE_ENV=test
PORT=3001
JWT_ACCESS_SECRET=test-access-secret-not-for-prod
JWT_REFRESH_SECRET=test-refresh-secret-not-for-prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 6. Scripts `package.json`

```json
"test": "dotenv -e .env.test -- vitest run",
"test:watch": "dotenv -e .env.test -- vitest",
"test:coverage": "dotenv -e .env.test -- vitest run --coverage",
"test:integration": "vitest run src/__tests__",
"test:unit": "dotenv -e .env.test -- vitest run src/lib src/utils src/helpers",
"db:reset:test": "DATABASE_URL='postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test' prisma migrate reset --force --schema=./src/models/schema.prisma"
```

`dotenv-cli` injecte `.env.test` avant que Vitest lance les workers.

---

## 7. `globalSetup.ts` — démarrage Docker + schema + seed roles

```typescript
// src/__tests__/globalSetup.ts
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const COMPOSE_FILE = path.join(ROOT, 'docker-compose.test.yaml');
const TEST_DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test';

export async function setup() {
  // En local : démarre le container Docker
  // En CI : PostgreSQL éphémère déjà fourni par le runner GitHub Actions
  if (!process.env.CI) {
    console.log('\n🐘 Démarrage PostgreSQL de test...');
    execSync(`docker compose -f ${COMPOSE_FILE} up -d --wait`, { stdio: 'inherit' });
  }

  process.env.DATABASE_URL = TEST_DATABASE_URL;

  // Applique le schema Prisma sur la DB de test (db push, pas migrate deploy)
  execSync('npx prisma db push --schema=./src/models/schema.prisma --accept-data-loss', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });

  // Seed roles une seule fois — partagés entre tous les tests
  const prisma = new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });
  await prisma.$connect();
  await prisma.roles.createMany({
    data: [{ name: 'member' }, { name: 'admin' }],
    skipDuplicates: true,
  });
  await prisma.$disconnect();

  console.log('✅ PostgreSQL test prête\n');
}

export async function teardown() {
  // En CI : coupe le container après les tests
  if (process.env.CI === 'true') {
    execSync(`docker compose -f ${COMPOSE_FILE} down`, { stdio: 'inherit' });
    console.log('🛑 PostgreSQL test arrêtée (CI)');
  }
  // En local : on laisse le container vivant (redémarrage quasi instantané au prochain run)
}
```

**Différence locale vs CI :**
- Local : le container Docker est géré par `globalSetup`
- CI (GitHub Actions) : PostgreSQL éphémère fourni comme service dans le runner — `CI=true` désactive le Docker Compose

---

## 8. `setup.ts` — reset BDD + helpers de création

```typescript
// src/__tests__/setup.ts
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from 'vitest';
import { hashPassword } from '../lib/auth.js';

export const prismaTest = new PrismaClient({ log: [] });

export async function resetDatabase() {
  await prismaTest.$transaction([
    prismaTest.orders_lines.deleteMany(),
    prismaTest.orders.deleteMany(),
    prismaTest.refreshToken.deleteMany(),
    prismaTest.activities_categories.deleteMany(),
    prismaTest.sessions.deleteMany(),
    prismaTest.activities.deleteMany(),
    prismaTest.categories.deleteMany(),
    prismaTest.users.deleteMany(),
    // roles : initialisés une seule fois dans globalSetup, jamais supprimés
  ]);
}

beforeAll(async () => {
  await prismaTest.$connect();
});

afterAll(async () => {
  await resetDatabase();
  await prismaTest.$disconnect();
});

export async function createTestUser(
  overrides: { email?: string; password?: string; roleName?: 'member' | 'admin' } = {},
) {
  const email = overrides.email ?? 'test@zombiezone.fr';
  const password = overrides.password ?? 'Test1234!';
  const role = await prismaTest.roles.findUniqueOrThrow({
    where: { name: overrides.roleName ?? 'member' }
  });
  const password_hash = await hashPassword(password);
  return prismaTest.users.create({
    data: {
      firstname: 'Test',
      lastname: 'User',
      email,
      password_hash,
      role_id: role.id,
      email_verified_at: new Date(),  // nécessaire — createOrder bloqué à 403 si non vérifié
    },
    select: { id: true, email: true, role_id: true },
  });
}

export async function createTestAdmin(overrides: { email?: string; password?: string } = {}) {
  return createTestUser({
    email: overrides.email ?? 'admin@zombiezone.fr',
    password: overrides.password ?? 'Admin1234!',
    roleName: 'admin',
  });
}
```

**`beforeAll` / `afterAll` par fichier** — `setup.ts` est chargé via `setupFiles` pour chaque fichier de test. Chaque suite démarre avec une connexion Prisma et se déconnecte proprement à la fin.

**`resetDatabase()` appelé dans `beforeEach`** dans chaque fichier de test — chaque test repart d'une base vierge.

**`email_verified_at: new Date()`** — obligatoire depuis l'implémentation de la vérification email. Sans ça, `createOrder` retourne 403.

---

## 9. Pattern utilisé dans les fichiers de test

```typescript
// src/__tests__/auth.test.ts — extrait
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { createTestUser, prismaTest, resetDatabase } from './setup.js';

// Helper : extrait un cookie depuis les headers Set-Cookie
function getCookie(res: request.Response, name: string): string | undefined {
  const cookies = res.headers['set-cookie'] as string[] | string | undefined;
  if (!cookies) return undefined;
  const list = Array.isArray(cookies) ? cookies : [cookies];
  return list.find((c) => c.startsWith(`${name}=`));
}

// Helper : login + retourne un agent avec cookies persistants
async function loginAgent(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await resetDatabase();  // base vierge avant chaque test
  });

  it('crée un utilisateur et retourne 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstname: 'John', lastname: 'Doe',
              email: 'john@zombiezone.fr', password: 'Test1234!', confirm: 'Test1234!' });

    expect(res.status).toBe(201);
    expect(res.body.data.password_hash).toBeUndefined(); // jamais retourné
  });
});
```

**`request.agent(app)`** — maintient les cookies entre les requêtes. Nécessaire pour les tests qui font login puis accèdent à une route protégée.

**`request(app)`** sans agent — pour les requêtes sans état (pas de cookie à maintenir).

---

## 10. Cas couverts — auth.test.ts

| Endpoint | Cas testés |
|---|---|
| `POST /api/auth/register` | 201 valide, cookies httpOnly posés, 409 email dupliqué, 400 password faible, 400 confirm mismatch |
| `POST /api/auth/login` | 200 valide + cookies, 401 password faux, 401 email inexistant, 400 payload incomplet, message identique email/password (anti-oracle) |
| `POST /api/auth/logout` | 200 + cookies effacés (Max-Age=0), RefreshToken supprimé en BDD, 200 idempotent sans cookie |
| `POST /api/auth/refresh` | 200 + nouveaux cookies, rotation en BDD (ancien id ≠ nouveau), 401 replay attack, 401 sans cookie, 401 token forgé |
| `GET /api/auth/profile` | 200 + pas de password_hash, 401 sans cookie, 401 token invalide |

**Total auth : 18 tests**

---

## 11. Différences avec le document original

| Point | Document original | Réalité |
|---|---|---|
| Branche | `customer-account-dev` | `master` |
| Structure dossier | `src/tests/setup/` + `src/tests/auth/` | `src/__tests__/` (tout au même niveau) |
| `testSetup.ts` | `beforeEach` + deleteMany séparés | `beforeAll` connect + `afterAll` reset/disconnect — `resetDatabase()` appelé en `beforeEach` dans chaque fichier |
| Reset BDD | `deleteMany` sequentiels | `$transaction([deleteMany, ...])` — atomique |
| `globalSetup` | `migrate deploy` | `db push --accept-data-loss` (plus rapide en test) |
| Factories | `factories.ts` avec faker | `createTestUser` / `createTestAdmin` dans `setup.ts` — pas de faker |
| Scripts | `dotenv -e .env.test` | identique ✅ |
| `vitest.config.ts` | `pool: forks` + `singleFork` | `fileParallelism: false` — même effet |
| `email_verified_at` | absent | **requis** dans `createTestUser` depuis l'implémentation email verification |
