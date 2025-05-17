// src/tests/unit/intentFallback.test.ts

import { detectIntentWithFallback } from 'services/intentFallback';
import * as openai from 'api/openai';
import * as logger from 'utils/logger';
import { env } from 'config/env';
import type { BotState } from 'services/intentMap';

jest.mock('utils/logger'); // silencia logs e permite verificação

describe('IntentFallback – detectIntentWithFallback', () => {
  const mockChatCompletion = jest.fn();

  beforeAll(() => {
    // Substitui openai.openai.chat.completions.create por mock
    (openai as any).openai = {
      chat: {
        completions: {
          create: mockChatCompletion,
        },
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar a intenção diretamente do intentMap se reconhecida', async () => {
    const intent = await detectIntentWithFallback('abordagem', 'quero saber mais', {});
    expect(intent).toBe('levantamento'); // ← ajusta se necessário conforme seu intentMap
    expect(mockChatCompletion).not.toHaveBeenCalled();
  });

  it('deve retornar fallback do ChatGPT se intentMap não reconhecer', async () => {
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'proposta' } }],
    });

    const intent = await detectIntentWithFallback('levantamento', 'sei lá, me conta mais', {});
    expect(intent).toBe('proposta');
    expect(mockChatCompletion).toHaveBeenCalled();

    // Verifica prompt e modelo usados
    const chamada = mockChatCompletion.mock.calls[0][0];
    expect(chamada.model).toBe(env.OPENAI_MODEL);
    expect(chamada.messages[0].role).toBe('system');
    expect(chamada.messages[1].content).toBe('sei lá, me conta mais');

    // Verifica logs
    expect(logger.debug).toHaveBeenCalledWith('[intentFallback] 🔍 Iniciando fallback de intenção via IA');
    expect(logger.info).toHaveBeenCalledWith('[intentFallback] ✅ Intenção reconhecida via fallback: "proposta"');
  });

  it('deve manter o estado atual se resposta do ChatGPT for inválida', async () => {
    mockChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'invalido' } }],
    });

    const intent = await detectIntentWithFallback('negociacao', 'blá blá blá', {});
    expect(intent).toBe('negociacao');

    expect(logger.warn).toHaveBeenCalledWith(
      '[intentFallback] ⚠️ Intenção inválida recebida do ChatGPT',
      { intent: 'invalido' }
    );
  });

  it('deve retornar o estado atual se ChatGPT falhar', async () => {
    mockChatCompletion.mockRejectedValue(new Error('falha de rede'));

    const intent = await detectIntentWithFallback('levantamento', '???', {});
    expect(intent).toBe('levantamento');

    expect(logger.error).toHaveBeenCalledWith(
      '[intentFallback] ❌ Erro ao consultar ChatGPT (fallback)',
      expect.objectContaining({ erroDetalhado: 'falha de rede' })
    );
  });
});
