import { BotState, intentMap } from './intentMap';
import { openai } from '../api/openai'; // ✅ Cliente OpenAI
const DEFAULT_STATE: BotState = 'levantamento';
const MAX_RETRIES_PER_STATE = 3;

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Classifica a intenção do cliente com base em palavras e pontuação.
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
 * Classifica a intenção usando o ChatGPT como fallback
 */
export async function classifyIntentWithAI(message: string): Promise<BotState | null> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'Você é um classificador inteligente. Dada uma mensagem, classifique-a em uma das seguintes etapas do funil: abordagem, levantamento, proposta, objecoes, negociacao, fechamento, pos_venda, reativacao, encerramento. Responda apenas com o nome exato da etapa.'
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const intent = response.choices[0]?.message?.content?.trim().toLowerCase();
    const validStates: BotState[] = [
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

    return validStates.includes(intent as BotState) ? (intent as BotState) : null;
  } catch (e) {
    console.error('Erro ao classificar intenção com ChatGPT:', e);
    return null;
  }
}

/**
 * Lógica principal de transição de estado (com fallback via ChatGPT)
 */
export async function getNextState(
  currentState: BotState,
  message: string,
  context: { retries?: Partial<Record<BotState, number>> }
): Promise<BotState> {
  try {
    let intent = classifyIntent(message);

    const retries = context?.retries?.[currentState] ?? 0;
    if (retries >= MAX_RETRIES_PER_STATE) {
      return 'encerramento';
    }

    if (!intent) {
      intent = await classifyIntentWithAI(message);
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
    console.error('Erro no getNextState:', e);
    return currentState ?? DEFAULT_STATE;
  }
}
