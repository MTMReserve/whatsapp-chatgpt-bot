// src/tests/unit/intentMap.test.ts

import { classifyIntent } from '../../services/stateMachine';

describe('Intent Classification', () => {
  it('deve identificar abordagem corretamente', () => {
    const state = classifyIntent('Oi, tudo bem?');
    expect(state).toBe('abordagem');
  });

  it('deve identificar levantamento corretamente', () => {
    const state = classifyIntent('Gostaria de entender melhor os serviços');
    expect(state).toBe('levantamento');
  });

  it('deve identificar proposta corretamente', () => {
    const state = classifyIntent('Pode me explicar o que está incluso?');
    expect(state).toBe('proposta');
  });

  it('deve identificar objeções corretamente', () => {
    const state = classifyIntent('Tá caro demais isso aí');
    expect(state).toBe('objecoes');
  });

  it('deve identificar negociação corretamente', () => {
    const state = classifyIntent('Tem como dar um desconto à vista?');
    expect(state).toBe('negociacao');
  });

  it('deve identificar fechamento corretamente', () => {
    const state = classifyIntent('Fechado! Bora marcar');
    expect(state).toBe('fechamento');
  });

  it('deve identificar pós-venda corretamente', () => {
    const state = classifyIntent('Gostei muito do resultado, parabéns!');
    expect(state).toBe('pos_venda');
  });

  it('deve identificar reativação corretamente', () => {
    const state = classifyIntent('Voltei! Vamos retomar nossa conversa');
    expect(state).toBe('reativacao');
  });

  it('deve identificar encerramento corretamente', () => {
    const state = classifyIntent('Por enquanto não tenho interesse');
    expect(state).toBe('encerramento');
  });

  it('deve retornar default para frases neutras', () => {
    const state = classifyIntent('Lorem ipsum dolor sit amet');
    expect(state).toBe('levantamento');
  });
});
