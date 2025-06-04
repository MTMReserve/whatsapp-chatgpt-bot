// src/tests/unit/aiStateDecider.test.ts

import { getNextStateByAI } from '../../../src/services/aiStateDecider';
import * as openaiModule from '../../../src/api/openai';
import * as resumoModule from '../../../src/services/resumoDoHistorico';

describe('getNextStateByAI', () => {
  const spyCreateChatCompletion = jest.spyOn(openaiModule, 'createChatCompletion');
  const spyResumo = jest.spyOn(resumoModule, 'gerarResumoDoHistorico');

  const inputBase = {
    currentState: 'levantamento',
    userMessage: 'quero saber o preço',
    phone: '999999999'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o próximo estado sugerido pela IA', async () => {
    spyResumo.mockResolvedValue('Resumo falso para testes');
    spyCreateChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'proposta' } }]
    } as any);

    const result = await getNextStateByAI(inputBase);
    expect(result.nextState).toBe('proposta');
  });

  it('deve retornar o estado atual se a IA sugerir um estado inválido', async () => {
    spyResumo.mockResolvedValue('Resumo teste');
    spyCreateChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'etapa_invalida' } }]
    } as any);

    const result = await getNextStateByAI(inputBase);
    expect(result.nextState).toBe('levantamento');
  });

  it('deve retornar o estado atual se a IA responder com vazio', async () => {
    spyResumo.mockResolvedValue('Resumo teste');
    spyCreateChatCompletion.mockResolvedValue({
      choices: [{ message: { content: '' } }]
    } as any);

    const result = await getNextStateByAI(inputBase);
    expect(result.nextState).toBe('levantamento');
  });

  it('deve retornar o estado atual se ocorrer erro na chamada da IA', async () => {
    spyResumo.mockResolvedValue('Resumo teste');
    spyCreateChatCompletion.mockRejectedValue(new Error('Falha na IA'));

    const result = await getNextStateByAI(inputBase);
    expect(result.nextState).toBe('levantamento');
  });

  it('deve retornar o estado atual se gerarResumoDoHistorico falhar', async () => {
    spyResumo.mockRejectedValue(new Error('Erro no histórico'));
    spyCreateChatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'proposta' } }]
    } as any);

    const result = await getNextStateByAI(inputBase);
    expect(result.nextState).toBe('levantamento');
  });
});
