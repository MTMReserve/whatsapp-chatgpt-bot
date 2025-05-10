// src/services/stateMachine.ts

import { BotState, intentMap } from './intentMap';

const DEFAULT_STATE: BotState = 'levantamento';
const MAX_RETRIES_PER_STATE = 3;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Classifica a intenção do cliente com base em palavras e pontuação.
 * Retorna o estado mais provável ou null se nenhuma intenção for forte.
 */
export function classifyIntent(message: string): BotState | null {
  const msg = normalize(message);
  const scores: Record<BotState, number> = {
    abordagem: 0,
    levantamento: 0,
    proposta: 0,
    objecoes: 0,
    negociacao: 0,
    fechamento: 0,
    pos_venda: 0,
    reativacao: 0,
    encerramento: 0,
  };

  for (const [state, intents] of Object.entries(intentMap) as [BotState, typeof intentMap[BotState]][]) {
    for (const { word, score } of intents) {
      const normalizedWord = normalize(word);
      if (msg.includes(normalizedWord)) {
        scores[state] += score;
      }
    }
  }

  const bestMatch = Object.entries(scores).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    [DEFAULT_STATE, 0]
  );

  return bestMatch[1] >= 3 ? (bestMatch[0] as BotState) : null;
}

export function getInitialState(): BotState {
  return 'abordagem';
}

/**
 * Determina o próximo estado baseado no estado atual e na mensagem recebida,
 * aplicando regras de transição e controle de repetição.
 */
export function getNextState(
  currentState: BotState,
  message: string,
  context: { retries?: Partial<Record<BotState, number>> }
): BotState {
  try {
    const intent = classifyIntent(message);

    const retries = context?.retries?.[currentState] ?? 0;
    if (retries >= MAX_RETRIES_PER_STATE) {
      return 'encerramento';
    }

    if (!intent) {
      return currentState;
    }

    if (intent === 'fechamento' && currentState !== 'proposta') {
      return 'proposta';
    }

    if (intent === 'encerramento' && currentState === 'abordagem') {
      return 'levantamento';
    }

    return intent;
  } catch (e) {
    return currentState ?? DEFAULT_STATE;
  }
}
