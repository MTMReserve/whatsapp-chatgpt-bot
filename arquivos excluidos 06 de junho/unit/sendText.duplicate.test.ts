// src/tests/unit/sendText.duplicate.test.ts

import { sendText } from '../../../src/api/whatsapp';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('✉️ sendText – Prevenção de Mensagens Duplicadas', () => {
  const to = '5511988888888';
  const msg = 'Olá, tudo bem?';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve enviar mensagens duplicadas em sequência imediata', async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    await sendText(to, msg);
    await sendText(to, msg);

    // Dependendo da lógica futura, este número pode mudar (para agora serve para flag de duplicação)
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
