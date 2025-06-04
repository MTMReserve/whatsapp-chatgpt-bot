// src/server.ts

import 'dotenv/config';
import createApp from './app';
import { createDbPool, testDbConnection } from './utils/db';
import { logger } from './utils/logger';
import { connectToMongo } from './config/mongoConnect';

/**
 * Função de inicialização do servidor principal da aplicação.
 * Responsável por:
 * - Criar conexões com bancos (MySQL, MongoDB)
 * - Inicializar a aplicação Express
 * - Subir o servidor HTTP
 */
async function bootstrap(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  try {
    logger.info(`[bootstrap] 🌍 Ambiente: ${nodeEnv}`);
    logger.info(`[bootstrap] 📡 Iniciando servidor na porta ${port}...`);

    // 🧪 Etapa 1: Criar pool de conexão com MySQL
    logger.debug('[bootstrap] 🔄 Criando pool do MySQL...');
    createDbPool();

    // 🧪 Etapa 2: Testar conexão com MySQL
    logger.debug('[bootstrap] 🔄 Testando conexão MySQL...');
    await testDbConnection();
    logger.debug('[bootstrap] ✅ MySQL conectado com sucesso');

    // 🧪 Etapa 3: Conectar ao MongoDB
    logger.debug('[bootstrap] 🔄 Conectando ao MongoDB...');
    await connectToMongo();
    logger.debug('[bootstrap] ✅ MongoDB conectado com sucesso');

    // 🧪 Etapa 4: Criar aplicação Express
    logger.debug('[bootstrap] 🚧 Criando app Express...');
    const app = createApp();

    // 🧪 Etapa 5: Iniciar servidor HTTP
    app.listen(port, () => {
      logger.info(`[bootstrap] 🚀 Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('[bootstrap] ❌ Falha ao iniciar o servidor', err as Error);
    process.exit(1); // Encerra a aplicação com erro
  }
}

bootstrap();
