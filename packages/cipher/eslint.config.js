const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    files: ['src/**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Not cryptographically secure. Take a RandomSource parameter instead (see src/random.ts).',
        },
      ],
    },
  },
]);
