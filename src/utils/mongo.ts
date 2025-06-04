// ===============================
// File: src/utils/mongo.ts
// ===============================

import mongoose from 'mongoose';
import { logger } from './logger';
import { env } from '../config/env'; // ✅ Correção: usa env tipado

export async function connectMongo(): Promise<void> {
  const mongoUri = env.MONGO_URL; // ✅ Correto e validado com Zod

  logger.info('[mongo] 📦 Iniciando rotina de conexão com MongoDB...');

  if (!mongoUri) {
    logger.error('[mongo] ❌ MONGO_URL não está definida nas variáveis de ambiente.');
    throw new Error('MONGO_URL não definida');
  }

  logger.debug(`[mongo] URI recebida: ${mongoUri}`);

  try {
    logger.info('[mongo] ⏳ Tentando se conectar ao MongoDB...');

    await mongoose.connect(mongoUri, {
      dbName: 'bot_whatsapp',
      serverSelectionTimeoutMS: 5000, // ⏱️ timeout de segurança
    });

    logger.info('[mongo] ✅ mongoose.connect() finalizou com sucesso'); // ✅ Log imediato após conexão

    const connection = mongoose.connection;

    connection.on('connected', () => {
      logger.info('[mongo] ✅ Conectado com sucesso ao MongoDB');
    });

    connection.on('error', (err) => {
      logger.error('[mongo] ❌ Erro de conexão detectado após conectar', { error: err });
    });

    connection.on('disconnected', () => {
      logger.warn('[mongo] ⚠️ Conexão com MongoDB foi perdida');
    });

    connection.on('reconnected', () => {
      logger.info('[mongo] 🔄 Conexão com MongoDB foi restabelecida');
    });
  } catch (error: any) {
    logger.error('[mongo] ❌ Erro fatal ao tentar conectar ao MongoDB');
    logger.error(`[mongo] Mensagem: ${error.message}`);
    logger.error(`[mongo] Stack: ${error.stack}`);
    process.exit(1);
  }
}
