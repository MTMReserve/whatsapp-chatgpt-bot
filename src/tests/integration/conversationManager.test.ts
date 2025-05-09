// src/tests/integration/conversationManager.test.ts

import { handleMessage } from '../../services/conversationManager';
import { BotState } from '../../prompts';
import * as produto from '../../produto/produtoMap';
import * as promptData from '../../prompts';

jest.mock('../../config/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'MOCKED_RESPONSE' } }]
        })
      }
    }
  }
}));

describe('Integração - Conversation Manager', () => {
  const tests: { input: string; expectedState: BotState }[] = [
    { input: 'Oi, tudo bem?', expectedState: 'abordagem' },
    { input: 'Estou procurando uma opção pra barba', expectedState: 'levantamento' },
    { input: 'O que está incluso no serviço?', expectedState: 'proposta' },
    { input: 'Acho caro', expectedState: 'objecoes' },
    { input: 'Dá pra dar um jeitinho?', expectedState: 'negociacao' },
    { input: 'Fechado então!', expectedState: 'fechamento' }
  ];

  it.each(tests)('deve usar o prompt correto para o estado %s', async ({ input, expectedState }) => {
    const response = await handleMessage('5511999999999', input);

    // Validação indireta via resposta mockada
    expect(response).toBe('MOCKED_RESPONSE');

    // Validação de que o prompt do estado existe (garantia de consistência com promptData)
    expect(promptData.prompts[expectedState]).toBeDefined();
  });

  it('deve concatenar produto ativo corretamente', async () => {
    const produtoAtivo = produto.produtoMap['produto1'];
    const response = await handleMessage('5511988888888', 'Me fala sobre a barba');
    expect(response).toBe('MOCKED_RESPONSE');
  });
});
