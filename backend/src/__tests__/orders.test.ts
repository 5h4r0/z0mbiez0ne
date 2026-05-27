import request from 'supertest';
// import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { createTestAdmin, createTestUser, prismaTest, resetDatabase } from './setup.js';

// ─── Helpers ────────────────────────────────────────────────

/** Login et retourne un agent avec cookies */
async function loginAgent(email: string, password: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

/** Crée une activité + session de test en BDD */
async function createTestSession(overrides: { capacity?: number; unit_price?: number } = {}) {
  const activity = await prismaTest.activities.create({
    data: {
      title: 'Zombie Safari',
      slug: 'zombie-safari',
      description: 'Une activité terrifiante',
      duration: 60,
    },
  });

  const session = await prismaTest.sessions.create({
    data: {
      activity_id: activity.id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // dans 7 jours
      capacity: overrides.capacity ?? 20,
      unit_price: overrides.unit_price ?? 25,
      status: 'Scheduled',
    },
  });

  return { activity, session };
}

// ─── Tests ──────────────────────────────────────────────────

describe('POST /api/orders', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('crée une commande et retourne 201', async () => {
    const user = await createTestUser({ email: 'buyer@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const agent = await loginAgent('buyer@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/orders').send({
      user_id: user.id,
      lines: [{ session_id: session.id, tickets_qty: 2 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('user_id est ignoré — la commande est créée pour req.user.id', async () => {
    const user = await createTestUser({ email: 'real@zombiezone.fr', password: 'Test1234!' });
    const otherUser = await createTestUser({ email: 'other@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const agent = await loginAgent('real@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/orders').send({
      user_id: otherUser.id, // tente d'usurper l'identité
      lines: [{ session_id: session.id, tickets_qty: 1 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user_id).toBe(user.id); // doit être l'utilisateur connecté
  });

  it('calcule correctement le total avec taxes', async () => {
    await createTestUser({ email: 'calc@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession({ unit_price: 25 });
    const agent = await loginAgent('calc@zombiezone.fr', 'Test1234!');

    const user = await prismaTest.users.findFirst({ where: { email: 'calc@zombiezone.fr' } });
    const res = await agent.post('/api/orders').send({
      user_id: user!.id,
      lines: [{ session_id: session.id, tickets_qty: 2 }],
    });

    // 2 × 25 = 50, + 20% taxes = 60
    expect(res.body.data.total_amount).toBeCloseTo(60);
  });

  it('refuse si session introuvable — 404', async () => {
    const user = await createTestUser({ email: 'notfound@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('notfound@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/orders').send({
      user_id: user.id,
      lines: [{ session_id: 99999, tickets_qty: 1 }],
    });

    expect(res.status).toBe(404);
  });

  it('refuse si capacité insuffisante — 400', async () => {
    const user = await createTestUser({ email: 'full@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession({ capacity: 2 });
    const agent = await loginAgent('full@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/orders').send({
      user_id: user.id,
      lines: [{ session_id: session.id, tickets_qty: 5 }], // dépasse la capacité
    });

    expect(res.status).toBe(400);
  });

  it('refuse sans authentification — 401', async () => {
    const { session } = await createTestSession();
    const res = await request(app).post('/api/orders').send({
      user_id: 1,
      lines: [{ session_id: session.id, tickets_qty: 1 }],
    });

    expect(res.status).toBe(401);
  });

  it('refuse si body invalide — 400', async () => {
    await createTestUser({ email: 'invalid@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('invalid@zombiezone.fr', 'Test1234!');

    const res = await agent.post('/api/orders').send({ lines: [] }); // lines vide

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/orders/mine', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne les commandes de l\'utilisateur connecté', async () => {
    const user = await createTestUser({ email: 'mine@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();

    // Créer une commande directement en BDD
    await prismaTest.orders.create({
      data: {
        user_id: user.id,
        taxes: 0.2,
        total_amount: 30,
        status: 'Pending',
        orders_lines: {
          create: { session_id: session.id, tickets_qty: 1, amount: 25 },
        },
      },
    });

    const agent = await loginAgent('mine@zombiezone.fr', 'Test1234!');
    const res = await agent.get('/api/orders/mine');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].user_id).toBe(user.id);
  });

  it('retourne un tableau vide si aucune commande', async () => {
    await createTestUser({ email: 'empty@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('empty@zombiezone.fr', 'Test1234!');
    const res = await agent.get('/api/orders/mine');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('refuse sans authentification — 401', async () => {
    const res = await request(app).get('/api/orders/mine');
    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne la commande si elle appartient à l\'utilisateur', async () => {
    const user = await createTestUser({ email: 'owner@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: {
        user_id: user.id,
        taxes: 0.2,
        total_amount: 30,
        status: 'Pending',
        orders_lines: {
          create: { session_id: session.id, tickets_qty: 1, amount: 25 },
        },
      },
    });

    const agent = await loginAgent('owner@zombiezone.fr', 'Test1234!');
    const res = await agent.get(`/api/orders/${order.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(order.id);
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('refuse si la commande appartient à un autre utilisateur — 404', async () => {
    await createTestUser({ email: 'spy@zombiezone.fr', password: 'Test1234!' });
    const otherUser = await createTestUser({ email: 'victim@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: {
        user_id: otherUser.id,
        taxes: 0.2,
        total_amount: 30,
        status: 'Pending',
        orders_lines: {
          create: { session_id: session.id, tickets_qty: 1, amount: 25 },
        },
      },
    });

    const agent = await loginAgent('spy@zombiezone.fr', 'Test1234!');
    const res = await agent.get(`/api/orders/${order.id}`);

    expect(res.status).toBe(404); // pas d'info sur l'existence
  });

  it('retourne 404 si commande inexistante', async () => {
    await createTestUser({ email: '404@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('404@zombiezone.fr', 'Test1234!');
    const res = await agent.get('/api/orders/99999');

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/orders/:id — transitions de statut', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('Pending → Confirmed autorisé', async () => {
    const user = await createTestUser({ email: 'confirm@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('confirm@zombiezone.fr', 'Test1234!');
    const res = await agent.put(`/api/orders/${order.id}`).send({ status: 'Confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Confirmed');
  });

  it('Pending → Cancelled autorisé', async () => {
    const user = await createTestUser({ email: 'cancel@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('cancel@zombiezone.fr', 'Test1234!');
    const res = await agent.put(`/api/orders/${order.id}`).send({ status: 'Cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Cancelled');
  });

  it('Pending → Refunded refusé — 400', async () => {
    const user = await createTestUser({ email: 'refund@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('refund@zombiezone.fr', 'Test1234!');
    const res = await agent.put(`/api/orders/${order.id}`).send({ status: 'Refunded' });

    expect(res.status).toBe(400);
  });

  it('Cancelled → Confirmed refusé — 400', async () => {
    const user = await createTestUser({ email: 'reopen@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Cancelled',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('reopen@zombiezone.fr', 'Test1234!');
    const res = await agent.put(`/api/orders/${order.id}`).send({ status: 'Confirmed' });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('DELETE /api/orders/:id (soft delete)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('soft delete une commande Pending — deleted_at non null', async () => {
    const user = await createTestUser({ email: 'del@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('del@zombiezone.fr', 'Test1234!');
    const res = await agent.delete(`/api/orders/${order.id}`);

    expect(res.status).toBe(200);

    const inDb = await prismaTest.orders.findUnique({ where: { id: order.id } });
    expect(inDb?.deleted_at).not.toBeNull();
  });

  it('refuse de supprimer une commande Confirmed — 400', async () => {
    const user = await createTestUser({ email: 'nodelete@zombiezone.fr', password: 'Test1234!' });
    const { session } = await createTestSession();
    const order = await prismaTest.orders.create({
      data: { user_id: user.id, taxes: 0.2, total_amount: 30, status: 'Confirmed',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } } },
    });

    const agent = await loginAgent('nodelete@zombiezone.fr', 'Test1234!');
    const res = await agent.delete(`/api/orders/${order.id}`);

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/orders — admin only', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('admin voit toutes les commandes', async () => {
    await createTestAdmin({ email: 'admin@zombiezone.fr', password: 'Admin1234!' });
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');
    const res = await agent.get('/api/orders');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('user member n\'a pas accès — 403', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');
    const res = await agent.get('/api/orders');

    expect(res.status).toBe(403);
  });
});
