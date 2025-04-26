// ===============================
// File: src/server.ts
// ===============================

// 1) Carrega .env antes de qualquer coisa
import 'dotenv/config';

import { loadEnv } from './config/env';
import { createDbPool, testDbConnection } from './utils/db';
import createApp from './app';                         // <- default import
import { logger } from './utils/logger';
import { updateNgrokEnv } from './utils/ngrokUpdater'; // <- named import

async function bootstrap() {
  // 2) Valida e carrega as variáveis de ambiente no processo
  loadEnv();

  // 3) Conexão com o banco de dados
  createDbPool();
  await testDbConnection();

  // 4) Cria o Express app já configurado
  const app = createApp();

  // 5) Porta
  const port = process.env.PORT || 3000;

  // 6) Inicia o servidor
  app.listen(port, async () => {
    logger.info(`🚀 Servidor rodando na porta ${port}`);
    logger.info('Logger funcionando corretamente!');

    // 7) (Opcional) Atualiza dinamicamente a variável no .env
    try {
      await updateNgrokEnv(process.env.TWILIO_WHATSAPP_NUMBER_FROM!);
      logger.info('✅ TWILIO_WHATSAPP_NUMBER_FROM atualizado com sucesso no .env');
    } catch (err) {
      logger.error('❌ Falha ao atualizar TWILIO_WHATSAPP_NUMBER_FROM:', err);
    }
  });
}

bootstrap();
