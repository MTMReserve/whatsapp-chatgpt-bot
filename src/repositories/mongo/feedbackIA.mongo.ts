// ===============================
// File: src/repositories/mongo/feedbackIA.mongo.ts
// ===============================

import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../../utils/logger';
import { FeedbackIA } from '../../types/MongoSchemas';

/**
 * Documento Mongo estendido com tipo TypeScript
 */
interface FeedbackIADocument extends Document, FeedbackIA {}

const FeedbackIASchema = new Schema<FeedbackIADocument>(
  {
    clientId: { type: String, required: true },
    phone: { type: String, required: true },
    etapa: { type: String, required: true },
    mensagem: { type: String, required: true },
    respostaGerada: { type: String, required: true },
    timestamp: { type: Date, required: true },
    feedback: { type: String, enum: ['positivo', 'negativo'], required: true },
    comentario: { type: String },
    produtoId: { type: String, default: null },
  },
  {
    collection: 'feedbackIA',
    timestamps: false,
  }
);

export const FeedbackIAModel =
  mongoose.models.FeedbackIA || mongoose.model<FeedbackIADocument>('FeedbackIA', FeedbackIASchema);

/**
 * Função para salvar o feedback da IA no MongoDB
 */
export const saveFeedbackIA = async (log: FeedbackIA): Promise<void> => {
  try {
    const logCompleto: FeedbackIA = {
      ...log,
      produtoId: log.produtoId ?? null,
    };

    await FeedbackIAModel.create(logCompleto);
    logger.info(`[mongo] 💬 FeedbackIA salvo com sucesso para ${log.phone}`);
  } catch (error) {
    logger.error('[mongo] ❌ Erro ao salvar FeedbackIA no MongoDB', {
      error,
      dados: JSON.stringify(log, null, 2),
    });
  }
};
