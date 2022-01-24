const fs = require('fs')

const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: '.' })

if (!process.env.TEST_TYPE) {
  throw new Error('The `TEST_TYPE` environment variable should be defined to specify the type of tests to run.')
}

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  globalSetup: getFilePathConfig('globalSetup.ts'),
  globalTeardown: getFilePathConfig('globalTeardown.ts'),
  setupFilesAfterEnv: getFilePathConfig('filesSetup.ts', true),
  testMatch: [`<rootDir>/src/tests/${process.env.TEST_TYPE}/**/*.test.ts`],
}

module.exports = createJestConfig(customJestConfig)

function getFilePathConfig(fileName, inArray = false) {
  const relativePath = `src/tests/${process.env.TEST_TYPE}/${fileName}`

  const exists = fs.existsSync(relativePath)

  const filePath = `<rootDir>/${relativePath}`

  return exists ? (inArray ? [filePath] : filePath) : undefined
}
