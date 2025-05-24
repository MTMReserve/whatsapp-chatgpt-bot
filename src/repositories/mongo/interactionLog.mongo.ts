import mongoose, { Schema, Document } from 'mongoose';
import { logger } from '../../utils/logger';

export interface InteractionData {
  phone: string;
  clientId?: number;
  messageIn: string;
  messageOut: string;
  detectedIntent: string;
  stateBefore: string;
  stateAfter: string;
  responseTimeMs?: number;
  createdAt?: Date;
}

export interface InteractionDocument extends Document, InteractionData {}

const InteractionSchema = new Schema<InteractionDocument>({
  phone: { type: String, required: true },
  clientId: { type: Number, required: false },
  messageIn: { type: String, required: true },
  messageOut: { type: String, required: true },
  detectedIntent: { type: String, required: true },
  stateBefore: { type: String, required: true },
  stateAfter: { type: String, required: true },
  responseTimeMs: { type: Number },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'interactions',
});

export const InteractionModel = mongoose.models.Interaction || mongoose.model<InteractionDocument>('Interaction', InteractionSchema);

/**
 * Valida os campos obrigatórios da interação
 */
function isValidInteraction(data: InteractionData): boolean {
  return !!(
    data &&
    typeof data.phone === 'string' &&
    typeof data.messageIn === 'string' &&
    typeof data.messageOut === 'string' &&
    typeof data.detectedIntent === 'string' &&
    typeof data.stateBefore === 'string' &&
    typeof data.stateAfter === 'string'
  );
}

export async function saveInteractionLog(data: InteractionData): Promise<void> {
  if (!isValidInteraction(data)) {
    logger.warn('[mongo] ⚠️ Dados inválidos. Interação não será salva.', {
      dadosRecebidos: JSON.stringify(data, null, 2)
    });
    return;
  }

  try {
    await InteractionModel.create(data);
    logger.info(`[mongo] 💬 Interação salva no MongoDB para ${data.phone}`);
  } catch (error) {
    logger.warn(`[mongo] ⚠️ Erro ao salvar interação — tentativa de retry para ${data.phone}`, {
      error,
      dados: JSON.stringify(data, null, 2)
    });

    try {
      await InteractionModel.create(data);
      logger.info(`[mongo] ♻️ Retry bem-sucedido para ${data.phone}`);
    } catch (retryErr) {
      logger.error(`[mongo] ❌ Falha persistente ao salvar interação no MongoDB`, {
        error: retryErr,
        dados: JSON.stringify(data, null, 2)
      });
    }
  }
}

export async function getConversationByPhone(phone: string): Promise<InteractionData[]> {
  try {
    const result = await InteractionModel.find({ phone }).sort({ createdAt: 1 });
    logger.info(`[mongo] 📖 Histórico carregado para ${phone}, total de ${result.length} mensagens.`);
    return result;
  } catch (err) {
    logger.error(`[mongo] ❌ Erro ao buscar histórico de ${phone}`, { error: err });
    return [];
  }
}
