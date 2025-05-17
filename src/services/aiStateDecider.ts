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

const systemPrompt = [
  "Você é um especialista em vendas por WhatsApp. Receberá o estado atual de um funil de vendas e a última mensagem enviada pelo cliente.",
  "Sua tarefa é decidir para qual etapa do funil o bot deve ir agora. Responda apenas com o nome da etapa.",
  "",
  "Etapas válidas:",
  "- abordagem",
  "- levantamento",
  "- proposta",
  "- objecoes",
  "- negociacao",
  "- fechamento",
  "- pos_venda",
  "- reativacao",
  "- encerramento",
  "",
  "⚠️ Importante:",
  "- Só envie para 'abordagem' se for o primeiro contato ou se a conversa estiver completamente incoerente.",
  "- Evite retornar para 'abordagem' se o cliente já respondeu alguma coisa ou demonstrou interesse.",
  "- Nunca envie para 'abordagem' depois de 'levantamento', 'proposta' ou estados mais avançados.",
  "",
  "Se o cliente estiver pronto para comprar, avance para fechamento.",
  "Se ele ainda estiver decidindo, mantenha ou volte para objecoes ou proposta.",
  "Se já comprou, vá para pos_venda.",
  "Se sumiu, vá para reativacao.",
  "Se quiser sair, vá para encerramento.",
  "",
  "Responda apenas com o nome da próxima etapa. Nenhuma explicação adicional."
].join("\n");

export async function getNextStateByAI(
  input: StateDecisionInput
): Promise<StateDecisionOutput> {
  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Estado atual: ${input.currentState}\nÚltima mensagem: ${input.userMessage}` }
    ];

    logger.debug('[aiStateDecider] Enviando para IA decidir próximo estado', {
      currentState: input.currentState,
      userMessage: input.userMessage
    });

    const completion = await createChatCompletion(messages);

    const nextState = completion.choices?.[0]?.message?.content?.trim().toLowerCase() || input.currentState;

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
