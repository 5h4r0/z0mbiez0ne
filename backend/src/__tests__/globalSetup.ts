import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const COMPOSE_FILE = path.join(ROOT, 'docker-compose.test.yaml');
const TEST_DATABASE_URL = 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test';

export async function setup() {
  if (process.env.CI) return;

  console.log('\n🐘 Démarrage PostgreSQL de test...');

  execSync(`docker compose -f ${COMPOSE_FILE} up -d --wait`, { stdio: 'inherit' });

  process.env.DATABASE_URL = TEST_DATABASE_URL;

  execSync('npx prisma db push --schema=./src/models/schema.prisma --accept-data-loss', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });

  // Seed roles once — shared across all test workers
  const prisma = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });
  await prisma.$connect();
  await prisma.roles.createMany({
    data: [{ name: 'member' }, { name: 'admin' }],
    skipDuplicates: true,
  });
  await prisma.$disconnect();

  console.log('✅ PostgreSQL test prête\n');
}

export async function teardown() {
  if (process.env.CI === 'true') {
    execSync(`docker compose -f ${COMPOSE_FILE} down`, { stdio: 'inherit' });
    console.log('🛑 PostgreSQL test arrêtée (CI)');
  }
}
