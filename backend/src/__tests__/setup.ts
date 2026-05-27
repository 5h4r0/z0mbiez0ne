import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from 'vitest';

// Client Prisma dédié à la BDD de test
export const prismaTest = new PrismaClient({
  datasources: {
    db: {
      url: (process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL) as string,
    },
  },
  log: [],
});

// ─── Reset BDD entre chaque suite ───────────────────────────
// Ordre important : respect des FK
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
  ]);

  await prismaTest.roles.createMany({
    data: [
      { id: 1, name: 'admin' },
      { id: 2, name: 'member' },
    ],
    skipDuplicates: true,
  });
}

// ─── Lifecycle global ────────────────────────────────────────
beforeAll(async () => {
  await prismaTest.$connect();
});

afterAll(async () => {
  await resetDatabase();
  await prismaTest.$disconnect();
});

// ─── Helper : créer un user de test en BDD ───────────────────
import { hashPassword } from '../lib/auth.js';

export async function createTestUser(overrides: {
  email?: string;
  password?: string;
  role_id?: number;
} = {}) {
  const email = overrides.email ?? 'test@zombiezone.fr';
  const password = overrides.password ?? 'Test1234!';
  const role_id = overrides.role_id ?? 2; // 2 = user/member

  const password_hash = await hashPassword(password);
  return prismaTest.users.create({
    data: {
      firstname: 'Test',
      lastname: 'User',
      email,
      password_hash,
      role_id,
    },
    select: { id: true, email: true, role_id: true },
  });
}

// ─── Helper : créer un admin de test en BDD ──────────────────
export async function createTestAdmin(overrides: { email?: string; password?: string } = {}) {
  return createTestUser({
    email: overrides.email ?? 'admin@zombiezone.fr',
    password: overrides.password ?? 'Admin1234!',
    role_id: 1, // 1 = admin
  });
}
