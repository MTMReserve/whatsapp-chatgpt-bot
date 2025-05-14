import { createMachine, assign } from 'xstate';
import type { BotState } from '../services/intentMap';

export interface FunnelContext {
  retries: Record<BotState, number>;
}

export type IntentEvent = { type: 'INTENT'; intent: BotState };

export const funnelMachine = createMachine<FunnelContext, IntentEvent>(
  {
    id: 'funnel',
    initial: 'abordagem',
    context: {
      retries: {
        abordagem: 0,
        levantamento: 0,
        proposta: 0,
        objecoes: 0,
        negociacao: 0,
        fechamento: 0,
        pos_venda: 0,
        reativacao: 0,
        encerramento: 0
      }
    },
    states: {
      abordagem: makeState('levantamento'),
      levantamento: makeState('proposta'),
      proposta: makeState('negociacao'),
      objecoes: makeState('negociacao'),
      negociacao: makeState('fechamento'),
      fechamento: makeState('pos_venda'),
      pos_venda: makeState('reativacao'),
      reativacao: makeState('encerramento'),
      encerramento: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      // incrementa retries para o estado atual
      incrementRetry: assign({
        retries: (ctx, _ev, { state }) => ({
          ...ctx.retries,
          [state.value as BotState]: ctx.retries[state.value as BotState] + 1
        })
      }),
      // zera retries para o estado atual (após transição bem sucedida)
      resetRetry: assign({
        retries: (ctx, _ev, { state }) => ({
          ...ctx.retries,
          [state.value as BotState]: 0
        })
      })
    }
  }
);

/**
 * Helper para criar a definição de cada estado com guardas de retries
 */
function makeState(
  nextState: BotState,
  maxRetries = 3
): any {
  return {
    on: {
      INTENT: [
        // se o intent bater com nextState, vai pra lá e reseta retries
        {
          cond: (_ctx: FunnelContext, ev: IntentEvent) =>
            ev.intent === nextState,
          target: nextState,
          actions: 'resetRetry'
        },
        // senão, incrementa retries e decide: permanece ou encerra
        {
          actions: 'incrementRetry',
          cond: (ctx: FunnelContext, _ev: IntentEvent, { state }) =>
            ctx.retries[state.value as BotState] < maxRetries
        },
        {
          target: 'encerramento'
        }
      ]
    }
  };
}
