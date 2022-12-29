import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

if (!process.env['TEST_TYPE']) {
  throw new Error('The `TEST_TYPE` environment variable should be defined to specify the type of tests to run.')
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: process.env['TEST_TYPE'] === 'client' ? 'happy-dom' : 'node',
    include: [`src/tests/${process.env['TEST_TYPE']}/**/*.test.ts`],
  },
})
