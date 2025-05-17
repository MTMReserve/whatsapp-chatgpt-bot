// src/tests/unit/prompts.test.ts

import * as prompts from '../../../src/prompts';

describe('prompts', () => {
  it('deve importar todos os prompts disponíveis corretamente', () => {
    // Assegura que cada prompt está definido e é string ou objeto
    const expectedPrompts = [
      'perfilClientePrompt',
      'abordagemPrompt',
      'levantamentoPrompt',
      'propostaPrompt',
      'objecoesPrompt',
      'negociacaoPrompt',
      'fechamentoPrompt',
      'posVendaPrompt',
      'reativacaoPrompt',
      'encerramentoPrompt'
    ];

    expectedPrompts.forEach((key) => {
      expect(prompts[key]).toBeDefined();
    });
  });
});
