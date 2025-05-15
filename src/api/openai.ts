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
  options?: { model?: string; temperature?: number }
) {
  try {
    const model = options?.model || env.OPENAI_MODEL || 'gpt-4';
    const temperature = options?.temperature ?? (Number(env.OPENAI_TEMPERATURE) || 0.7);

    logger.debug('[openai] Criando chat completion', { model, temperature, messages });

    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages,
    });

    logger.debug('[openai] Completion recebida', {
      finish_reason: completion.choices?.[0]?.finish_reason,
      usage: completion.usage,
    });

    return completion;
  } catch (error: any) {
    logger.error('[openai] Erro na criação do chat completion', { error });
    throw error;
  }
}
