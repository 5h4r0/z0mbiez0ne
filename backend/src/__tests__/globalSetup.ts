import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const COMPOSE_FILE = path.join(ROOT, 'docker-compose.test.yml');

export async function setup() {
  if (process.env.CI) return; // Docker fourni par GitHub Actions

  console.log('\n🐘 Démarrage PostgreSQL de test...');

  execSync(`docker compose -f ${COMPOSE_FILE} up -d --wait`, { stdio: 'inherit' });

  process.env.DATABASE_URL = 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test';

  execSync('npx prisma db push --schema=./src/models/schema.prisma --accept-data-loss', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });

  console.log('✅ PostgreSQL test prête\n');
}

export async function teardown() {
  if (process.env.CI === 'true') {
    execSync(`docker compose -f ${COMPOSE_FILE} down`, { stdio: 'inherit' });
    console.log('🛑 PostgreSQL test arrêtée (CI)');
  }
}
