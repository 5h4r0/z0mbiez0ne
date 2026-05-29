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

async function createTestCategory(overrides: { title?: string; slug?: string } = {}) {
  return prismaTest.categories.create({
    data: {
      title: overrides.title ?? 'Test Category',
      slug: overrides.slug ?? 'test-category',
      description: 'Une catégorie de test',
    },
  });
}

// ─── Tests ──────────────────────────────────────────────────

describe('GET /api/categories', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la liste paginée — 200', async () => {
    await createTestCategory();
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.page).toBe(1);
  });

  it('retourne un tableau vide si aucune catégorie', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('pagination invalide — 400', async () => {
    const res = await request(app).get('/api/categories?page=0');

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/categories/by-slug/:slug', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la catégorie par slug — 200', async () => {
    await createTestCategory({ slug: 'horreur-urbaine' });
    const res = await request(app).get('/api/categories/by-slug/horreur-urbaine');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('horreur-urbaine');
  });

  it('404 si slug inexistant', async () => {
    const res = await request(app).get('/api/categories/by-slug/slug-inexistant');

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/categories/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la catégorie par id — 200', async () => {
    const category = await createTestCategory();
    const res = await request(app).get(`/api/categories/${category.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(category.id);
  });

  it('404 si id inexistant', async () => {
    const res = await request(app).get('/api/categories/99999');

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/categories', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('crée une catégorie et retourne 201 (admin)', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/categories').send({
      title: 'Horreur Urbaine',
      description: 'Des activités en ville',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Horreur Urbaine');
  });

  it('slug auto-généré à partir du titre', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/categories').send({ title: 'Survie Extrême' });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('survie-extreme');
  });

  it('409 si titre dupliqué (slug identique)', async () => {
    await createTestCategory({ title: 'Dupliqué', slug: 'duplique' });
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/categories').send({ title: 'Dupliqué' });

    expect(res.status).toBe(409);
  });

  it('401 si non authentifié', async () => {
    const res = await request(app).post('/api/categories').send({ title: 'Test' });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/categories').send({ title: 'Test' });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/categories/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('met à jour une catégorie — 200', async () => {
    await createTestAdmin();
    const category = await createTestCategory();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/categories/${category.id}`).send({
      title: 'Titre mis à jour',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Titre mis à jour');
  });

  it('400 si activité liée invalide', async () => {
    await createTestAdmin();
    const category = await createTestCategory();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/categories/${category.id}`).send({
      title: 'Titre',
      activities_ids: [99999],
    });

    expect(res.status).toBe(400);
  });

  it('404 si catégorie inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put('/api/categories/99999').send({ title: 'x' });

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const category = await createTestCategory();
    const res = await request(app).put(`/api/categories/${category.id}`).send({ title: 'x' });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const category = await createTestCategory();
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/categories/${category.id}`).send({ title: 'x' });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('DELETE /api/categories/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('supprime une catégorie sans activités — 200 et supprimée en BDD', async () => {
    await createTestAdmin();
    const category = await createTestCategory();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/categories/${category.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const inDb = await prismaTest.categories.findUnique({ where: { id: category.id } });
    expect(inDb).toBeNull();
  });

  it('409 si la catégorie a des activités liées', async () => {
    await createTestAdmin();
    const category = await createTestCategory();
    const activity = await prismaTest.activities.create({
      data: { title: 'Zombie Safari', slug: 'zombie-safari', description: 'test' },
    });
    await prismaTest.activities_categories.create({
      data: { activity_id: activity.id, category_id: category.id },
    });
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/categories/${category.id}`);

    expect(res.status).toBe(409);
  });

  it('404 si catégorie inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete('/api/categories/99999');

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const category = await createTestCategory();
    const res = await request(app).delete(`/api/categories/${category.id}`);

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const category = await createTestCategory();
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/categories/${category.id}`);

    expect(res.status).toBe(403);
  });
});
