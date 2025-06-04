// src/tests/unit/openaiWrapper.test.ts

import { createChatCompletion, openai } from '../../../src/api/openai';
import { logger } from '../../../src/utils/logger';

jest.mock('../../../src/utils/logger');

describe('createChatCompletion', () => {
  const mockCreate = jest.fn();

  beforeAll(() => {
    // Substitui openai.chat.completions.create por um mock
    (openai as any).chat = {
      completions: {
        create: mockCreate,
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar a API com os parâmetros corretos e retornar a resposta', async () => {
    const fakeResponse = {
      choices: [{ message: { content: 'Olá, posso te ajudar!' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };

    mockCreate.mockResolvedValue(fakeResponse);

    const messages = [{ role: 'user', content: 'Olá' }];
    const res = await createChatCompletion(messages, {
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      messages,
    });

    expect(logger.debug).toHaveBeenCalledWith('[openai] Criando chat completion', {
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      messages,
    });

    expect(logger.debug).toHaveBeenCalledWith('[openai] Completion recebida', {
      finish_reason: 'stop',
      usage: fakeResponse.usage,
    });

    expect(res).toBe(fakeResponse);
  });

  it('deve usar model e temperature padrão se não fornecido', async () => {
    const defaultModel = 'gpt-4';
    process.env.OPENAI_MODEL = defaultModel;
    process.env.OPENAI_TEMPERATURE = '0.5';

    const messages = [{ role: 'user', content: 'Teste padrão' }];
    mockCreate.mockResolvedValue({ choices: [{}] });

    await createChatCompletion(messages);

    expect(mockCreate).toHaveBeenCalledWith({
      model: defaultModel,
      temperature: 0.5,
      messages,
    });
  });

  it('deve lançar e logar erro caso a chamada falhe', async () => {
    const erroSimulado = new Error('Falha na API');
    mockCreate.mockRejectedValue(erroSimulado);

    const messages = [{ role: 'user', content: 'Erro?' }];

    await expect(createChatCompletion(messages)).rejects.toThrow('Falha na API');

    expect(logger.error).toHaveBeenCalledWith('[openai] Erro na criação do chat completion', {
      error: erroSimulado,
    });
  });
});
