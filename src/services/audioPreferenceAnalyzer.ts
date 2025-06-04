// ===============================
// File: src/services/audioPreferenceAnalyzer.ts
// ===============================

import { getAudioCount } from './audioCounter';
import { logger } from '../utils/logger';

/**
 * Determina se o cliente prefere receber respostas por áudio.
 *
 * A decisão é baseada na contagem de mensagens de áudio já enviadas pelo cliente.
 * Se o cliente já enviou pelo menos uma mensagem de áudio, assume-se que ele prefere áudio.
 *
 * @param phone Número de telefone do cliente (WhatsApp)
 * @returns true se o cliente já usou áudio, false caso contrário
 */
export function clientePrefereAudio(phone: string): boolean {
  const count = getAudioCount(phone);

  logger.debug(`[clientePrefereAudio] 📊 Cliente ${phone} já enviou ${count} mensagens de áudio.`);

  return count > 0;
}
