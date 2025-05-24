// src/tests/unit/funnelMachine.test.ts

import { interpret, InterpreterFrom, createActor } from 'xstate';
import { funnelMachine } from '../../src/stateMachine';
import type { BotState } from '../../src/services/intentMap';
import { logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger');

describe('FunnelMachine – transições via INTENT', () => {
  let service: InterpreterFrom<typeof funnelMachine>;

  const runIntent = (from: BotState, intent: BotState) => {
    service = interpret(funnelMachine).start(from);
    service.send({ type: 'INTENT', intent });
    const next = service.state.value as BotState;
    service.stop();
    return next;
  };

  it('deve ir de abordagem para levantamento quando intent for levantamento', () => {
    expect(runIntent('abordagem', 'levantamento')).toBe('levantamento');
  });

  it('deve ir de levantamento para proposta quando intent for proposta', () => {
    expect(runIntent('levantamento', 'proposta')).toBe('proposta');
  });

  it('deve manter o estado atual se a intent não for válida', () => {
    expect(runIntent('levantamento', 'invalido' as BotState)).toBe('levantamento');
    expect(runIntent('abordagem', 'invalido' as BotState)).toBe('abordagem');
  });

  it('deve permitir fluxo completo: abordagem → levantamento → proposta → objecoes → negociacao → fechamento → pos_venda → reativacao → encerramento', () => {
    const sequence: BotState[] = [
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
    let current = sequence[0];
    for (let i = 1; i < sequence.length; i++) {
      const intent = sequence[i];
      const next = runIntent(current, intent);
      expect(next).toBe(intent);
      current = next;
    }
  });

  it('deve encerrar após 2 tentativas inválidas seguidas', () => {
    const actor = createActor(funnelMachine).start();

    expect(actor.getSnapshot().value).toBe('abordagem');

    actor.send({ type: 'INTENT', intent: 'invalido' });
    actor.send({ type: 'INTENT', intent: 'invalido' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('encerramento');
    expect(snapshot.done).toBe(true);
  });

  it('deve chamar logger ao entrar no estado encerramento', () => {
    const actor = createActor(funnelMachine).start();

    actor.send({ type: 'INTENT', intent: 'invalido' });
    actor.send({ type: 'INTENT', intent: 'invalido' });

    expect(logger.info).toHaveBeenCalledWith('[XState] Estado final atingido: encerramento');
  });
});
