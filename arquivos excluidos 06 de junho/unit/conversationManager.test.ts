
// src/tests/unit/conversationManager.expanded.test.ts

import * as clientRepo from '../../../src/services/clientRepository';
import * as dataExtractor from '../../../src/services/dataExtractor';
import * as openai from '../../../src/api/openai';
import { handleMessage } from '../../../src/services/conversationManager';

jest.mock('../../../src/services/clientRepository');

describe('conversationManager - testes expandidos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar resposta com resumo do histórico incluído no prompt', async () => {
    const mockClient = {
      phone: '5511999999999',
      id: 1,
      current_state: 'levantamento',
      name: 'João'
    };

    jest.spyOn(clientRepo.ClientRepository, 'findOrCreate').mockResolvedValue(mockClient);
    jest.spyOn(clientRepo.ClientRepository, 'updateState').mockResolvedValue(undefined);
    jest.spyOn(clientRepo.ClientRepository, 'updateField').mockResolvedValue(undefined);
    jest.spyOn(clientRepo.ClientRepository, 'updateLastInteraction').mockResolvedValue(undefined);

    jest.spyOn(dataExtractor, 'extractNeeds').mockResolvedValue('corte de cabelo');
    jest.spyOn(dataExtractor, 'extractName').mockReturnValue('João');

    jest.spyOn(require('../../../src/services/validadorMultiplos'), 'validarTodosCamposPorEtapa').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/services/resumoDoHistorico'), 'gerarResumoDoHistorico').mockResolvedValue('Histórico do João');
    jest.spyOn(require('../../../src/services/analyzeClientProfile'), 'analyzeClientProfileIfNeeded').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/utils/temperatureDecider'), 'definirTemperaturaDinamica').mockReturnValue(0.7);
    jest.spyOn(require('../../../src/repositories/interactionsRepository'), 'saveInteraction').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/repositories/mongo/interactionLog.mongo'), 'saveInteractionLog').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/services/intentFallback'), 'detectIntentWithFallback').mockResolvedValue('levantamento');
    jest.spyOn(require('../../../src/services/aiStateDecider'), 'getNextStateByAI').mockResolvedValue({ nextState: 'levantamento' });
    jest.spyOn(require('../../../src/produto/produtoMap'), 'getProdutoInfo').mockReturnValue({
      nome: 'Produto Teste',
      descricao: 'Descrição do produto',
      preco: 'R$ 100',
      beneficios: ['Benefício 1', 'Benefício 2'],
      promocao: 'Promoção válida até hoje',
      garantias: 'Garantia de 7 dias'
    });

    const mockOpenAi = jest.spyOn(openai.openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: 'Resposta da IA com histórico' } }]
    } as any);

    const response = await handleMessage(mockClient.phone, 'quero cortar o cabelo', { isAudio: false });

    expect(response.text).toContain('Resposta da IA com histórico');
    expect(mockOpenAi).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('Histórico do João')
          })
        ])
      })
    );
  });

  it('deve gerar resposta de voz se isAudio for true', async () => {
    const mockClient = {
      phone: '5511999999999',
      id: 1,
      current_state: 'levantamento',
      name: 'João'
    };

    jest.spyOn(clientRepo.ClientRepository, 'findOrCreate').mockResolvedValue(mockClient);
    jest.spyOn(clientRepo.ClientRepository, 'updateState').mockResolvedValue(undefined);
    jest.spyOn(clientRepo.ClientRepository, 'updateField').mockResolvedValue(undefined);
    jest.spyOn(clientRepo.ClientRepository, 'updateLastInteraction').mockResolvedValue(undefined);

    jest.spyOn(require('../../../src/services/validadorMultiplos'), 'validarTodosCamposPorEtapa').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/services/resumoDoHistorico'), 'gerarResumoDoHistorico').mockResolvedValue('');
    jest.spyOn(require('../../../src/services/analyzeClientProfile'), 'analyzeClientProfileIfNeeded').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/utils/temperatureDecider'), 'definirTemperaturaDinamica').mockReturnValue(0.7);
    jest.spyOn(require('../../../src/repositories/interactionsRepository'), 'saveInteraction').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/repositories/mongo/interactionLog.mongo'), 'saveInteractionLog').mockResolvedValue(undefined);
    jest.spyOn(require('../../../src/services/intentFallback'), 'detectIntentWithFallback').mockResolvedValue('levantamento');
    jest.spyOn(require('../../../src/services/aiStateDecider'), 'getNextStateByAI').mockResolvedValue({ nextState: 'levantamento' });
    jest.spyOn(require('../../../src/produto/produtoMap'), 'getProdutoInfo').mockReturnValue({
      nome: 'Produto Teste',
      descricao: 'Descrição do produto',
      preco: 'R$ 100',
      beneficios: ['Benefício 1', 'Benefício 2']
    });

    jest.spyOn(openai.openai.chat.completions, 'create').mockResolvedValue({
      choices: [{ message: { content: 'Resposta de áudio' } }]
    } as any);

    jest.spyOn(require('../../../src/services/audioService').audioService, 'synthesizeSpeech').mockResolvedValue(Buffer.from('audio'));

    const response = await handleMessage(mockClient.phone, 'quero corte de cabelo', { isAudio: true });

    expect(response.text).toBe('Resposta de áudio');
    expect(response.audioBuffer).toBeInstanceOf(Buffer);
  });
});
