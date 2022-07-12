const baseConfig = require('@hideoo/prettier-config')

/**
 * @type {import('prettier').Config}
 */
const customPrettierConfig = {
  ...baseConfig,
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
}

module.exports = customPrettierConfig
