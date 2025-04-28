// File: src/server.ts
import 'dotenv/config';
import createApp from './app';
import { createDbPool, testDbConnection } from './utils/db';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    // Inicializa pool de conexões MySQL
    createDbPool();
    await testDbConnection();

    // Cria servidor
    const app = createApp();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    app.listen(port, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('Falha ao iniciar o servidor', err as Error);
    process.exit(1);
  }
}

bootstrap();
