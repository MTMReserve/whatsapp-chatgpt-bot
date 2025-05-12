// src/tests/unit/conversationManager.test.ts

import * as prompts from '../../../src/prompts';
import * as clientRepo from '../../../src/services/clientRepository';
import * as stateMachine from '../../../src/services/stateMachine';
import * as extractor from '../../../src/services/dataExtractor';
import { handleMessage, getSystemPrompt } from '../../../src/services/conversationManager';

jest.mock('../../../src/services/clientRepository');

describe('ConversationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o prompt de sistema correto', () => {
    expect(getSystemPrompt()).toEqual(prompts.perfilClientePrompt);
  });

  it('deve buscar cliente, atualizar estado e retornar prompt', async () => {
    const mockClient = {
      phone: '5511999999999',
      current_state: 'abordagem',
      name: 'Teste'
    };

    (clientRepo.ClientRepository.findOrCreate as jest.Mock).mockResolvedValue(mockClient);
    jest.spyOn(stateMachine, 'getNextState').mockResolvedValue('levantamento');
    (clientRepo.ClientRepository.updateState as jest.Mock).mockResolvedValue(undefined);
    (clientRepo.ClientRepository.updateField as jest.Mock).mockResolvedValue(undefined);

    const response = await handleMessage(mockClient.phone, 'quero cortar o cabelo', { isAudio: false });

    expect(clientRepo.ClientRepository.findOrCreate).toHaveBeenCalledWith(mockClient.phone);
    expect(clientRepo.ClientRepository.updateState).toHaveBeenCalledWith(mockClient.phone, 'levantamento');
    expect(clientRepo.ClientRepository.updateField).toHaveBeenCalledWith(mockClient.phone, 'needs', 'quero cortar o cabelo');
    expect(response.text).toBe(prompts.levantamentoPrompt);
  });

  it('deve extrair e salvar nome com extractName()', async () => {
    const mockClient = {
      phone: '5511999999999',
      current_state: 'abordagem',
      name: 'Cliente'
    };

    (clientRepo.ClientRepository.findOrCreate as jest.Mock).mockResolvedValue(mockClient);
    jest.spyOn(stateMachine, 'getNextState').mockResolvedValue('abordagem');
    jest.spyOn(extractor, 'extractName').mockReturnValue('João');
    jest.spyOn(extractor, 'extractNameSmart').mockResolvedValue(null); // não deve ser chamado

    const updateFieldSpy = jest.spyOn(clientRepo.ClientRepository, 'updateField').mockResolvedValue();

    const response = await handleMessage(mockClient.phone, 'meu nome é João', { isAudio: false });

    expect(updateFieldSpy).toHaveBeenCalledWith(mockClient.phone, 'name', 'João');
    expect(response.text).toBe(prompts.perfilClientePrompt);
  });

  it('deve usar extractNameSmart() quando extractName() falhar', async () => {
    const mockClient = {
      phone: '5511999999999',
      current_state: 'abordagem',
      name: 'Cliente'
    };

    (clientRepo.ClientRepository.findOrCreate as jest.Mock).mockResolvedValue(mockClient);
    jest.spyOn(stateMachine, 'getNextState').mockResolvedValue('abordagem');
    jest.spyOn(extractor, 'extractName').mockReturnValue(null);
    jest.spyOn(extractor, 'extractNameSmart').mockResolvedValue('Carlos');

    const updateFieldSpy = jest.spyOn(clientRepo.ClientRepository, 'updateField').mockResolvedValue();

    const response = await handleMessage(mockClient.phone, 'aqui é o Carlos', { isAudio: false });

    expect(updateFieldSpy).toHaveBeenCalledWith(mockClient.phone, 'name', 'Carlos');
    expect(response.text).toBe(prompts.perfilClientePrompt);
  });

  it('não deve salvar nome se extractName() e extractNameSmart() falharem', async () => {
    const mockClient = {
      phone: '5511999999999',
      current_state: 'abordagem',
      name: 'Cliente'
    };

    (clientRepo.ClientRepository.findOrCreate as jest.Mock).mockResolvedValue(mockClient);
    jest.spyOn(stateMachine, 'getNextState').mockResolvedValue('abordagem');
    jest.spyOn(extractor, 'extractName').mockReturnValue(null);
    jest.spyOn(extractor, 'extractNameSmart').mockResolvedValue(null);

    const updateFieldSpy = jest.spyOn(clientRepo.ClientRepository, 'updateField').mockResolvedValue();

    const response = await handleMessage(mockClient.phone, 'oi tudo bem?', { isAudio: false });

    expect(updateFieldSpy).not.toHaveBeenCalledWith(mockClient.phone, 'name', expect.any(String));
    expect(response.text).toBe(prompts.perfilClientePrompt);
  });
});
