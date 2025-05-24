// src/tests/integration/fechamento.integration.test.ts

import { type ProdutoID } from '../../../src/produto/produtoMap';
import fechamentoPrompt from '../../../src/prompts/06-fechamento';

describe('Etapa de Fechamento - Prompt Dinâmico', () => {
  const testCases: {
    produtoId: ProdutoID;
    esperado: string[];
    ausente?: string[];
  }[] = [
    {
      produtoId: 'produto1',
      esperado: [
        'Formas de pagamento aceitas',
        'Pagamento via Pix',
        'Tipo de entrega',
        'Compareça à barbearia'
      ]
    },
    {
      produtoId: 'produto2',
      esperado: [],
      ausente: [
        'Formas de pagamento aceitas',
        'Pagamento via Pix',
        'Tipo de entrega',
        'Compareça à barbearia'
      ]
    }
  ];

  testCases.forEach(({ produtoId, esperado, ausente }) => {
    it(`gera prompt corretamente para ${produtoId}`, () => {
      const prompt = fechamentoPrompt(produtoId);

      esperado.forEach((trecho) => {
        expect(prompt).toContain(trecho);
      });

      ausente?.forEach((trecho) => {
        expect(prompt).not.toContain(trecho);
      });
    });
  });
});
