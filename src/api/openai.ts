// src/api/openai.ts

import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

logger.info('[openai] Inicializando cliente OpenAI');

export const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

// Wrapper opcional com logs
export async function createChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: { model?: string; temperature?: number; funnelStage?: string }
) {
  try {
    const model = options?.model || env.OPENAI_MODEL || 'gpt-4';

    // Estratégia para log de origem da temperatura
    let temperature: number;
    let origem: string;

    if (typeof options?.temperature === 'number') {
      temperature = options.temperature;
      origem = 'forçada via parâmetro options';
    } else if (env.OPENAI_TEMPERATURE) {
      temperature = Number(env.OPENAI_TEMPERATURE);
      origem = 'vinda do .env ou env.ts';
    } else {
      temperature = 0.7;
      origem = 'valor padrão hardcoded (0.7)';
    }

    // 🔍 Sugestão de lógica futura baseada em etapas do funil
    // if (options?.funnelStage === 'levantamento') temperature = 0.9;
    // if (options?.funnelStage === 'negociacao') temperature = 0.5;
    // if (options?.funnelStage === 'fechamento') temperature = 0.3;

    logger.debug('[openai] Criando chat completion', {
      model,
      temperature,
      origem,
      mensagens: messages.map(m => ({ role: m.role, preview: m.content?.slice(0, 60) }))
    });

    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages,
    });

    const botText = completion.choices?.[0]?.message?.content?.trim() || '[sem resposta]';

    logger.info('[openai] 🤖 Resposta da IA recebida', {
      texto: botText.substring(0, 300) + (botText.length > 300 ? '...' : ''),
    });

    logger.debug('[openai] Completion metadata', {
      finish_reason: completion.choices?.[0]?.finish_reason,
      usage: completion.usage,
    });

    return completion;
  } catch (error: any) {
    logger.error('[openai] Erro na criação do chat completion', { error });
    throw error;
  }
}
