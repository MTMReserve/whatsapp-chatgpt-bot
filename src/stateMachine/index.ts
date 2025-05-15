// @ts-nocheck
import { createMachine, assign } from 'xstate';
import { logger } from '../utils/logger';
import type { BotState } from '../services/intentMap';

export const funnelMachine = createMachine(
  {
    id: 'funnel',
    initial: 'abordagem',
    context: { retries: 0 },
    states: {
      abordagem: makeState('levantamento'),
      levantamento: makeState('proposta'),
      proposta: makeState('objecoes'),
      objecoes: makeState('negociacao'),
      negociacao: makeState('fechamento'),
      fechamento: makeState('pos_venda'),
      pos_venda: makeState('reativacao'),
      reativacao: makeState('encerramento'),
      encerramento: {
        type: 'final',
        entry: () => logger.info('[XState] Estado final atingido: encerramento')
      }
    }
  },
  {
    actions: {
      incrementRetry: assign({
        retries: (ctx) => {
          const updated = ctx.retries + 1;
          logger.warn(`[XState] Retry incrementado: ${updated}`);
          return updated;
        }
      }),
      resetRetry: assign({
        retries: (_ctx) => {
          logger.debug(`[XState] Retry resetado para 0`);
          return 0;
        }
      })
    }
  }
);

function makeState(expected: BotState) {
  return {
    entry: () => logger.debug(`[XState] Entrou no estado: ${expected}`),
    on: {
      INTENT: [
        {
          cond: (_ctx, ev) => {
            const match = ev.intent === expected;
            logger.debug(`[XState] Intent recebida: ${ev.intent} | Esperada: ${expected} | Match: ${match}`);
            return match;
          },
          target: expected,
          actions: 'resetRetry'
        },
        {
          cond: (ctx) => {
            const canRetry = ctx.retries < 2;
            logger.debug(`[XState] Tentativas atuais: ${ctx.retries} | Pode tentar novamente? ${canRetry}`);
            return canRetry;
          },
          actions: 'incrementRetry'
        },
        {
          target: 'encerramento',
          actions: 'incrementRetry'
        }
      ]
    }
  };
}
