import { openai } from '../api/openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { BotState } from './intentMap';

/**
 * Consulta o ChatGPT para identificar a intenção caso o intentMap falhe.
 */
export async function detectIntentWithFallback(message: string): Promise<BotState> {
  const systemPrompt = `
  Você é um classificador de intenções para um funil de vendas. 
  Dado o conteúdo de uma mensagem de um cliente, você deve responder apenas com uma destas palavras:
  abordagem, levantamento, proposta, objecoes, negociacao, fechamento, pos_venda, reativacao, encerramento.
  Não explique, não comente, apenas retorne a palavra da intenção correta.
  `;

  const chatMessages = [
    { role: 'system', content: systemPrompt.trim() },
    { role: 'user', content: message }
  ] as any;

  logger.debug('[intentFallback] 🔍 Iniciando fallback de intenção via IA');
  logger.debug('[intentFallback] Prompt do sistema e mensagem do usuário enviados', {
    prompt: systemPrompt.trim(),
    message
  });

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0,
      messages: chatMessages
    });

    const intent = completion
      .choices?.[0]
      ?.message
      ?.content
      ?.trim()
      ?.toLowerCase();

    logger.debug('[intentFallback] 🧠 Resposta recebida do ChatGPT', { intent });

    const validIntents: BotState[] = [
      'abordagem',
      'levantamento',
      'proposta',
      'objecoes',
      'negociacao',
      'fechamento',
      'pos_venda',
      'reativacao',
      'encerramento'
    ];

    if (intent && validIntents.includes(intent as BotState)) {
      logger.info(`[intentFallback] ✅ Intenção reconhecida via fallback: "${intent}"`);
      return intent as BotState;
    } else {
      logger.warn('[intentFallback] ⚠️ Intenção inválida recebida do ChatGPT', { intent });
    }
  } catch (error: any) {
    const erroDetalhado = (error?.response?.data || error?.message || error);
    logger.error('[intentFallback] ❌ Erro ao consultar ChatGPT (fallback)', { erroDetalhado });
  }

  logger.info('[intentFallback] 🔁 Fallback falhou, retornando "levantamento" como padrão');
  return 'levantamento';
}
