// src/services/aiStateDecider.ts

import { createChatCompletion } from '../api/openai';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface StateDecisionInput {
  currentState: string;
  userMessage: string;
  previousMessages?: string[];
}

interface StateDecisionOutput {
  nextState: string;
  reason?: string;
}

const etapasValidas = [
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

const systemPrompt = `
Você é um assistente de vendas responsável por decidir qual a próxima etapa do funil de vendas com base na mensagem do cliente e na etapa atual.

Etapas possíveis: ${etapasValidas.map(e => `"${e}"`).join(', ')}

Sempre retorne apenas a próxima etapa exata como uma das strings acima, sem explicações. Avance de etapa apenas se houver justificativa clara na mensagem.
`.trim();

export async function getNextStateByAI(
  input: StateDecisionInput
): Promise<StateDecisionOutput> {
  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Etapa atual: ${input.currentState}\nMensagem do cliente: ${input.userMessage}` }
    ];

    logger.debug('[aiStateDecider] Enviando para IA decidir próximo estado', {
      currentState: input.currentState,
      userMessage: input.userMessage
    });

    const completion = await createChatCompletion(messages);

    const nextState = completion.choices?.[0]?.message?.content?.trim().toLowerCase() || input.currentState;

    if (!etapasValidas.includes(nextState)) {
      logger.warn('[aiStateDecider] 🚫 Estado inválido sugerido pela IA', { nextState });
      return { nextState: input.currentState, reason: 'estado inválido sugerido pela IA' };
    }

    logger.info(`[aiStateDecider] 🧭 Etapa atual: ${input.currentState} — Mensagem: "${input.userMessage}" — IA sugeriu: ${nextState}`);

    if (nextState === input.currentState) {
      logger.warn('[aiStateDecider] IA não sugeriu mudança de estado, mantendo atual', {
        currentState: input.currentState
      });
    } else {
      logger.info('[aiStateDecider] IA sugeriu nova etapa do funil', {
        from: input.currentState,
        to: nextState
      });
    }

    return { nextState };
  } catch (error) {
    logger.error('Erro ao decidir próximo estado com IA:', error);
    return { nextState: input.currentState, reason: 'fallback devido a erro' };
  }
}
