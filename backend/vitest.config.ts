import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: { NODE_ENV: 'test' },
    setupFiles: ['./src/__tests__/setup.ts'],
    // tests séquentiels — une seule connexion BDD de test
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    // timeout généreux pour les opérations BDD
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: {
    // aligne avec moduleResolution NodeNext du tsconfig
    conditions: ['node'],
  },
});
