// src/tests/integration/conversationManager.fechamento.integration.test.ts

import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import { handleMessage } from '../../../src/services/conversationManager';
import { ClientRepository } from '../../../src/services/clientRepository';
import * as dataExtractor from '../../../src/services/dataExtractor';
import * as produtoMap from '../../../src/produto/produtoMap';
import { botPersona } from '../../../src/persona/botPersona';
import { createDbPool, closeDbPool } from '../../../src/utils/db';

jest.mock('../../../src/services/dataExtractor');
jest.mock('../../../src/api/openai', () => ({
  openai: {
    createChatCompletion: jest.fn().mockResolvedValue({
      content: 'Mensagem gerada pelo bot'
    })
  }
}));
jest.mock('../../../src/services/interactionMongoService', () => ({
  saveMessageToMongo: jest.fn(),
  getConversationByPhone: jest.fn().mockResolvedValue([])
}));
jest.mock('../../../src/repositories/interactionsRepository', () => ({
  saveInteraction: jest.fn()
}));

const mockClient = {
  id: 1,
  name: 'Cliente',
  phone: '5511999999999',
  current_state: '06-fechamento'
};

describe('ConversationManager - Etapa de Fechamento', () => {
  beforeAll(async () => {
    await createDbPool();

    // Mock das funções estáticas da classe
    jest.spyOn(ClientRepository, 'findOrCreate').mockResolvedValue(mockClient as any);
    jest.spyOn(ClientRepository, 'updateState').mockResolvedValue();
    jest.spyOn(ClientRepository, 'updateField').mockResolvedValue();
    jest.spyOn(ClientRepository, 'updateLastInteraction').mockResolvedValue();

    // Mock da extração de dados
    jest.spyOn(dataExtractor, 'extrairInfoParaProximaEtapa').mockReturnValue({
      payment_method: 'PIX',
      address: 'Rua das Flores, 123'
    });

    // Mock do produto
    jest.spyOn(produtoMap, 'getProdutoInfo').mockReturnValue({
      nome: 'Micropigmentação de Barba',
      descricao: 'Transforme sua barba com nossa técnica exclusiva.',
      formasPagamento: 'PIX, Cartão, Dinheiro',
      instrucoesPagamento: 'Pagamento no dia do agendamento.',
      entrega: 'Presencial na barbearia.',
      instrucoesEntrega: 'Chegar com 15 minutos de antecedência.'
    });
  });

  afterAll(async () => {
    await closeDbPool();
    jest.restoreAllMocks();
  });

  it('deve processar a etapa de fechamento e gerar resposta com base no produto', async () => {
    const resposta = await handleMessage('5511999999999', 'Ok, como funciona o pagamento?');

    expect(resposta).toBeDefined();
    expect(resposta).toContain('Micropigmentação de Barba');
    expect(resposta).toContain('formas de pagamento');
    expect(ClientRepository.updateState).toHaveBeenCalledWith(
      '5511999999999',
      '07-posvenda'
    );
  });
});
