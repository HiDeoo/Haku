import fs from 'fs'

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
    globalSetup: getConfigFilePath('globalSetup.ts'),
    setupFiles: getConfigFilePath('filesSetup.ts'),
    threads: process.env['TEST_TYPE'] !== 'api',
  },
})

function getConfigFilePath(fileName: string) {
  if (!process.env['TEST_TYPE']) {
    throw new Error(
      `The 'TEST_TYPE' environment variable should be defined to get the configuration file path for '${fileName}'.`
    )
  }

  const relativePath = `src/tests/${process.env['TEST_TYPE']}/${fileName}`

  const exists = fs.existsSync(relativePath)

  return exists ? relativePath : undefined
}
