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

async function createTestActivity() {
  return prismaTest.activities.create({
    data: { title: 'Test Activity', slug: 'test-activity', description: 'test' },
  });
}

async function createTestSession(activityId: number, overrides: { capacity?: number } = {}) {
  return prismaTest.sessions.create({
    data: {
      activity_id: activityId,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: overrides.capacity ?? 20,
      unit_price: 25,
      status: 'Scheduled',
    },
  });
}

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

// ─── Tests ──────────────────────────────────────────────────

describe('GET /api/sessions', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la liste paginée — 200', async () => {
    const activity = await createTestActivity();
    await createTestSession(activity.id);
    const res = await request(app).get('/api/sessions');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('retourne un tableau vide si aucune session', async () => {
    const res = await request(app).get('/api/sessions');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filtre par statut valide — 200', async () => {
    const activity = await createTestActivity();
    await createTestSession(activity.id);
    const res = await request(app).get('/api/sessions?status=Scheduled');

    expect(res.status).toBe(200);
  });

  it('400 si statut invalide (Zod)', async () => {
    const res = await request(app).get('/api/sessions?status=InvalidStatus');

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/sessions/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la session par id — 200', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    const res = await request(app).get(`/api/sessions/${session.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(session.id);
    expect(res.body.data.capacity).toBe(20);
  });

  it('404 si session inexistante', async () => {
    const res = await request(app).get('/api/sessions/99999');

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────

describe('POST /api/sessions', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('crée une session et retourne 201 (admin)', async () => {
    const activity = await createTestActivity();
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/sessions').send({
      activity_id: activity.id,
      date: FUTURE_DATE,
      capacity: 20,
      unit_price: 25,
      status: 'Scheduled',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.capacity).toBe(20);
    expect(res.body.data.unit_price).toBe(25);
  });

  it('400 si date dans le passé (Zod)', async () => {
    const activity = await createTestActivity();
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/sessions').send({
      activity_id: activity.id,
      date: '2020-01-01T00:00:00Z',
      capacity: 20,
      unit_price: 25,
      status: 'Scheduled',
    });

    expect(res.status).toBe(400);
  });

  it('400 si statut invalide (Zod)', async () => {
    const activity = await createTestActivity();
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/sessions').send({
      activity_id: activity.id,
      date: FUTURE_DATE,
      capacity: 20,
      unit_price: 25,
      status: 'InvalidStatus',
    });

    expect(res.status).toBe(400);
  });

  it('404 si activité inexistante (FK)', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.post('/api/sessions').send({
      activity_id: 99999,
      date: FUTURE_DATE,
      capacity: 20,
      unit_price: 25,
      status: 'Scheduled',
    });

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const activity = await createTestActivity();

    const res = await request(app).post('/api/sessions').send({
      activity_id: activity.id,
      date: FUTURE_DATE,
      capacity: 20,
      unit_price: 25,
      status: 'Scheduled',
    });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    const activity = await createTestActivity();
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/sessions').send({
      activity_id: activity.id,
      date: FUTURE_DATE,
      capacity: 20,
      unit_price: 25,
      status: 'Scheduled',
    });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/sessions/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('met à jour une session — 200', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/sessions/${session.id}`).send({ capacity: 30 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.capacity).toBe(30);
  });

  it('400 si date dans le passé (Zod)', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put(`/api/sessions/${session.id}`).send({ date: '2020-01-01T00:00:00Z' });

    expect(res.status).toBe(400);
  });

  it('404 si session inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put('/api/sessions/99999').send({ capacity: 10 });

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    const res = await request(app).put(`/api/sessions/${session.id}`).send({ capacity: 10 });

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/sessions/${session.id}`).send({ capacity: 10 });

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('DELETE /api/sessions/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('supprime une session sans order_lines — 200 et supprimée en BDD', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/sessions/${session.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const inDb = await prismaTest.sessions.findUnique({ where: { id: session.id } });
    expect(inDb).toBeNull();
  });

  it('400 si la session a des order_lines', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    const user = await createTestUser({ email: 'buyer@zombiezone.fr', password: 'Test1234!' });
    await prismaTest.orders.create({
      data: {
        user_id: user.id,
        taxes: 0.2,
        total_amount: 30,
        status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } },
      },
    });
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete(`/api/sessions/${session.id}`);

    expect(res.status).toBe(400);
  });

  it('404 si session inexistante', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.delete('/api/sessions/99999');

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    const res = await request(app).delete(`/api/sessions/${session.id}`);

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/sessions/${session.id}`);

    expect(res.status).toBe(403);
  });
});
