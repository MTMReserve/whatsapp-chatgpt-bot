// src/repositories/mongo/rejectionLog.mongo.ts

import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../../utils/logger';

export interface CampoRejeitado {
  phone: string;
  clientId: number;
  campo: string;
  valor: any;
  motivo: string;
  messageIn: string;
  createdAt?: Date;
}

export interface RejectionDocument extends Document, CampoRejeitado {}

const RejectionSchema = new Schema<RejectionDocument>({
  phone: { type: String, required: true },
  clientId: { type: Number, required: true },
  campo: { type: String, required: true },
  valor: { type: Schema.Types.Mixed, required: true },
  motivo: { type: String, required: true },
  messageIn: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'rejections',
});

const RejectionModel = mongoose.models.Rejection || mongoose.model<RejectionDocument>('Rejection', RejectionSchema);

export async function logCampoRejeitado(data: CampoRejeitado): Promise<void> {
  try {
    await RejectionModel.create(data);
    logger.info(`[mongo] ⚠️ Campo rejeitado salvo no MongoDB: ${data.phone} | ${data.campo}`);
  } catch (err) {
    logger.error(`[mongo] ❌ Erro ao salvar campo rejeitado`, { error: err, data });
  }
}
