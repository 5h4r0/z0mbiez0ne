import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from 'vitest';
import { hashPassword } from '../lib/auth.js';

export const prismaTest = new PrismaClient({
  log: [],
});

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
  await prismaTest.roles.deleteMany();
  // Réinitialiser la séquence pour avoir des IDs prévisibles (1=member, 2=admin)
  await prismaTest.$executeRawUnsafe('ALTER SEQUENCE roles_id_seq RESTART WITH 1');
  await prismaTest.roles.createMany({
    data: [{ name: 'member' }, { name: 'admin' }],
  });
}

beforeAll(async () => {
  await prismaTest.$connect();
});

afterAll(async () => {
  await resetDatabase();
  await prismaTest.$disconnect();
});

async function getRoleId(name: 'member' | 'admin'): Promise<number> {
  const role = await prismaTest.roles.findUniqueOrThrow({ where: { name } });
  return role.id;
}

export async function createTestUser(
  overrides: { email?: string; password?: string; roleName?: 'member' | 'admin' } = {},
) {
  const email = overrides.email ?? 'test@zombiezone.fr';
  const password = overrides.password ?? 'Test1234!';
  const role_id = await getRoleId(overrides.roleName ?? 'member');

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

export async function createTestAdmin(overrides: { email?: string; password?: string } = {}) {
  return createTestUser({
    email: overrides.email ?? 'admin@zombiezone.fr',
    password: overrides.password ?? 'Admin1234!',
    roleName: 'admin',
  });
}
