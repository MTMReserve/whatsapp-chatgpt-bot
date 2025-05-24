// src/tests/unit/stateMachine.test.ts

import { createMachine, interpret } from 'xstate';
import { funnelMachine } from '../../../src/stateMachine';

describe('StateMachine – Transições e Regras', () => {
  it('deve transitar corretamente de abordagem para levantamento', () => {
    const next = funnelMachine.transition('abordagem', { type: 'INTENT', intent: 'levantamento' });
    expect(next.value).toBe('levantamento');
  });

  it('deve incrementar retry em intenção errada', () => {
    const initialContext = { retries: 0 };
    const current = funnelMachine.transition('levantamento', { type: 'INTENT', intent: 'abordagem' }, { context: initialContext });

    expect(current.value).toBe('levantamento');
    expect(current.context.retries).toBe(1);
  });

  it('deve encerrar após 3 tentativas erradas', () => {
    let context = { retries: 0 };
    let state = funnelMachine.transition('levantamento', { type: 'INTENT', intent: 'errado' }, { context });
    context = state.context;

    state = funnelMachine.transition('levantamento', { type: 'INTENT', intent: 'errado' }, { context });
    context = state.context;

    state = funnelMachine.transition('levantamento', { type: 'INTENT', intent: 'errado' }, { context });

    expect(state.value).toBe('encerramento');
  });

  it('deve manter estado final após encerramento', () => {
    const state = funnelMachine.transition('encerramento', { type: 'INTENT', intent: 'qualquer' });
    expect(state.value).toBe('encerramento');
    expect(state.done).toBe(true);
  });
});
