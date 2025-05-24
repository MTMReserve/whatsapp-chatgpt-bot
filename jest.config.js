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

  // Procura testes em src/tests, tests/e2e e agora também em tests/integration
  testMatch: [
    '**/src/tests/**/*.test.ts',
    '**/tests/e2e/**/*.e2e.ts',
    '**/tests/integration/**/*.test.ts' // ✅ ADICIONADO
  ],

  moduleFileExtensions: ['ts', 'js', 'json'],

  // Setup opcional
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // ✅ Suporte a importações absolutas
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1' // ✅ ADICIONADO
  },

  // ✅ Corrige aviso deprecado do ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', {}]
  }
};
