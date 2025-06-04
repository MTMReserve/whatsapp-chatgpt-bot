// ===============================
// File: src/repositories/mongo/logsEstrategia.mongo.ts
// ===============================

import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../../utils/logger';

/**
 * Estrutura de dados do log de estratégia (negociação)
 */
export interface LogEstrategiaData {
  phone: string;
  etapa: string;
  resposta_original: string;
  causas_rejeicao: string[];
  nova_tentativa: string;
  createdAt?: Date;
}

/**
 * Documento MongoDB com tipo estendido
 */
interface LogEstrategiaDocument extends Document, LogEstrategiaData {}

/**
 * Schema do MongoDB para logs_estrategia
 */
const LogEstrategiaSchema = new Schema<LogEstrategiaDocument>(
  {
    phone: { type: String, required: true },
    etapa: { type: String, required: true },
    resposta_original: { type: String, required: true },
    causas_rejeicao: { type: [String], required: true },
    nova_tentativa: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'logs_estrategia',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/**
 * Modelo Mongoose para persistência dos logs
 */
export const LogEstrategiaModel =
  mongoose.models.LogEstrategia ||
  mongoose.model<LogEstrategiaDocument>('LogEstrategia', LogEstrategiaSchema);

/**
 * Salva tentativa rejeitada e nova geração da IA na etapa de negociação.
 */
export async function saveNegociacaoLog(data: LogEstrategiaData): Promise<void> {
  try {
    await LogEstrategiaModel.create(data);
    logger.info(`[mongo] 🧠 Log de negociação salvo com sucesso para ${data.phone}`);
  } catch (error) {
    logger.error(`[mongo] ❌ Erro ao salvar log de estratégia no MongoDB`, {
      error,
      dados: JSON.stringify(data, null, 2),
    });
  }
}
