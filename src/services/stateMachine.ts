// src/services/stateMachine.ts

import { BotState, intentMap } from './intentMap';

const DEFAULT_STATE: BotState = 'levantamento';
const MAX_RETRIES_PER_STATE = 3;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Classifica a intenção do cliente com base em palavras e pontuação.
 * Retorna o estado mais provável.
 */
export function classifyIntent(message: string): BotState {
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
    encerramento: 0
  };

  for (const [state, intents] of Object.entries(intentMap) as [BotState, typeof intentMap[BotState]][]) {
    for (const { word, score } of intents) {
      if (msg.includes(normalize(word))) {
        scores[state] += score;
      }
    }
  }

  const bestMatch = Object.entries(scores).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ['levantamento', 0]
  );

  return bestMatch[1] >= 3 ? (bestMatch[0] as BotState) : DEFAULT_STATE;
}

export function getInitialState(): BotState {
  return 'abordagem';
}

export function getNextState(
  currentState: BotState,
  message: string,
  context: any
): BotState {
  try {
    const intent = classifyIntent(message);
    // Ex: se cliente quiser ir direto pro fechamento, mas não passou por proposta, tenta redirecionar
    if (intent === 'fechamento' && currentState !== 'proposta') {
      return 'proposta';
    }

    // Se intenção for encerramento, mas bot estiver no início → tenta reter
    if (intent === 'encerramento' && currentState === 'abordagem') {
      return 'levantamento';
    }

    return intent;
  } catch (e) {
    return DEFAULT_STATE;
  }
}
