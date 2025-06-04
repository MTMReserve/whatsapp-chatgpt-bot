// ===============================
// File: src/repositories/mongo/auditLog.mongo.ts
// ===============================

import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../../utils/logger';
import { AuditLog } from '../../types/MongoSchemas';

/**
 * Documento Mongo com tipagem extendida
 */
interface AuditLogDocument extends Document, AuditLog {}

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    clientId: { type: String, required: false }, // ❗ Corrigido para permitir vazio
    phone: { type: String, required: true },
    etapa: { type: String, required: true },
    mensagem: { type: String, required: true },
    respostaGerada: { type: String, required: true },
    timestamp: { type: Date, required: true },
    stateBefore: { type: String, required: false, default: '' }, // ❗ Opcional para registros simplificados
    stateAfter: { type: String, required: false, default: '' },
    detectedIntent: { type: String, required: false, default: '' },
    erro: { type: String },
    produtoId: { type: String, default: null }
  },
  {
    collection: 'auditLogs',
    timestamps: false,
  }
);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);

/**
 * Salva log de auditoria completo com estado antes e depois, intenção detectada e rastreabilidade.
 */
export async function saveAuditLog(log: AuditLog): Promise<void> {
  try {
    const logCompleto: AuditLog = {
      ...log,
      produtoId: log.produtoId ?? null,
      clientId: log.clientId ?? '',
      stateBefore: log.stateBefore ?? '',
      stateAfter: log.stateAfter ?? '',
      detectedIntent: log.detectedIntent ?? '',
    };

    await AuditLogModel.create(logCompleto);
    logger.info(`[mongo] 📄 AuditLog salvo com sucesso para ${log.phone}`);
  } catch (error) {
    logger.error('[mongo] ❌ Erro ao salvar AuditLog no MongoDB', {
      error,
      dados: JSON.stringify(log, null, 2)
    });
  }
}
