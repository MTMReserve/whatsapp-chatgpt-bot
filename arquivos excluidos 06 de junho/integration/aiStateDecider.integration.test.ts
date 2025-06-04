
import * as aiStateDecider from '../../../src/services/aiStateDecider';
import { handleMessage } from '../../../src/services/conversationManager';
import { ClientRepository } from '../../../src/services/clientRepository';

jest.mock('../../../src/services/clientRepository');

describe('aiStateDecider Integration', () => {
  const phone = '+5511999999999';
  const currentState = '01-abordagem';
  const userMessage = 'quero comprar um produto';

  beforeAll(() => {
    jest.spyOn(aiStateDecider, 'getNextStateByAI').mockResolvedValue({ nextState: '02-levantamento' });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call handleMessage and update state using AI', async () => {
    const updateStateSpy = jest.spyOn(ClientRepository, 'updateState').mockResolvedValue(undefined);

    const result = await handleMessage(phone, currentState, userMessage);

    expect(result).toBeDefined();
    expect(aiStateDecider.getNextStateByAI).toHaveBeenCalledWith({
      phone,
      currentState,
      userMessage,
    });
    expect(updateStateSpy).toHaveBeenCalledWith(phone, '02-levantamento');
  });
});
