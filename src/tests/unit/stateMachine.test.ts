// src/tests/unit/stateMachine.test.ts

import { getNextState } from '../../services/stateMachine';
import type { BotState } from '../../services/intentMap';

describe('Máquina de Estados – getNextState()', () => {
  it('deve manter o fluxo padrão: abordagem -> levantamento', () => {
    const next = getNextState('abordagem', 'Quero saber mais', {});
    expect(next).toBe('levantamento');
  });

  it('deve redirecionar encerramento precoce para levantamento', () => {
    const next = getNextState('abordagem', 'Não tenho interesse', {});
    expect(next).toBe('levantamento');
  });

  it('deve redirecionar fechamento precoce para proposta', () => {
    const next = getNextState('abordagem', 'Fechado! Vamos marcar', {});
    expect(next).toBe('proposta');
  });

  it('deve aceitar fluxo direto válido: levantamento -> proposta', () => {
    const next = getNextState('levantamento', 'Me explica como funciona?', {});
    expect(next).toBe('proposta');
  });

  it('deve manter estado atual se mensagem não gera intenção forte', () => {
    const next = getNextState('levantamento', 'lorem ipsum dolor', {});
    expect(next).toBe('levantamento');
  });

  it('deve retornar estado atual em caso de erro', () => {
    const next = getNextState('levantamento', null as any, {});
    expect(next).toBe('levantamento');
  });

  it('deve forçar encerramento após número máximo de repetições', () => {
    const context = {
      retries: {
        levantamento: 3, // atingiu o limite
      },
    };
    const next = getNextState('levantamento', 'Me explica como funciona?', context);
    expect(next).toBe('encerramento');
  });

  it('deve permanecer no estado atual se intenção não for forte o suficiente', () => {
    const context = {
      retries: {
        levantamento: 1,
      },
    };
    const next = getNextState('levantamento', 'texto genérico aleatório', context);
    expect(next).toBe('levantamento');
  });
});
