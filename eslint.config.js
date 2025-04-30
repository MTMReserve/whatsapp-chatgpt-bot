// eslint.config.js – versão corrigida para CommonJS
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

/** @type {import("eslint").Linter.Config} */
module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
