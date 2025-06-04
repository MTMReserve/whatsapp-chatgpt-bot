/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import createApp from 'app'; // ✅ Import absoluto
import { limiter } from 'middlewares/rateLimiterMiddleware';

// ✅ Mock do envio de texto para evitar chamadas reais à API do WhatsApp
jest.mock('api/whatsapp', () => ({
  sendText: jest.fn().mockResolvedValue(undefined),
  sendAudio: jest.fn().mockResolvedValue(undefined),
  downloadMedia: jest.fn().mockResolvedValue(Buffer.from('mock audio')),
}));

// ✅ Mock do OpenAI (caso precise usar GPT no futuro)
jest.mock('api/openai', () => ({
  openaiClient: {
    chat: {
      create: jest.fn().mockResolvedValue({
        data: { choices: [{ message: { content: 'OK' } }] },
      }),
    },
  },
}));

// ✅ Mock do Twilio (caso usado)
jest.mock('api/twilio', () => ({
  twilioClient: {
    messages: { create: jest.fn().mockResolvedValue({ sid: 'SM123' }) },
  },
}));

describe('E2E /webhook', () => {
  const app = createApp();

  beforeAll(() => {
    process.env.HUMANIZER_MIN_DELAY_MS = '0';
    process.env.HUMANIZER_MAX_DELAY_MS = '0';
    jest.spyOn(limiter, 'consume').mockResolvedValue(undefined as any);
  });

  it('GET /webhook → 200 OK', async () => {
    const res = await request(app).get('/webhook');
    expect(res.status).toBe(200);
  });

  it('POST /webhook → 200 OK', async () => {
    const res = await request(app).post('/webhook').send({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '12345',
                    text: { body: 'Olá' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(res.status).toBe(200);
  });
});
