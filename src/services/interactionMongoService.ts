import { logger } from '../utils/logger';
const { InteractionModel } = require('../repositories/mongo/interactionLog.mongo'); // ✅ correto
import { type InteractionData } from '../repositories/mongo/interactionLog.mongo';
import { Profile, type PerfilCliente } from '../models/Profile';

export type { InteractionData }; // ✅ necessário para uso em testes

/**
 * Valida os campos obrigatórios antes de salvar
 */
function isValidInteraction(data: InteractionData): boolean {
  return !!(
    data &&
    typeof data.phone === 'string' &&
    data.phone.length > 8 &&
    typeof data.messageIn === 'string' &&
    typeof data.messageOut === 'string' &&
    typeof data.clientId === 'number'
  );
}

/**
 * Salva uma nova interação individual no MongoDB
 */
export async function saveMessageToMongo(data: InteractionData): Promise<void> {
  try {
    logger.debug('[mongo] 📤 Dados recebidos para salvar:', JSON.stringify(data, null, 2));

    if (!isValidInteraction(data)) {
      logger.warn('[mongo] ⚠️ Dados inválidos, interação não será salva', {
        data: JSON.stringify(data, null, 2)
      });
      return;
    }

    await InteractionModel.create(data);
    logger.debug(`[mongo] 💾 Interação salva com sucesso para ${data.phone}`);
  } catch (err) {
    const error = err as Error;
    logger.error('[mongo] ❌ Erro ao salvar interação no MongoDB', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      dados: JSON.stringify(data, null, 2)
    });
  }
}

/**
 * Retorna o histórico completo de interações de um telefone
 */
export async function getConversationByPhone(phone: string): Promise<InteractionData[]> {
  try {
    const result = await InteractionModel.find({ phone }).sort({ createdAt: 1 });
    logger.info(`[mongo] 📖 Histórico carregado para ${phone}, total de ${result.length} mensagens.`);
    return result;
  } catch (err) {
    logger.error('[mongo] ❌ Erro ao buscar histórico de interações no MongoDB', { error: err });
    return [];
  }
}

/**
 * Verifica se o perfil do cliente já foi analisado
 */
export async function hasAnalyzedProfile(phone: string): Promise<boolean> {
  try {
    const profile = await Profile.findOne({ phone });
    return !!profile;
  } catch (err) {
    logger.error('[mongo] ❌ Erro ao verificar perfil do cliente no MongoDB', { error: err });
    return false;
  }
}

/**
 * Salva o perfil analisado no MongoDB
 */
export async function markProfileAsAnalyzed(phone: string, perfil: PerfilCliente): Promise<void> {
  try {
    await Profile.updateOne(
      { phone },
      { $set: { perfilCompleto: perfil, analisadoEm: new Date() } },
      { upsert: true }
    );
    logger.debug(`[mongo] 🧾 Perfil registrado para ${phone}`);
  } catch (err) {
    logger.error('[mongo] ❌ Erro ao salvar perfil do cliente no MongoDB', { error: err });
  }
}
