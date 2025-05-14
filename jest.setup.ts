// jest.setup.ts
// ⚙️ Este arquivo é carregado automaticamente antes de todos os testes via Jest

import * as dotenv from 'dotenv';

// Carrega o arquivo de ambiente (priorize .env.test se quiser separar ambientes)
dotenv.config({ path: '.env' });  // ou '.env.test'

// Garante que os testes rodem em ambiente isolado
process.env.NODE_ENV = 'test';

// 🔐 LOG opcional para confirmação (pode remover em produção)
console.info('[Jest Setup] Ambiente de testes carregado com sucesso');
