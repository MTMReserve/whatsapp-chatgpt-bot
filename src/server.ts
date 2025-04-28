// src/server.ts

import 'dotenv/config';                  // Carrega .env imediatamente
import createApp from './app';           // Factory do Express
import { loadEnv } from './config/env';  // Validação de ENV
import { createDbPool, testDbConnection } from './utils/db';
import { logger } from './utils/logger';
import { updateNgrokEnv } from './utils/ngrokUpdater';

async function bootstrap(): Promise<void> {
  // 1) Valida e obtém as variáveis de ambiente
  const env = loadEnv();

  // 2) Inicializa e testa o pool de conexões MySQL
  createDbPool();
  await testDbConnection();

  // 3) Cria o app Express
  const app = createApp();

  // 4) Atualiza o Webhook do Twilio com a URL gerada pelo Ngrok
  try {
    await updateNgrokEnv(env.TWILIO_WHATSAPP_NUMBER_FROM);
    logger.info('✅ Webhook Twilio atualizado com a URL do Ngrok');
  } catch (error) {
    logger.error('❌ Falha ao atualizar webhook Twilio:', error);
  }

  // 5) Inicia o servidor na porta configurada
  const port = Number(env.PORT ?? 3000);
  app.listen(port, () => {
    logger.info(`🚀 Servidor rodando na porta ${port}`);
  });
}

// Executa o bootstrap e trata falhas
bootstrap().catch((err) => {
  logger.error('❌ Erro no bootstrap:', err);
  process.exit(1);
});
