import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { createTestUser, prismaTest, resetDatabase } from './setup.js';

// ─── Helpers ────────────────────────────────────────────────

const VALID_USER = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@zombiezone.fr',
  password: 'Test1234!',
  confirm: 'Test1234!',
  role_id: 2,
};

/** Extrait un cookie par nom depuis les headers Set-Cookie */
function getCookie(res: request.Response, name: string): string | undefined {
  const cookies = res.headers['set-cookie'] as string[] | string | undefined;
  if (!cookies) return undefined;
  const list = Array.isArray(cookies) ? cookies : [cookies];
  return list.find((c) => c.startsWith(`${name}=`));
}

/** Login et retourne l'agent avec les cookies */
async function loginAgent(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

// ─── Tests ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('crée un utilisateur et retourne 201', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.email).toBe(VALID_USER.email);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('pose les cookies httpOnly accessToken et refreshToken', async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);

    const access = getCookie(res, 'accessToken');
    const refresh = getCookie(res, 'refreshToken');

    expect(access).toBeDefined();
    expect(access).toMatch(/HttpOnly/i);
    expect(refresh).toBeDefined();
    expect(refresh).toMatch(/HttpOnly/i);
  });

  it('refuse si email déjà pris — 409', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
    const res = await request(app).post('/api/auth/register').send(VALID_USER);

    expect(res.status).toBe(409);
  });

  it('refuse si mot de passe trop faible — 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, email: 'other@zombiezone.fr', password: 'weak', confirm: 'weak' });

    expect(res.status).toBe(400);
  });

  it('refuse si passwords ne correspondent pas — 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, confirm: 'Mismatch1!' });

    expect(res.status).toBe(400);
  });

  it('refuse si role_id invalide — 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, email: 'other2@zombiezone.fr', role_id: 999 });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createTestUser({ email: 'login@zombiezone.fr', password: 'Test1234!' });
  });

  it('retourne 200 et pose les cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@zombiezone.fr', password: 'Test1234!' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(getCookie(res, 'accessToken')).toBeDefined();
    expect(getCookie(res, 'refreshToken')).toBeDefined();
  });

  it('refuse si mauvais mot de passe — 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@zombiezone.fr', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
  });

  it('refuse si email inconnu — 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@zombiezone.fr', password: 'Test1234!' });

    expect(res.status).toBe(401);
  });

  it('refuse si body invalide — 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createTestUser({ email: 'logout@zombiezone.fr', password: 'Test1234!' });
  });

  it('retourne 200 et efface les cookies', async () => {
    const agent = await loginAgent('logout@zombiezone.fr', 'Test1234!');
    const res = await agent.post('/api/auth/logout');

    expect(res.status).toBe(200);
    // Les cookies doivent être clearés (Max-Age=0 ou Expires dans le passé)
    const access = getCookie(res, 'accessToken');
    const refresh = getCookie(res, 'refreshToken');
    if (access) expect(access).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    if (refresh) expect(refresh).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  it('retourne 200 même sans cookie (logout idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });

  it('révoque le refreshToken en BDD', async () => {
    const agent = await loginAgent('logout@zombiezone.fr', 'Test1234!');

    const user = await prismaTest.users.findFirst({ where: { email: 'logout@zombiezone.fr' } });
    if (!user) throw new Error('test user not found');
    const beforeCount = await prismaTest.refreshToken.count({ where: { user_id: user.id } });
    expect(beforeCount).toBeGreaterThan(0);

    await agent.post('/api/auth/logout');

    const afterCount = await prismaTest.refreshToken.count({ where: { user_id: user.id } });
    expect(afterCount).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createTestUser({ email: 'refresh@zombiezone.fr', password: 'Test1234!' });
  });

  it('émet un nouvel accessToken et refreshToken', async () => {
    const agent = await loginAgent('refresh@zombiezone.fr', 'Test1234!');
    const res = await agent.post('/api/auth/refresh');

    expect(res.status).toBe(200);
    expect(getCookie(res, 'accessToken')).toBeDefined();
    expect(getCookie(res, 'refreshToken')).toBeDefined();
  });

  it('refuse sans cookie refreshToken — 401', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rotation : le refreshToken ne peut pas être réutilisé', async () => {
    // Login → capture le cookie refreshToken initial
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh@zombiezone.fr', password: 'Test1234!' });

    const refreshCookie = getCookie(loginRes, 'refreshToken');
    expect(refreshCookie).toBeDefined();
    if (!refreshCookie) throw new Error('refreshCookie not set');

    // Premier refresh — OK
    const res1 = await request(app).post('/api/auth/refresh').set('Cookie', [refreshCookie]);
    expect(res1.status).toBe(200);

    // Deuxième refresh avec le même token — doit échouer (rotation)
    const res2 = await request(app).post('/api/auth/refresh').set('Cookie', [refreshCookie]);
    expect(res2.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/auth/profile', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createTestUser({ email: 'profile@zombiezone.fr', password: 'Test1234!' });
  });

  it('retourne le profil si authentifié', async () => {
    const agent = await loginAgent('profile@zombiezone.fr', 'Test1234!');
    const res = await agent.get('/api/auth/profile');

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('profile@zombiezone.fr');
    expect(res.body.password_hash).toBeUndefined();
  });

  it('refuse sans accessToken — 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});
