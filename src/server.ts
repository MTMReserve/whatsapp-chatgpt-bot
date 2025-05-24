// src/server.ts

import 'dotenv/config';
import createApp from './app';
import { createDbPool, testDbConnection } from './utils/db';
import { logger } from './utils/logger';
import { connectToMongo } from './config/mongoConnect'; // ✅ Conexão MongoDB

async function bootstrap() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    logger.info(`🌍 Ambiente: ${nodeEnv}`);
    logger.info(`📡 Iniciando servidor na porta ${port}...`);

    // 🧪 Etapa 1: criar pool de conexão com MySQL
    logger.debug('🔄 Criando pool do MySQL...');
    createDbPool();

    // 🧪 Etapa 2: testar conexão com MySQL
    logger.debug('🔄 Testando conexão MySQL...');
    await testDbConnection();
    logger.debug('✅ MySQL conectado com sucesso');

    // 🧪 Etapa 3: conectar ao MongoDB
    logger.debug('🔄 Conectando ao MongoDB...');
    await connectToMongo();
    logger.debug('✅ MongoDB conectado com sucesso');

    // 🧪 Etapa 4: criar aplicação Express
    logger.debug('🚧 Criando app Express...');
    const app = createApp();

    // 🧪 Etapa 5: iniciar servidor HTTP
    app.listen(port, () => {
      logger.info(`🚀 Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('❌ Falha ao iniciar o servidor', err as Error);
    process.exit(1);
  }
}

bootstrap();
