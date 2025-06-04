// src/tests/unit/conversationManager.duplicate.test.ts

import * as whatsapp from '../../../src/api/whatsapp';
import * as conversationManager from '../../../src/services/conversationManager';

jest.mock('../../../src/api/whatsapp');

describe('🔁 Duplicação de Mensagens – handleMessage', () => {
  const to = '5511988888888';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar sendText apenas uma vez por execução', async () => {
    const mockSendText = jest.spyOn(whatsapp, 'sendText').mockResolvedValue();

    await conversationManager.handleMessage(to, 'Oi, quero saber mais');

    expect(mockSendText).toHaveBeenCalledTimes(1);
    expect(mockSendText).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });
});
