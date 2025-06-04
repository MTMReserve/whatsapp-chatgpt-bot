// src/services/aiStateDecider.ts

import { createChatCompletion } from '../api/openai';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { gerarResumoDoHistorico } from './resumoDoHistorico';
import { ClientRepository } from './clientRepository'; // ✅ Adicionado para verificar nome do cliente
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface StateDecisionInput {
  currentState: string;
  userMessage: string;
  phone: string;
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

const baseSystemPrompt = `
Você é um assistente de vendas que decide a próxima etapa do funil com base na conversa e no que já sabemos sobre o cliente.

Etapas válidas: ${etapasValidas.map(e => `"${e}"`).join(', ')}

✅ REGRAS:
- Você deve pular etapas se os dados da etapa atual já foram preenchidos.
- Retorne **apenas o nome da próxima etapa** (sem explicação).
- NÃO repita a etapa atual, a menos que o cliente esteja confuso ou travado.
- Use o histórico conhecido para evitar repetir perguntas.

⚠️ Formato da resposta: apenas uma das strings acima. Sem texto adicional.
`.trim();

export async function getNextStateByAI(input: StateDecisionInput): Promise<StateDecisionOutput> {
  try {
    const client = await ClientRepository.findByPhone(input.phone);

    if (!client?.name || client.name.trim().toLowerCase() === 'cliente') {
      logger.warn(`[aiStateDecider] 🚧 Nome do cliente ainda não identificado — Forçando etapa 'abordagem'`);
      return { nextState: 'abordagem', reason: 'nome ainda não identificado' };
    }

    const resumoHistorico = await gerarResumoDoHistorico(input.phone);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: baseSystemPrompt },
      {
        role: 'user',
        content: `
Etapa atual: ${input.currentState}
Mensagem do cliente: ${input.userMessage}
${resumoHistorico}
`.trim()
      }
    ];

    logger.debug('[aiStateDecider] Enviando para IA decidir próximo estado', {
      currentState: input.currentState,
      userMessage: input.userMessage
    });

    const completion = await createChatCompletion(messages);

    const nextState =
      completion.choices?.[0]?.message?.content?.trim().toLowerCase() || input.currentState;

    if (!etapasValidas.includes(nextState)) {
      logger.warn('[aiStateDecider] 🚫 Estado inválido sugerido pela IA', { nextState });
      return { nextState: input.currentState, reason: 'estado inválido sugerido pela IA' };
    }

    logger.info(`[aiStateDecider] 🧭 Etapa atual: ${input.currentState} — IA sugeriu: ${nextState}`);

    return { nextState };
  } catch (error) {
    logger.error('Erro ao decidir próximo estado com IA:', error);
    return { nextState: input.currentState, reason: 'fallback devido a erro' };
  }
}
