import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './src/__tests__/globalSetup.ts',
    environment: 'node',
    globals: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test',
      TEST_DATABASE_URL: 'postgresql://zz_test:zz_test_pass@localhost:54320/zombiezone_test',
    },
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
    reporters: ['verbose'],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  resolve: {
    conditions: ['node'],
  },
});
