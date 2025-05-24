// src/config/mongoConnect.ts

import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { env } from './env'; // usa src/config/env.ts

export async function connectToMongo(): Promise<void> {
  try {
    logger.debug(`[mongo] ⏳ Conectando ao MongoDB em: ${env.MONGO_URL}`);

    await mongoose.connect(env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000, // ⏱️ impede travamento infinito
    });

    logger.info(`[mongo] ✅ Conectado com sucesso ao MongoDB: ${env.MONGO_URL}`);
  } catch (err) {
    logger.error('[mongo] ❌ Falha ao conectar no MongoDB', {
      message: (err as any)?.message,
      stack: (err as any)?.stack,
    });

    process.exit(1); // encerra a aplicação
  }
}
