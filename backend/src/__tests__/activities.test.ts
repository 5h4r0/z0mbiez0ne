import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { createTestAdmin, createTestUser, prismaTest, resetDatabase } from './setup.js';

// ─── Helpers ────────────────────────────────────────────────

async function loginAgent(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

async function createTestActivity(overrides: { title?: string; slug?: string } = {}) {
  return prismaTest.activities.create({
    data: {
      title: overrides.title ?? 'Test Activity',
      slug: overrides.slug ?? 'test-activity',
      description: 'Une activité de test',
    },
  });
}

// ─── Tests ──────────────────────────────────────────────────

describe('GET /api/activities', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la liste paginée — 200', async () => {
    await createTestActivity();
    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.page).toBe(1);
  });

  it('retourne un tableau vide si aucune activité', async () => {
    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('pagination invalide — 400', async () => {
    const res = await request(app).get('/api/activities?page=0');

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/activities/by-slug/:slug', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("retourne l'activité par slug — 200", async () => {
    await createTestActivity({ slug: 'zombie-safari' });
    const res = await request(app).get('/api/activities/by-slug/zombie-safari');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('zombie-safari');
  });

  it('404 si slug inexistant', async () => {
    const res = await request(app).get('/api/activities/by-slug/slug-inexistant');

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/activities', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('crée une activité et retourne 201 (admin)', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/activities').send({
      title: 'Zombie Safari',
      description: 'Une expérience terrifiante',
      activities_categories: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Zombie Safari');
  });

  it('slug auto-généré à partir du titre', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/activities').send({
      title: 'Mon Activité Géniale',
      activities_categories: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('mon-activite-geniale');
  });

  it('401 si non authentifié', async () => {
    const res = await request(app).post('/api/activities').send({
      title: 'Zombie Safari',
      activities_categories: [],
    });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/activities').send({
      title: 'Zombie Safari',
      activities_categories: [],
    });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/activities/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('met à jour une activité — 200', async () => {
    await createTestAdmin();
    const activity = await createTestActivity();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/activities/${activity.id}`).send({
      title: 'Titre mis à jour',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Titre mis à jour');
  });

  it('400 si catégorie inexistante', async () => {
    await createTestAdmin();
    const activity = await createTestActivity();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/activities/${activity.id}`).send({
      title: 'Titre',
      activities_categories: [99999],
    });

    expect(res.status).toBe(400);
  });

  it('404 si activité inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put('/api/activities/99999').send({ title: 'x' });

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const activity = await createTestActivity();
    const res = await request(app).put(`/api/activities/${activity.id}`).send({ title: 'x' });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const activity = await createTestActivity();
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/activities/${activity.id}`).send({ title: 'x' });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('DELETE /api/activities/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('supprime une activité sans sessions — 200 et supprimée en BDD', async () => {
    await createTestAdmin();
    const activity = await createTestActivity();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/activities/${activity.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const inDb = await prismaTest.activities.findUnique({ where: { id: activity.id } });
    expect(inDb).toBeNull();
  });

  it("400 si l'activité a des sessions", async () => {
    await createTestAdmin();
    const activity = await createTestActivity();
    await prismaTest.sessions.create({
      data: {
        activity_id: activity.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        capacity: 10,
        unit_price: 25,
        status: 'Scheduled',
      },
    });
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/activities/${activity.id}`);

    expect(res.status).toBe(400);
  });

  it('404 si activité inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete('/api/activities/99999');

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const activity = await createTestActivity();
    const res = await request(app).delete(`/api/activities/${activity.id}`);

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const activity = await createTestActivity();
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/activities/${activity.id}`);

    expect(res.status).toBe(403);
  });
});
