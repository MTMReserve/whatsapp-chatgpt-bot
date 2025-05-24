import { logger } from '../utils/logger';

/**
 * Simula digitação realista antes de enviar uma mensagem.
 * Tempo aleatório entre 3 e 7 segundos.
 *
 * @param sendFn Função assíncrona que envia a mensagem
 * @param context Texto descritivo para logs
 */
export async function simulateRealisticTyping(sendFn: () => Promise<void>, context = 'resposta'): Promise<void> {
  const delay = Math.floor(Math.random() * 4000) + 3000;

  try {
    logger.info(`[typingSimulator] ⌛ Simulando digitação para ${context} — aguardando ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));

    logger.info(`[typingSimulator] 🚀 Enviando ${context} após digitação`);
    await sendFn();

    logger.info(`[typingSimulator] ✅ ${context} enviada com sucesso`);
  } catch (error) {
    logger.error(`[typingSimulator] ❌ Erro ao enviar ${context}`, { error });
  }
}
