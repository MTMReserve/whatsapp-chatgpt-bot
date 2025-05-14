import { BotState, intentMap } from './intentMap';
import { openai } from '../api/openai'; // para classifyIntentWithAI
const MAX_RETRIES_PER_STATE = 3;

/**
 * Remove acentuação e passa para minúsculas.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Heurística simples: soma pontuações por palavra-chave.
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

  for (const [state, intents] of Object.entries(intentMap) as [
    BotState,
    typeof intentMap[BotState]
  ][]) {
    for (const { word, score } of intents) {
      if (msg.includes(normalize(word))) {
        scores[state] += score;
      }
    }
  }

  const [bestState, bestScore] = Object.entries(scores).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ['levantamento', 0]
  );

  return bestScore >= 3 ? (bestState as BotState) : null;
}

/**
 * Classificação via ChatGPT como fallback.
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
        { role: 'user', content: message }
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
 * Estado inicial do funil.
 */
export function getInitialState(): BotState {
  return 'abordagem';
}

/**
 * Próximo estado do funil:
 * 1) tenta heurística;
 * 2) se falhar, fallback com ChatGPT;
 * 3) se ainda falhar, mantém currentState;
 * 4) trata casos especiais de transição.
 */
export async function getNextState(
  currentState: BotState,
  message: string,
  context: { retries?: Partial<Record<BotState, number>> }
): Promise<BotState> {
  try {
    // 1) heurística local
    let intent = classifyIntent(message);

    // 2) trata excesso de tentativas
    const retries = context?.retries?.[currentState] ?? 0;
    if (retries >= MAX_RETRIES_PER_STATE) {
      return 'encerramento';
    }

    // 3) fallback IA se sem intenção heurística
    if (!intent) {
      intent = await classifyIntentWithAI(message);
    }

    // 4) se ainda sem intenção, permanece no mesmo estado
    if (!intent) {
      return currentState;
    }

    // 5) regras especiais
    if (intent === 'fechamento' && currentState !== 'proposta') {
      return 'proposta';
    }
    if (intent === 'encerramento' && currentState === 'abordagem') {
      return 'levantamento';
    }

    // 6) caso normal
    return intent;
  } catch (e) {
    console.error('Erro no getNextState:', e);
    return currentState;
  }
}
