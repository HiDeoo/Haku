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
  globalSetup: `<rootDir>/src/tests/${process.env.TEST_TYPE}/globalSetup.ts`,
  globalTeardown: `<rootDir>/src/tests/${process.env.TEST_TYPE}/globalTeardown.ts`,
  setupFilesAfterEnv: [`<rootDir>/src/tests/${process.env.TEST_TYPE}/filesSetup.ts`],
  testMatch: [`<rootDir>/src/tests/${process.env.TEST_TYPE}/**/*.test.ts`],
}

module.exports = createJestConfig(customJestConfig)
