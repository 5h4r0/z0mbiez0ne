import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './src/__tests__/globalSetup.ts',
    environment: 'node',
    globals: true,
    env: { NODE_ENV: 'test' },
    setupFiles: ['./src/__tests__/setup.ts'],
    reporters: ['verbose'],
    pool: 'forks',
    forks: { singleFork: true },
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: {
    conditions: ['node'],
  },
});
