// jest.setup.ts
// ⚙️ Carregado automaticamente antes de todos os testes via Jest

import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 1. Prioriza carregar o arquivo .env.test se existir
const envPath = fs.existsSync('.env.test') ? '.env.test' : '.env';
dotenv.config({ path: envPath });

// 2. Garante ambiente de teste isolado
process.env.NODE_ENV = 'test';

// 3. Confirmação para o terminal
if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'test') {
  console.info(`[Jest Setup] ✅ Ambiente de testes carregado (${envPath})`);
}
