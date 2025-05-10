// ===========================
// File: jest.config.js (CORRIGIDO)
// ===========================
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', 'src'], // ✅ Importações absolutas suportadas
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
