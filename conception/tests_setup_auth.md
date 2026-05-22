# Tests — Setup Vitest + Auth
> zombiezone — branche `customer-account-dev`
> Stratégie : component tests (API → PostgreSQL réelle), approche Goldberg "Testing Diamond"

---

## 1. Ce qu'on installe

```bash
# dans backend/
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
```

- **vitest** — runner natif ESM + TypeScript, syntaxe Jest-compatible
- **@vitest/coverage-v8** — coverage via V8 (pas Istanbul, plus rapide)
- **supertest** — requêtes HTTP sur l'app Express sans démarrer un vrai serveur

Pas de `ts-node`, pas de Babel, pas de `--experimental-vm-modules`. Vitest gère tout.

---

## 2. Fichiers à créer / modifier

```
backend/
├── vitest.config.ts                       ← nouveau
├── .env.test                              ← nouveau (gitignored)
├── src/
│   └── tests/
│       ├── setup/
│       │   ├── globalSetup.ts             ← nouveau — démarre Docker PG
│       │   └── testSetup.ts               ← nouveau — nettoyage BDD entre tests
│       └── auth/
│           ├── register.test.ts           ← nouveau
│           ├── login.test.ts              ← nouveau
│           ├── logout.test.ts             ← nouveau
│           ├── refresh.test.ts            ← nouveau
│           └── profile.test.ts            ← nouveau
└── docker-compose.test.yml                ← nouveau
```

---

## 3. `docker-compose.test.yml`

```yaml
# backend/docker-compose.test.yml
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zz_test
      POSTGRES_PASSWORD: zz_test_pass
      POSTGRES_DB: zombiezone_test
    ports:
      - "54320:5432"          # port différent du dev (5432) pour éviter les conflits
    tmpfs:
      - /var/lib/postgresql/data   # en RAM — pas de persistence, ~3x plus rapide
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zz_test -d zombiezone_test"]
      interval: 2s
      timeout: 5s
      retries: 10
```

`tmpfs` est la clé : les données vivent en RAM, aucune écriture disque.
Port `54320` pour ne pas entrer en conflit avec la DB de dev sur `5432`.

---

## 4. `.env.test`

```dotenv
# backend/.env.test  — gitignored
DATABASE_URL="postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test"
NODE_ENV=test
PORT=3001
JWT_ACCESS_SECRET=test-access-secret-not-for-prod
JWT_REFRESH_SECRET=test-refresh-secret-not-for-prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173
```

Port `3001` pour ne pas entrer en conflit avec le backend dev sur `3000`.

---

## 5. `vitest.config.ts`

```typescript
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Lance globalSetup une seule fois avant tous les fichiers de test
    globalSetup: './src/tests/setup/globalSetup.ts',

    // Lance testSetup avant chaque fichier de test
    setupFiles: ['./src/tests/setup/testSetup.ts'],

    // Un seul worker : évite les conflits BDD entre fichiers de test parallèles
    // À passer à >1 une fois qu'on isole par transaction ou schema
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },

    // Variables d'environnement injectées pour tous les tests
    env: {
      NODE_ENV: 'test',
    },

    // Fichiers de test
    include: ['src/tests/**/*.test.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      include: ['src/controllers/**', 'src/middlewares/**', 'src/lib/**'],
      exclude: ['src/models/**', 'src/helpers/**'],
    },
  },
});
```

---

## 6. `globalSetup.ts` — démarrage Docker

```typescript
// backend/src/tests/setup/globalSetup.ts
import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');   // = backend/
const COMPOSE_FILE = path.join(ROOT, 'docker-compose.test.yml');

export async function setup() {
  console.log('\n🐘 Démarrage PostgreSQL de test...');

  // Lance le conteneur (idempotent : si déjà up, ne fait rien)
  execSync(`docker compose -f ${COMPOSE_FILE} up -d --wait`, { stdio: 'inherit' });

  // Injecte l'env de test avant les migrations
  process.env.DATABASE_URL =
    'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test';

  // Applique les migrations Prisma sur la DB de test
  execSync('npx prisma migrate deploy --schema=./src/models/schema.prisma', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });

  console.log('✅ PostgreSQL test prête\n');
}

export async function teardown() {
  // En local : on laisse le conteneur vivant (redémarrage en 3ms)
  // En CI : on le coupe (détecté via CI=true)
  if (process.env.CI === 'true') {
    const COMPOSE_FILE_PATH = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../docker-compose.test.yml'
    );
    execSync(`docker compose -f ${COMPOSE_FILE_PATH} down`, { stdio: 'inherit' });
    console.log('🛑 PostgreSQL test arrêtée (CI)');
  }
}
```

---

## 7. `testSetup.ts` — nettoyage entre fichiers

```typescript
// backend/src/tests/setup/testSetup.ts
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Charge .env.test avant tout — doit précéder l'import de prisma
config({ path: '.env.test' });

const prisma = new PrismaClient();

// Avant chaque fichier de test : nettoie les tables dans l'ordre FK
beforeEach(async () => {
  // Ordre FK : d'abord les dépendants
  await prisma.refreshToken.deleteMany();
  await prisma.orders_lines.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.users.deleteMany();
  // roles reste : données de référence, re-seedées dans globalSetup
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

**Pourquoi `beforeEach` et pas `beforeAll` ?** Chaque test part d'une base vide —
pas de pollution entre les tests d'un même fichier.

**Pourquoi pas de transaction rollback ?** Possible, mais complexe avec Express +
supertest (connexions séparées). Le `deleteMany` est plus simple et assez rapide
sur une DB en `tmpfs`.

---

## 8. Script `package.json` backend

```json
"scripts": {
  "test": "dotenv -e .env.test -- vitest run",
  "test:watch": "dotenv -e .env.test -- vitest",
  "test:coverage": "dotenv -e .env.test -- vitest run --coverage",
  "test:ui": "dotenv -e .env.test -- vitest --ui"
}
```

`dotenv-cli` est déjà installé en devDep — on l'exploite pour injecter `.env.test`
avant que Vitest lance les workers.

---

## 9. Helper partagé : `testApp.ts`

```typescript
// backend/src/tests/setup/testApp.ts
//
// Exporte l'app Express sans démarrer le serveur HTTP.
// supertest crée son propre serveur éphémère à chaque test.

// Charge l'env de test en premier
import { config } from 'dotenv';
config({ path: '.env.test' });

// Ensuite seulement l'app (qui importe config.ts au module load)
export { app } from '../../app.js';
```

Ordre critique : `dotenv.config()` **avant** l'import de `app.ts`,
sinon `config.ts` lit un env vide au premier `import`.

---

## 10. Helper partagé : `factories.ts`

```typescript
// backend/src/tests/setup/factories.ts
//
// Fonctions de création de données de test — chaque test crée ses propres données.
// Goldberg §6 : "each test creates its own data, never relies on shared seed".

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

export interface UserSeed {
  id: number;
  email: string;
  password: string;   // en clair — pour les tests de login
  role_id: number;
}

// Crée un user en BDD avec un mot de passe connu
export async function createUser(overrides?: {
  email?: string;
  password?: string;
  role_id?: number;
}): Promise<UserSeed> {
  const password = overrides?.password ?? 'Test@1234!';
  const email = overrides?.email ?? faker.internet.email();
  const role_id = overrides?.role_id ?? 1;   // 1 = member

  const user = await prisma.users.create({
    data: {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email,
      role_id,
      password_hash: await argon2.hash(password),
    },
    select: { id: true, email: true, role_id: true },
  });

  return { ...user, password };
}

// Retourne les cookies d'un user connecté (pour les tests nécessitant une session)
export async function loginUser(
  request: import('supertest').SuperTest<import('supertest').Test>,
  credentials: { email: string; password: string }
): Promise<string[]> {
  const res = await request
    .post('/api/auth/login')
    .send(credentials);

  // supertest expose les Set-Cookie comme tableau de strings
  return (res.headers['set-cookie'] as string[]) ?? [];
}
```

---

## 11. Les tests — `register.test.ts`

```typescript
// backend/src/tests/auth/register.test.ts
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../setup/testApp.js';
import { PrismaClient } from '@prisma/client';

const request = supertest(app);
const prisma = new PrismaClient();

const validPayload = {
  firstname: 'Alice',
  lastname: 'Zombie',
  email: 'alice@zombiezone.fr',
  password: 'Test@1234!',
  confirm: 'Test@1234!',
  role_id: 1,
};

describe('POST /api/auth/register', () => {
  // ── EXIT DOOR 1 : réponse HTTP ────────────────────────────────────────────
  it('201 + status success avec payload valide', async () => {
    const res = await request.post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toMatchObject({
      email: validPayload.email,
      firstname: validPayload.firstname,
    });
    // Le hash ne doit jamais fuiter dans la réponse
    expect(res.body.data.password_hash).toBeUndefined();
  });

  // ── EXIT DOOR 1 : cookies posés ──────────────────────────────────────────
  it('pose les cookies accessToken et refreshToken en httpOnly', async () => {
    const res = await request.post('/api/auth/register').send(validPayload);
    const cookies: string[] = res.headers['set-cookie'] ?? [];

    const access = cookies.find((c) => c.startsWith('accessToken='));
    const refresh = cookies.find((c) => c.startsWith('refreshToken='));

    expect(access).toBeDefined();
    expect(access).toMatch(/HttpOnly/i);
    expect(access).toMatch(/SameSite=Strict/i);

    expect(refresh).toBeDefined();
    expect(refresh).toMatch(/HttpOnly/i);
    expect(refresh).toMatch(/Path=\/api\/auth\/refresh/i);
  });

  // ── EXIT DOOR 2 : état en BDD ────────────────────────────────────────────
  it('persiste le user en BDD avec un hash argon2', async () => {
    await request.post('/api/auth/register').send(validPayload);

    const user = await prisma.users.findFirst({
      where: { email: validPayload.email },
    });

    expect(user).not.toBeNull();
    expect(user?.password_hash).toMatch(/^\$argon2/);
    // Ne pas stocker le mot de passe en clair
    expect(user?.password_hash).not.toBe(validPayload.password);
  });

  it('persiste un RefreshToken en BDD après register', async () => {
    const res = await request.post('/api/auth/register').send(validPayload);
    const userId = res.body.data?.id;

    const token = await prisma.refreshToken.findFirst({
      where: { user_id: userId },
    });

    expect(token).not.toBeNull();
    expect(token?.token_hash).toMatch(/^\$argon2/);
  });

  // ── Validation Zod ───────────────────────────────────────────────────────
  it('400 si email invalide', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('400 si mot de passe trop faible (pas de majuscule)', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'weakpass1!', confirm: 'weakpass1!' });
    expect(res.status).toBe(400);
  });

  it('400 si confirm ne correspond pas', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ ...validPayload, confirm: 'different' });
    expect(res.status).toBe(400);
  });

  // ── Unicité email ─────────────────────────────────────────────────────────
  it('409 si email déjà pris', async () => {
    await request.post('/api/auth/register').send(validPayload);
    const res = await request.post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(409);
  });
});
```

---

## 12. Les tests — `login.test.ts`

```typescript
// backend/src/tests/auth/login.test.ts
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../setup/testApp.js';
import { createUser } from '../setup/factories.js';

const request = supertest(app);

describe('POST /api/auth/login', () => {
  it('200 + cookies avec credentials valides', async () => {
    const user = await createUser();
    const res = await request
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const cookies: string[] = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('401 si mot de passe incorrect', async () => {
    const user = await createUser();
    const res = await request
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPass@99!' });
    expect(res.status).toBe(401);
  });

  it('401 si email inexistant', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'ghost@zombiezone.fr', password: 'Test@1234!' });
    expect(res.status).toBe(401);
  });

  it('400 si payload incomplet', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'noemail' });
    expect(res.status).toBe(400);
  });

  // Sécurité : message d'erreur identique email/password incorrect
  // (évite l'énumération d'emails)
  it('message d\'erreur identique email invalide vs password invalide', async () => {
    const user = await createUser();

    const resEmail = await request
      .post('/api/auth/login')
      .send({ email: 'ghost@zombiezone.fr', password: 'Test@1234!' });

    const resPass = await request
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPass@99!' });

    expect(resEmail.body.message).toBe(resPass.body.message);
  });
});
```

---

## 13. Les tests — `logout.test.ts`

```typescript
// backend/src/tests/auth/logout.test.ts
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../setup/testApp.js';
import { createUser, loginUser } from '../setup/factories.js';

const request = supertest(app);
const prisma = new PrismaClient();

describe('POST /api/auth/logout', () => {
  it('200 + efface les cookies', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    const res = await request
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);

    // Les cookies doivent être vidés (Max-Age=0 ou Expires dans le passé)
    const setCookies: string[] = res.headers['set-cookie'] ?? [];
    const accessCleared = setCookies.find((c) => c.startsWith('accessToken='));
    const refreshCleared = setCookies.find((c) => c.startsWith('refreshToken='));

    expect(accessCleared).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    expect(refreshCleared).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  // EXIT DOOR 2 : état en BDD
  it('supprime le RefreshToken en BDD', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    // Vérifie qu'un token existe avant logout
    const before = await prisma.refreshToken.findFirst({
      where: { user: { email: user.email } },
    });
    expect(before).not.toBeNull();

    await request.post('/api/auth/logout').set('Cookie', cookies);

    const after = await prisma.refreshToken.findFirst({
      where: { user: { email: user.email } },
    });
    expect(after).toBeNull();
  });

  it('200 même sans cookie (logout idempotent)', async () => {
    const res = await request.post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});
```

---

## 14. Les tests — `refresh.test.ts`

```typescript
// backend/src/tests/auth/refresh.test.ts
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../setup/testApp.js';
import { createUser, loginUser } from '../setup/factories.js';

const request = supertest(app);
const prisma = new PrismaClient();

describe('POST /api/auth/refresh', () => {
  it('200 + nouveaux cookies avec refresh token valide', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);

    const setCookies: string[] = res.headers['set-cookie'] ?? [];
    expect(setCookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(setCookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  // EXIT DOOR 2 : rotation en BDD
  it('rotation : l\'ancien refreshToken est révoqué, un nouveau est créé', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    const before = await prisma.refreshToken.findFirst({
      where: { user: { email: user.email } },
      select: { id: true },
    });

    await request.post('/api/auth/refresh').set('Cookie', cookies);

    const after = await prisma.refreshToken.findFirst({
      where: { user: { email: user.email } },
      select: { id: true },
    });

    expect(after).not.toBeNull();
    expect(after?.id).not.toBe(before?.id);   // nouveau token, pas le même
  });

  // Sécurité : replay attack
  it('401 si le même refresh token est utilisé deux fois (replay)', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    // Premier refresh — consomme le token
    await request.post('/api/auth/refresh').set('Cookie', cookies);

    // Deuxième refresh avec le même token — doit échouer
    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(401);
  });

  it('401 sans cookie', async () => {
    const res = await request.post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('401 avec un token forgé', async () => {
    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=fake.token.here; Path=/api/auth/refresh; HttpOnly']);
    expect(res.status).toBe(401);
  });
});
```

---

## 15. Les tests — `profile.test.ts`

```typescript
// backend/src/tests/auth/profile.test.ts
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../setup/testApp.js';
import { createUser, loginUser } from '../setup/factories.js';

const request = supertest(app);

describe('GET /api/auth/profile', () => {
  it('200 + données user sans password_hash', async () => {
    const user = await createUser();
    const cookies = await loginUser(request, user);

    const res = await request
      .get('/api/auth/profile')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: user.email });
    expect(res.body.password_hash).toBeUndefined();
  });

  it('401 sans cookie', async () => {
    const res = await request.get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('401 avec un accessToken expiré/invalide', async () => {
    const res = await request
      .get('/api/auth/profile')
      .set('Cookie', ['accessToken=invalid.jwt.token; Path=/; HttpOnly']);
    expect(res.status).toBe(401);
  });
});
```

---

## 16. Résumé des cas couverts

| Endpoint | Cas testés | Exit doors |
|---|---|---|
| `POST /api/auth/register` | payload valide, email dupliqué, password faible, confirm mismatch, email invalide | réponse, BDD (user + token), cookies |
| `POST /api/auth/login` | credentials valides, password faux, email inexistant, payload incomplet, message identique | réponse, cookies |
| `POST /api/auth/logout` | avec session valide, sans cookie, cookies effacés, token BDD supprimé | réponse, BDD, cookies |
| `POST /api/auth/refresh` | token valide, rotation BDD, replay attack, sans cookie, token forgé | réponse, BDD, cookies |
| `GET /api/auth/profile` | authentifié, sans cookie, token invalide | réponse |

**Total : ~20 tests, ~5 secondes sur tmpfs.**

---

## 17. Ordre d'implémentation recommandé (CC)

```
1. docker-compose.test.yml
2. .env.test  (+ ajouter à .gitignore)
3. vitest.config.ts
4. package.json scripts test
5. src/tests/setup/globalSetup.ts
6. src/tests/setup/testSetup.ts
7. src/tests/setup/testApp.ts
8. src/tests/setup/factories.ts
9. src/tests/auth/register.test.ts  ← commencer ici pour valider le setup
10. login / logout / refresh / profile
```

Valider à chaque étape : `npm test --workspace=backend` doit passer au vert
avant d'avancer.
