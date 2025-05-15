// src/server.ts

import 'dotenv/config';
import createApp from './app';
import { createDbPool, testDbConnection } from './utils/db';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    logger.info(`🌍 Ambiente: ${nodeEnv}`);
    logger.info(`📡 Iniciando servidor na porta ${port}...`);

    // Inicializa conexão com banco (cria pool)
    createDbPool();

    // Verifica a conexão antes de subir o servidor
    await testDbConnection();

    // Cria e inicia servidor
    const app = createApp();
    app.listen(port, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('❌ Falha ao iniciar o servidor', err as Error);
    process.exit(1);
  }
}

bootstrap();
