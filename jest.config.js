module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Coverage settings
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: { lines: 100, branches: 100, functions: 100 },
    './src/**/*.ts': { lines: 100, branches: 100, functions: 100 }
  },

  // Procura testes em src/tests/**/*.test.ts e em tests/e2e/**/*.e2e.ts
  testMatch: [
    '**/src/tests/**/*.test.ts',
    '**/tests/e2e/**/*.e2e.ts'
  ],

  moduleFileExtensions: ['ts', 'js', 'json'],

  // Se não tiver um arquivo jest.setup.ts, comente ou remova esta linha
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // Permite importações absolutas a partir da raiz 'src'
  moduleDirectories: ['node_modules', 'src'],

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
