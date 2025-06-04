// src/tests/integration/webhookController.duplicate.integration.test.ts

import request from 'supertest';
import createApp from '../../../src/app';
import * as conversationManager from '../../../src/services/conversationManager';

jest.mock('../../../src/services/conversationManager');

describe('🌐 WebhookController – Prevenção de Duplicação', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar handleMessage uma vez por evento válido', async () => {
    const mockHandle = jest.spyOn(conversationManager, 'handleMessage').mockResolvedValue();

    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5511988888888',
                    type: 'text',
                    text: { body: 'Olá' },
                    id: 'wamid.TESTE123',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await request(app).post('/webhook').send(payload);

    expect(mockHandle).toHaveBeenCalledTimes(1);
  });
});
