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

async function createTestSession(activityId: number) {
  return prismaTest.sessions.create({
    data: {
      activity_id: activityId,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: 10,
      unit_price: 25,
      status: 'Scheduled',
    },
  });
}

// ────────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('admin récupère la liste — 200', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('401 si non authentifié', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
  });

  it('403 si role member', async () => {
    await createTestUser({ email: 'member@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('member@zombiezone.fr', 'Test1234!');

    const res = await agent.get('/api/users');

    expect(res.status).toBe(403);
  });
});

// ────────────────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('retourne le profil utilisateur — 200', async () => {
    const user = await createTestUser({ email: 'reader@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('reader@zombiezone.fr', 'Test1234!');

    const res = await agent.get(`/api/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('reader@zombiezone.fr');
  });

  it('404 si utilisateur inexistant', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.get('/api/users/99999');

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/users/:id/password', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('200 — member change son propre mot de passe', async () => {
    const user = await createTestUser({ email: 'pw@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('pw@zombiezone.fr', 'Test1234!');

    const res = await agent
      .put(`/api/users/${user.id}/password`)
      .send({ current_password: 'Test1234!', new_password: 'NewPass@9!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('401 — current_password incorrect', async () => {
    const user = await createTestUser({ email: 'pw2@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('pw2@zombiezone.fr', 'Test1234!');

    const res = await agent
      .put(`/api/users/${user.id}/password`)
      .send({ current_password: 'WrongPass@99!', new_password: 'NewPass@9!' });

    expect(res.status).toBe(401);
  });

  it('400 — new_password ne respecte pas la policy (pas de majuscule)', async () => {
    const user = await createTestUser({ email: 'pw3@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('pw3@zombiezone.fr', 'Test1234!');

    const res = await agent
      .put(`/api/users/${user.id}/password`)
      .send({ current_password: 'Test1234!', new_password: 'weakpass1!' });

    expect(res.status).toBe(400);
  });

  it("403 — member tente de changer le mot de passe d'un autre user", async () => {
    const other = await createTestUser({ email: 'other@zombiezone.fr', password: 'Test1234!' });
    await createTestUser({ email: 'attacker@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('attacker@zombiezone.fr', 'Test1234!');

    const res = await agent
      .put(`/api/users/${other.id}/password`)
      .send({ current_password: 'Test1234!', new_password: 'NewPass@9!' });

    expect(res.status).toBe(403);
  });

  it("200 — admin peut changer le mot de passe d'un autre user", async () => {
    const member = await createTestUser({ email: 'victim@zombiezone.fr', password: 'Test1234!' });
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent
      .put(`/api/users/${member.id}/password`)
      .send({ current_password: 'Test1234!', new_password: 'NewPass@9!' });

    expect(res.status).toBe(200);
  });

  it('après succès — tous les refresh tokens du user sont révoqués', async () => {
    const user = await createTestUser({ email: 'revoke@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('revoke@zombiezone.fr', 'Test1234!');

    const before = await prismaTest.refreshToken.findMany({ where: { user_id: user.id } });
    expect(before.length).toBeGreaterThan(0);

    const res = await agent
      .put(`/api/users/${user.id}/password`)
      .send({ current_password: 'Test1234!', new_password: 'NewPass@9!' });

    expect(res.status).toBe(200);

    const after = await prismaTest.refreshToken.findMany({ where: { user_id: user.id } });
    expect(after.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────

describe('PUT /api/users/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('met à jour un utilisateur — 200', async () => {
    const user = await createTestUser({ email: 'update@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('update@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/users/${user.id}`).send({
      email: 'updated@zombiezone.fr',
      firstname: 'Nouveau',
      lastname: 'Nom',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('updated@zombiezone.fr');
  });

  it("403 — member tente de modifier le profil d'un autre user", async () => {
    const other = await createTestUser({ email: 'target@zombiezone.fr', password: 'Test1234!' });
    await createTestUser({ email: 'hacker@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('hacker@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/users/${other.id}`).send({
      email: 'target@zombiezone.fr',
      firstname: 'Hacked',
      lastname: 'User',
    });

    expect(res.status).toBe(403);
  });

  it('400 si body invalide (Zod)', async () => {
    const user = await createTestUser({ email: 'zod@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('zod@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/users/${user.id}`).send({
      email: 'not-an-email',
      firstname: 'Test',
      lastname: 'User',
    });

    expect(res.status).toBe(400);
  });

  it('409 si email déjà utilisé par un autre user', async () => {
    const user = await createTestUser({ email: 'conflict@zombiezone.fr', password: 'Test1234!' });
    await createTestUser({ email: 'taken@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('conflict@zombiezone.fr', 'Test1234!');

    const res = await agent.put(`/api/users/${user.id}`).send({
      email: 'taken@zombiezone.fr',
      firstname: 'Test',
      lastname: 'User',
    });

    expect(res.status).toBe(409);
  });

  it('404 si utilisateur inexistant', async () => {
    await createTestAdmin();
    const agent = await loginAgent('admin@zombiezone.fr', 'Admin1234!');

    const res = await agent.put('/api/users/99999').send({
      email: 'nobody@zombiezone.fr',
      firstname: 'Test',
      lastname: 'User',
    });

    expect(res.status).toBe(404);
  });

  it('401 si non authentifié', async () => {
    const user = await createTestUser({ email: 'unauth@zombiezone.fr', password: 'Test1234!' });

    const res = await request(app).put(`/api/users/${user.id}`).send({
      email: 'unauth@zombiezone.fr',
      firstname: 'Test',
      lastname: 'User',
    });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────

describe('DELETE /api/users/:id', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('soft delete un utilisateur — 200 et deleted_at non null', async () => {
    const user = await createTestUser({ email: 'softdel@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('softdel@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const inDb = await prismaTest.users.findUnique({ where: { id: user.id } });
    expect(inDb).not.toBeNull();
    if (!inDb) throw new Error('user not found in DB after soft delete');
    expect(inDb.deleted_at).not.toBeNull();
  });

  it("400 — suppression bloquée si commande Pending", async () => {
    const user = await createTestUser({ email: 'pending@zombiezone.fr', password: 'Test1234!' });
    await prismaTest.orders.create({
      data: { user_id: user.id, total_amount: 0, status: 'Pending' },
    });
    const agent = await loginAgent('pending@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${user.id}`);

    expect(res.status).toBe(400);
  });

  it("400 — suppression bloquée si commande Confirmed", async () => {
    const user = await createTestUser({ email: 'confirmed@zombiezone.fr', password: 'Test1234!' });
    await prismaTest.orders.create({
      data: { user_id: user.id, total_amount: 0, status: 'Confirmed' },
    });
    const agent = await loginAgent('confirmed@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${user.id}`);

    expect(res.status).toBe(400);
  });

  it("400 si l'utilisateur a des commandes (avec orders_lines)", async () => {
    const activity = await createTestActivity();
    const session = await createTestSession(activity.id);
    const user = await createTestUser({ email: 'withorders@zombiezone.fr', password: 'Test1234!' });
    await prismaTest.orders.create({
      data: {
        user_id: user.id,
        taxes: 0.2,
        total_amount: 30,
        status: 'Pending',
        orders_lines: { create: { session_id: session.id, tickets_qty: 1, amount: 25 } },
      },
    });
    const agent = await loginAgent('withorders@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${user.id}`);

    expect(res.status).toBe(400);
  });

  it("200 — soft delete autorisé si seulement des commandes Cancelled", async () => {
    const user = await createTestUser({ email: 'cancelled@zombiezone.fr', password: 'Test1234!' });
    await prismaTest.orders.create({
      data: { user_id: user.id, total_amount: 0, status: 'Cancelled' },
    });
    const agent = await loginAgent('cancelled@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${user.id}`);

    expect(res.status).toBe(200);
  });

  it("403 — member tente de supprimer un autre user", async () => {
    const other = await createTestUser({ email: 'otherdel@zombiezone.fr', password: 'Test1234!' });
    await createTestUser({ email: 'attacker2@zombiezone.fr', password: 'Test1234!' });
    const agent = await loginAgent('attacker2@zombiezone.fr', 'Test1234!');

    const res = await agent.delete(`/api/users/${other.id}`);

    expect(res.status).toBe(403);
  });

  it('401 si non authentifié', async () => {
    const user = await createTestUser({ email: 'noauth@zombiezone.fr', password: 'Test1234!' });

    const res = await request(app).delete(`/api/users/${user.id}`);

    expect(res.status).toBe(401);
  });
});
