/**
 * @type {import('prettier').Config}
 */
const customPrettierConfig = {
  printWidth: 120,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always',
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
}

module.exports = customPrettierConfig
