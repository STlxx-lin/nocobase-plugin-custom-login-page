import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: __dirname,
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    environment: 'node',
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
